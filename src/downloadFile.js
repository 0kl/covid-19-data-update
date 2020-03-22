const https = require('https');
const fs = require('fs');
const md5 = require('md5');
const { ProcessingError } = require('./errorHandling');

function downloadFileAndHash(filePath, fileURI) {
    return new Promise((resolve, reject) => {
        var file = fs.createWriteStream(filePath);
        https.get(fileURI, (res) => {
            res.pipe(file);
            file.on('finish', () => {
                file.close(() => {
                    const buff = fs.readFileSync(filePath);
                    return resolve(md5(buff))
                });  // close() is async, call cb after close completes.
            });
        }).on('error', (e) => {
            fs.unlink(filePath);
            return reject(e);
        });
    })
}

async function createFileStatus(client, fileURI, hash) {
    const selectQuery = `SELECT origin_src, file_hash, status_code FROM ingest_file_status WHERE file_hash = '${hash}' LIMIT 1;`;
    console.log(selectQuery)
    let { rows } = await client.query(selectQuery);
    if (!rows.length) {
        const insertQuery = `INSERT INTO ingest_file_status (
            origin_src
            , file_hash
            , status_code
            , processor_type
        ) VALUES (
            $1, '${hash}', 1, 1
        ) returning id;`
        rows = (await client.query(insertQuery, [fileURI])).rows;
        return rows[0]['id'];
    }
    const fileStatus = +(rows[0]['origin_src']);
    if (fileStatus) { throw new ProcessingError("There was an existing processing error for this file, please fix and reset", fileStatus) }
    if (fileURI == rows[0]['origin_src']) { throw new Error("Duplicate URI and Hash, check error status") }
    throw new Error("File Hash exists, but is from a different URI");
};
module.exports = { downloadFileAndHash, createFileStatus }