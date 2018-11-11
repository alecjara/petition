const spicedPg = require('spiced-pg');


const db = spicedPg(`postgres:postgres:postgres@localhost:5432/petition`);

exports.getSigners = function() {
    return db.query('SELECT * FROM signatures');
};


// exports.countSigners = () => {
//     return db.query(
//         'SELECT COUNT(id) FROM signatures');
// };


exports.saveSigners= function(firstname, lastname, signature, user_id) {
    return db.query(`INSERT INTO signatures (firstname, lastname, signature, user_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id`,
    [firstname || null, lastname || null, signature || null, user_id || null]);
};


exports.getSignature= function(id) {
    return db.query(`SELECT signature FROM signatures WHERE id = $1`,
        [id]);
};

exports.createUser = function(firstname, lastname, email, pass) {
    return db.query(`INSERT INTO users (firstname, lastname, email, pass)
    VALUES ($1, $2, $3, $4)
    RETURNING id`,
    [firstname || null, lastname || null, email || null, pass|| null]);
};

exports.getUser = function(email) {
    return db.query(`SELECT * FROM users WHERE email = $1`,
        [email]
    );
};
