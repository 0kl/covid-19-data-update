const { Pool } = require("pg");

const connectionString = process.env["DB_URI"] || "postgres://covid:goaway@localhost:5432/covid";

const settings = {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    connectionString
};

const pool = new Pool(settings);


module.exports = pool
