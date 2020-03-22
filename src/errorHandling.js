class ProcessingError extends Error {
    constructor(message, type) {
        super(message);
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        this.type = type;
        // This clips the constructor invocation from the stack trace.
        // It's not absolutely essential, but it does make the stack trace a little nicer.
        //  @see Node.js reference (bottom)
        Error.captureStackTrace(this, this.constructor);
    }
}
async function updateFileStatus(client, fileURI, hash) {
    const updateQuery = `UPDATE ingest_file_status 
            SET status_code = $1
            WHERE origin_src=$2
            AND file_hash=$3;`
    await client.query(updateQuery, [errorCode, fileURI, hash])
};
module.exports = {
    ProcessingError, updateFileStatus
}