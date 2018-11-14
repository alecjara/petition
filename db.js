const spicedPg = require('spiced-pg');
//const db = spicedPg(`postgres:postgres:postgres@localhost:5432/petition`);

const db = spicedPg(process.env.DATABASE_URL || `postgres:postgres:postgres@localhost:5432/petition`);

exports.getSigners = function() {
    return db.query('SELECT * FROM signatures');
};

exports.saveSigners= function(signature, user_id) {
    return db.query(`INSERT INTO signatures (signature, user_id)
    VALUES ($1, $2)
    RETURNING id`,
    [signature || null, user_id || null]);
};


exports.getSignature= function(id) {
    return db.query(`SELECT signature FROM signatures WHERE id = $1`,
        [id]);
};

exports.createUser = function(firstname, lastname, email, pass) {
    return db.query(`INSERT INTO users (firstname, lastname, email, pass)
    VALUES ($1, $2, $3, $4)
    RETURNING id, firstname, lastname`,
    [firstname || null, lastname || null, email || null, pass|| null]);
};

exports.getUser = function(email) {
    return db.query(
        `SELECT users.id AS "user_id", users.pass, signatures.id AS "signed"
        FROM users
        LEFT JOIN signatures ON users.id = signatures.user_id
        WHERE users.email = $1`,
        [email]
    );
};



exports.createUserProfiles = function(age, city, url, user_id) {
    return db.query(
        `INSERT INTO user_profiles (age, city, url, user_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
        [age || null, city, url, user_id]
    );
};

exports.getUserProfiles = function() {
    return db.query(
        `SELECT
        users.firstname AS firstname,
        users.lastname AS lastname,
        user_profiles.age AS age,
        user_profiles.city AS city,
        user_profiles.url AS url
        FROM users
        LEFT JOIN signatures
        ON signatures.user_id = users.id
        LEFT JOIN user_profiles
        ON signatures.user_id = user_profiles.user_id`
    );
};
//DO THIS FOR THE SIGNERS BY CITY:
exports.getSignersByCity = function(city) {
    return db.query(`
        SELECT
        users.firstname AS firstname,
        users.lastname AS lastname,
        user_profiles.age AS age,
        user_profiles.city AS city,
        user_profiles.url AS url
        FROM users
        LEFT JOIN signatures
        ON signatures.user_id = users.id
        LEFT JOIN user_profiles
        ON signatures.user_id = user_profiles.user_id
        WHERE LOWER(city) = LOWER($1)`,
    [city || null]
    );
};

exports.editProfile = input => {
    return db.query(
        `SELECT firstname, lastname, age, email, city, url
        FROM users
        LEFT JOIN user_profiles
        ON user_profiles.user_id = users.id
        WHERE user_id = $1`,
        [input || null]
    );
};


//upsert (update/insert):
exports.updateProfile = function(age, city, url, user_id) {
    return db.query(`INSERT INTO user_profiles (age, city, url, user_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id)
    DO UPDATE SET age = $1, city = $2, url = $3
    RETURNING id`,
    [age || null, city || null, url || null, user_id || null]
    );
};

//update
exports.updateUser = function(user_id, firstname, lastname, email, pass) {
    if (pass) {
        return db.query(
            `UPDATE users
            SET firstname = $2, lastname = $3, email = $4, pass = $5
            WHERE id = $1`,
            [user_id, firstname || null, lastname || null, email || null, pass || null]
        );
    } else {
        return db.query(
            `UPDATE users
            SET firstname = $2, lastname = $3, email = $4
            WHERE id = $1`,
            [user_id, firstname || null, lastname || null, email || null]
        );
    }
};

//DELETE
exports.deleteSignatures = function (id) {
    return db.query(`DELETE FROM signatures WHERE user_id = $1`,
        [id]
    );
};

exports.deleteProfile = function (id) {
    return db.query(`DELETE FROM user_profiles WHERE user_id = $1`,
        [id]
    );
};

exports.deleteUser = function (id) {
    return db.query(`DELETE FROM users WHERE id = $1`,
        [id]
    );
};
