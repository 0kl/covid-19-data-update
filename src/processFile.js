
const sources = require('./sources.js');

const pool = require('./db');
const { csbsAdapter } = require('./dataAdapters')
// var AWS = require('aws-sdk');
const csv = require('fast-csv');
const fs = require('fs');

const { ProcessingError } = require('./errorHandling')
const { FILE_STATUS } = require('./constants')
const { saveToDBv4, saveToDBv3 } = require('./dataStores/dbAapters');

async function processFile(filePath, hash, adapterType, dbVersion) {
    const processingClient = await pool.connect();
    let adapter;
    let saveToDB;
    switch (adapterType) {
        case 'csbs': adapter = csbsAdapter; break;
        default: throw new ProcessingError(`No valid adapter for ${adapterType}`, FILE_STATUS.ERROR_ADAPTER)
    }
    switch (+dbVersion) {
        case 4: saveToDB = saveToDBv4; break;
        case 3: saveToDB = saveToDBv3; break;
        default: throw new ProcessingError(`DB version of ${dbVersion} is unknown!`, FILE_STATUS.ERROR_ADAPTER)
    }
    try {
        await processingClient.query("BEGIN");
        const rows = [];
        await new Promise((resolve, reject) => {
            const stream = fs.createReadStream(filePath)
            csv.parseStream(stream, { headers: true })
                // .pipe(csv.format({ headers: true }))
                .transform(adapter)
                .on('data', row => { rows.push(row) })
                .on('error', reject)
                .on('end', () => {
                    Promise.all(rows.map(saveToDB.bind(this, processingClient, adapterType))).then(resolve).catch(reject);
                });
        });
        await processingClient.query("COMMIT");
    } catch (e) {
        await processingClient.query("ROLLBACK");
        throw new ProcessingError("processFile.js Error: " + e.message, FILE_STATUS.ERROR_PUTTING_INTO_DB)
    } finally {
        await processingClient.release();
    }
    return
}


module.exports = { processFile }