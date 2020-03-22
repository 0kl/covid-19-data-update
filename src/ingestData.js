const sources = require('./sources');

const pool = require('./db');
const { downloadFileAndHash,
    createFileStatus } = require('./downloadFile')
const { cleanFile } = require('./cleanFile');
const path = require('path');
const { ProcessingError, updateFileStatus } = require('./errorHandling')
const { processFile } = require('./processFile');
const { checkCounties } = require('./dataValidators/addCounties');
async function ingestData(/**filePath, fileURI*/) {
    const client = await pool.connect();


    try {
        const dbVersion = (await client.query(`SELECT version from schema_migrations`))['rows'][0]['version']

        await Promise.all(sources.map(async src => {
            const filePath = path.resolve(__dirname, "tmp", `${src.src}.csv`);
            console.log(dbVersion);
            let hash
            let fileId
            const fileURI = src.uri;
            try {
                hash = await downloadFileAndHash(filePath, fileURI);
                hash = "junk";


                if (dbVersion != 3) {
                    fileId = await createFileStatus(client, fileURI, hash);
                } else {
                    if (fileURI != "https://facts.csbs.org/covid-19/covid19_county_fips.csv") {
                        throw new Error("Trying to process new data in version 3 of the DB");
                    }
                }
                // await saveToS3(0, filePath, hash, fileURI)
                await cleanFile(filePath);
                await checkCounties(filePath, src.src)
                // await saveToS3(1, filePath, hash, fileURI)
                const x = await processFile(filePath, hash, src.src, dbVersion);
            } catch (e) {
                // await updateFileStatus(client, fileURI, hash);
                throw e;
            }
        }));
    } catch (e) {
        console.log("immediate error", e);
    } finally {
        await client.release();
        pool.end();
    }
}
ingestData();