const express = require("express");
const app = express();
const db = require("./db");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const csurf = require("csurf");

app.disable("x-powered-by");

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

app.use(
    bodyParser.urlencoded({
        extended: false
    })
);

app.use(csurf());

app.use(function(req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});

//stop someone from hacking our page:
app.use(function(req, res, next) {
    res.setHeader("X-Frame-Options", "DENY");
    next();
});

app.use(express.static("./public"));

//do not touch this code
var hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
//do not touch this code

app.get("/petition", (req, res) => {
    //I want to have access to the first name that the user provided on the about route (in a cookie)

    // console.log("req.session in /petition:", req.session);
    res.render("petition", {
        layout: "main"
    });
});

app.post("/petition", function(req, res) {
    db.createFollowers(
        req.body.firstname,
        req.body.lastname,
        req.body.signature
    ).then(function(results) {
        console.log(results);
        req.session.signed = true;
        let id = results.rows[0].id;
        // console.log(id);
        console.log(db.signers(id));

        res.redirect("/thanks");
    }).catch(function(error) {
        res.render("petition", {
            layout: "main",
            error: error

        });
        req.session = null;
    });
});

app.get("/thanks", (req, res) => {
    db.signers().then(function(signature) {
        res.render("thanks", {
            layout: "main",
            signature: signature
        });
    });
    // res.session.id
    // console.log("req.session in /thanks:", req.session);
});

app.get("/signers", (req, res) => {
    // console.log("req.session in /signers:", req.session);
    res.render("signers", {
        layout: "main"
    });
});
//we need function that read the cookie and redirect them to

app.listen(8080, () => console.log("I'm listening!"));
