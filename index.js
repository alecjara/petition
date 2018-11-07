const express = require('express');
const app = express();
//i am importing the  whole db.js files
// const db = require('./db');
// const ca = require('chalk-animation');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.disable('x-powered-by');

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(cookieParser());

//do not touch this code
var hb = require('express-handlebars');
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');
//do not touch this code

app.use(express.static('./public'));

app.get('/petition', (req, res) => {
    res.render('petition', {
        layout: 'main'
    });
});

app.post('/followers/create', function(req, res) {
    db.createFollowers(
        req.body.city, req.body.country, req.body.population
    ).then(function() {
        res.render('success');
    }).catch(function(err) {
        res.render('error');
    });
});

app.listen(8080, () => console.log("I'm listening!"));
