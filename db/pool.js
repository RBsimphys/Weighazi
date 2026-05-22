const { Pool } = require('pg');


module.exports = new Pool({
    host: 'localhost',
    user: 'rami',
    database: 'root',
    password: '9678',
    port: 5432,
})
