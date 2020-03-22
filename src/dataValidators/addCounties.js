

const { csbsFipsAdapter } = require('../dataAdapters')
const { StateFips } = require('./fips')
const csv = require('fast-csv');
const fs = require('fs');
const pool = require('../db')


async function checkCounties(filePath, adapterType) {
    const processingClient = await pool.connect();
    let adapter;
    switch (adapterType) {
        case 'csbs': adapter = csbsFipsAdapter; break;
        default: return;
    }
    try {
        await processingClient.query(`
        CREATE TEMPORARY TABLE temp_counties (
            id character varying(5) NOT NULL,
            county character varying(50),
            state character varying(25),
            statefp character varying(2),
            countyfp character varying(3)
        );`)
        const rows = [];
        await new Promise((resolve, reject) => {
            const stream = fs.createReadStream(filePath)
            csv.parseStream(stream, { headers: true })
                .transform(adapter)
                .on('data', row => { rows.push(row) })
                .on('error', reject)
                .on('end', () => {
                    Promise.all(rows.map(insertIntoTempTable.bind(this, processingClient))).then(resolve).catch(reject);
                });
        });
        const getNewGeoIds = checkForNewGeoIds(processingClient);
        const getConflictCounties = checkForConflicts(processingClient);
        const [newGeoIds, conflictCounties] = await Promise.all([getNewGeoIds, getConflictCounties]);
        if (newGeoIds.length || conflictCounties.length) {
            console.log("new:", newGeoIds);
            console.log("conflicts:", conflictCounties);
            throw new Error("CONFLICTS");
        }
    } catch (e) {
        console.log(e);
        throw e;
    } finally {
        await processingClient.release();
    }
    return "test";
}
async function insertIntoTempTable(client, data) {
    return await client.query(`INSERT INTO temp_counties
        (id, county, state, statefp, countyfp)
        VALUES($1,$2,$3,$4,$5);`, [data.geoId, data.county, data.state, data.stateFP, data.countyFP]);
}
async function checkForNewGeoIds(client) {
    const missingGeoData = (await client.query(`
    SELECT * from temp_counties tc
    WHERE tc.id NOT IN (SELECT id FROM counties);
    `)).rows;
    const badData = missingGeoData.filter(missingData =>
        missingData.state.toUpperCase() != StateFips[missingData.statefp]);
    const newData = missingGeoData.filter(missingData => {
        console.log(missingData)
        console.log(missingData.statefp);
        console.log(StateFips[+missingData.statefp]);
        return missingData.state.toUpperCase() == StateFips[+missingData.statefp]
    });
    console.log("NEW DATA", newData);
    await Promise.all(newData.map(async ({ id, county, state, statefp, countyfp }) => {
        console.log("entering new data", [id, county, state, statefp, countyfp]);
        await client.query(`INSERT INTO counties
            (id, county, state, statefp, countyfp)
            VALUES ($1, $2, $3, $4, $5);`,
            [id, county, state, statefp, countyfp]);
    }));
    return badData;
}
async function checkForConflicts(client) {
    return (await client.query(`
        SELECT 
            current.id current_id
            ,conflict.id conflict_id
            ,current.county current_county
            ,conflict.county conflict_county
            ,current.state current_state
            ,conflict.state conflict_state
            ,current.statefp current_statefp
            ,conflict.statefp conflict_statefp
            ,current.countyfp current_countyfp
            ,conflict.countyfp conflict_countyfp
            from temp_counties conflict
        LEFT JOIN counties current ON current.id = conflict.id
        WHERE
            LOWER(REPLACE(current.county, ' ', '')) != LOWER(REPLACE(conflict.county, ' ', ''))
            OR LOWER(REPLACE(current.state, ' ', '')) != LOWER(REPLACE(conflict.state, ' ', ''));`
    )).rows
}

module.exports = { checkCounties }