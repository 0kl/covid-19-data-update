async function saveToDBv3(client, _src, data) {
    try {

        const insertQuery = `INSERT INTO cases (
            Geoid
            , Confirmed
            , NewConfirmed
            , Dead
            , NewDead
            , Fatality
            , UPDATE) VALUES ($1,$2,$3,$4,$5,$6,$7)`;
        await client.query(insertQuery, [
            data.geoId
            , data.confirmed
            , data.newConfirmed
            , data.dead
            , data.newDead
            , data.fatality
            , data.lastFileUpdate
        ]);
    } catch (e) {
        throw Error(e.message + `${data.geoId} - ${data.lastFileUpdate}`)
    }
    return true;
}
async function saveToDBv4(client, src, data) {
    try {

        const insertQuery = `INSERT INTO cases
        ( Geoid -- $1
            , Confirmed -- $2 
            , NewConfirmed -- $3
            , Dead -- $4
            , NewDead -- $5
            , Fatality -- $6
            , update -- $7
            , entry_date -- $8
            , Latitude --$9
            , Longitude -- $10
            , data_src -- $11
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT ON CONSTRAINT unique_report
            DO UPDATE SET
            Confirmed = $3
            , NewConfirmed = $3
            , Dead = $4
            , NewDead = $5
            , Fatality = $5
            , update = $7
            , entry_updates = entry_updates + 1
            WHERE cases.update < $7;	
            `;
        await client.query(insertQuery, [
            data.geoId
            , data.confirmed
            , data.newConfirmed
            , data.dead
            , data.newDead
            , data.fatality
            , data.lastFileUpdate
        ]);

    } catch (e) {
        throw Error(e.message + `${data.geoId} - ${data.lastFileUpdate}`)

    }
    return true;
}
module.exports = { saveToDBv3, saveToDBv4 }