const replace = require('replace-in-file');
const frPairs = require('./frPairs');

const from = frPairs.map(fr => new RegExp(fr.fs, 'g'))
const to = frPairs.map(fr => fr.rs);

const { ProcessingError, updateFileStatus } = require('./errorHandling')
const { FILE_STATUS } = require('./constants')

async function cleanFile(filePath) {
    try {
        const options = {
            files: filePath
            , from
            , to
        }
        await replace(options)
    } catch (err) {
        throw new ProcessingError("cleanFile.js Error:" + err.message, FILE_STATUS.ERROR_DURING_CLEAN)
    }

}


module.exports = { cleanFile }