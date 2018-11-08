const spicedPg = require('spiced-pg');


const db = spicedPg(`postgres:postgres:postgres@localhost:5432/petition`);

exports.createFollowers= function(firstname, lastname, signature) {
    return db.query(`INSERT INTO followers (firstname, lastname, signature)
    VALUES ($1, $2, $3)
    RETURNING id`,
    [firstname || null, lastname || null, signature || null]
    );

};


exports.signers= function(id) {
    return db.query(`SELECT signature FROM petition WHERE id = $1
RETURNING id`,
    [id]
    );
};
