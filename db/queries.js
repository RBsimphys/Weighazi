const pool = require("./pool.js");


async function getStartingWeight(id) {
    const result = await pool.query(
        `
    SELECT weight FROM weightlogs
    WHERE user_id = $1
    ORDER BY logged_at LIMIT 1;
    `,
        [id]
    );
    return result.rows[0].weight;
};

async function getCurrentWeight(id) {
    const result = await pool.query(
        `
    SELECT weight FROM weightlogs
    WHERE user_id = $1
    ORDER BY logged_at DESC LIMIT 1;
    `,
        [id]
    );
    return result.rows[0].weight;

}

async function getUserArray() {
    const { rows } = await pool.query(`
        WITH latest AS (
            SELECT DISTINCT ON (user_id) user_id, weight
            FROM weightlogs
            ORDER BY user_id, logged_at DESC
        )
        SELECT 
            u.*,
            l.weight AS current_weight,
            CASE
                WHEN u.goalweight = u.startingweight THEN 0
                -- Losing weight (starting > goal)
                WHEN u.startingweight > u.goalweight THEN
                    LEAST(100, 
                        (u.startingweight - l.weight) * 100.0 / (u.startingweight - u.goalweight)
                    )
                -- Gaining weight (starting < goal)
                ELSE
                    LEAST(100, 
                        (l.weight - u.startingweight) * 100.0 / (u.goalweight - u.startingweight)
                    )
            END AS progress
        FROM userdb u
        LEFT JOIN latest l ON u.id = l.user_id
        ORDER BY progress DESC;
    `);
    return rows;
};


async function getUser(id) {

    const { rows } = await pool.query(`
     WITH c AS (
    SELECT weight AS currentweight, user_id 
    FROM weightlogs
    WHERE user_id = $1 
    ORDER BY logged_at DESC
    LIMIT 1
)
SELECT 
    userdb.*,
    c.currentweight,
    CASE 
        WHEN userdb.goalweight = userdb.startingweight THEN 0
        -- Losing weight (starting > goal)
        WHEN userdb.startingweight > userdb.goalweight THEN
            LEAST(100,
                (userdb.startingweight - c.currentweight) * 100.0 / (userdb.startingweight - userdb.goalweight)
            )
        -- Gaining weight (starting < goal)
        ELSE
            LEAST(100,
                (c.currentweight - userdb.startingweight) * 100.0 / (userdb.goalweight - userdb.startingweight)
            )
    END AS progress        
FROM userdb
JOIN c ON c.user_id = userdb.id
WHERE userdb.id = $1;
        `, [id]);


    return rows[0];


}
async function addWeight(userId, weight) {
    const { rows } = await pool.query(
        `
        INSERT INTO weightlogs (user_id, weight, logged_at)
        VALUES ($1, $2, NOW())
        RETURNING *;
        `,
        [userId, Number(weight)]
    );

    return rows[0];
}

async function getWeightList(id) {

    const { rows } = await pool.query(
        `
    SELECT id, weight, logged_at
    FROM weightlogs
    WHERE user_id = $1
    ORDER BY logged_at;
    `,
        [id]
    );

    return rows;
}

async function deleteWeight(userid, weightid) {
    const result = await pool.query(
        `
        WITH log_count AS (
            SELECT COUNT(*) AS cnt FROM weightlogs WHERE user_id = $2
        )
        DELETE FROM weightlogs
        WHERE id = $1
        AND user_id = $2
        AND (SELECT cnt FROM log_count) > 1`,
        [weightid, userid]
    );
    return result.rowCount > 0; // true if deleted, false if it was the first log
}


async function createUser(userData, hashpassword) {

    const fullPhone =
        `+${userData.countrycode}${userData.phonenumbers.replace(/\D/g, "")}`;

    const query = `
        INSERT INTO userdb (
            name,
            height,
            age,
            goalweight,
            activitylevel,
            phonenumbers,
            startingweight,
            gender,
            password, 
            smsConsent
        )
        VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9, $10
        )
        RETURNING *;
    `;



    const values = [
        userData.name,
        Number(userData.height),
        Number(userData.age),
        Number(userData.goalweight),
        Number(userData.activitylevel),
        fullPhone,
        Number(userData.startingweight),
        userData.gender,
        hashpassword,
        userData.smsConsent
    ];

    try {

        const result = await pool.query(query, values);

        return result.rows[0];

    } catch (err) {

        console.error("createUser error:", err);

        throw err;
    }
}


async function createWeightLog(id, startingweight) {
    const query = `
        INSERT INTO weightlogs (
            user_id,
            weight
        )
        VALUES (
            $1,$2
        )
        RETURNING *;
    `;


    try {

        const result = await pool.query(query, [id, startingweight]);
        return result.rows[0];

    } catch (err) {
        console.error("createUser error:", err);
        throw err;
    }
}



async function findUserName(name) {
    try {
        const { rows } = await pool.query(
            `
            SELECT *
            FROM userdb
            WHERE LOWER(name) = LOWER($1)
            `,
            [name.trim()]
        );

        return rows[0] || null;

    } catch (err) {
        console.error("findUserName error:", err);
        throw err;
    }
}

module.exports = {
    getStartingWeight,
    getUserArray,
    getUser,
    addWeight,
    getWeightList,
    deleteWeight,
    createUser,
    createWeightLog,
    findUserName
};