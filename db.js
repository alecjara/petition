const spicedPg = require('spiced-pg');


const db = spicedPg(`postgres:postgres:postgres@localhost:5432/petition`);
// //cities will be the name of the database I create for this project
db.query('INSERT INTO petition').then(function(results) {
    console.log(results);
}).catch(function(err) {
    console.log(err);
});
//
// //all the data base on this file and I can export function
// //to use outside of this file
// exports.createCity = function(city, country, population) {
//     return db.query(`INSERT INTO cities (city, country, population)
//     VALUES ($1, $2, $3)
//     RETURNING *` //returning is like select and allows it to show the changes.
//     //this correspond to each $num from above.
//         [city, country, population]
//     ).then(function(results) {
//         return results.rows;
//     });
// };
//we can do many things on query:
// db.query(`INSERT INTO cities (city, country, population)
// VALUES ('funky Town', 'ChickenLand', 420)
// RETURNING *`
// //returning is like select and allows it to show the changes.
// ').then(function(results) {
//     console.log(results);
// }).catch(function(err) {
//     console.log(err);
// });
// }



//we will make tables on individual files include the drop table, data and that's it no select nothing else and link it to use
