const { Pool } = require('pg');


module.exports = new Pool({
    host: 'localhost',
    user: 'rami',
    database: 'weighjazi',
    password: '9678',
    port: 5432,
})