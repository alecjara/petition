const express = require("express");
const app = express();
const db = require("./db");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const { hash, compare } = require('./bcrypt');

app.disable("x-powered-by");

app.use(
    cookieSession({
        secret: `I'm always hungry.`,
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


app.get('/register', (req, res) => {
    if (req.session.user_id) {
        //console.log("log user_id:", req.session.user_id);
        res.redirect('/petition');
    } else {
        res.render("register", {
            layout: "main"
        });
    }
});

app.post('/register', (req, res) => {
    hash(req.body.password).then(hash => {
        //console.log(hash);
        return db.createUser(req.body.firstname, req.body.lastname, req.body.email, hash
        ).then(results => {
            //console.log("results:", results);
            req.session.user_id = results.rows[0].id;
            //console.log(req.session.user_id);
            req.session.firstname = results.rows[0].firstname;
            req.session.lastname = results.rows[0].lastname;
            req.session.email = results.rows[0].email;
            //req.session.user_id = "true";
            res.redirect("/petition");
        }).catch(function(error) {
            console.log("error:", error);
            res.render("register", {
                layout: "main",
                error: error
            });
        });
    });
});

app.get('/login', (req, res) => {
    if (req.session.user_id) {
        res.redirect('/petition');
        return;
    } else {
        res.render("login", {
            layout: "main"
        });
    }
});

app.post('/login', (req, res) => {
    //const user_id = req.session.user_id;
    db.getUser(req.body.email).then(results => {
    //    console.log(results);
        req.session.user_id = results.rows[0].user_id;
        req.session.signed = results.rows[0].signed;
        return compare(req.body.password, results.rows[0].password
        ).then(matches => {
        //console.log(matches);
            if (matches) {
                res.redirect('/petition');
                //return db.getSignature(results.rows[0].user_id);
            } else {
                res.render("login", {
                    layout: "main",
                    error: "error, try again"
                });
            }
        }).catch(function(error) {
            console.log(error);
            res.render("login", {
                layout: "main",
                error: error
            });
        });
    });
});

app.get("/petition", (req, res) => {
    if (req.session.signed) {
        //console.log("signed:", req.session.signed);
        res.redirect('/thanks');
        return;
    } else {
        res.render("petition", {
            layout: "main"
        });
    }
});

app.post("/petition", function(req, res) {
    // req.session.user_id = results.rows[0].id
    db.saveSigners(req.session.firstname, req.session.lastname, req.body.signature, req.session.user_id
    ).then(results => {
        //console.log("petition results:", results);
        req.session.signed = results.rows[0].id;
        //console.log("checking signed:", req.session.signed);
        // return db.getSignature(user_id);
        res.redirect('/thanks');

    }).catch(function(error) {
        console.log("ERRORRRRR", error);
        res.render('petition', {
            layout: "main",
            error: error
        });
    });
});

app.get("/thanks", (req, res) => {
    if (!req.session.signed) {
        res.redirect('/petition');
        return;
    }
    db.getSignature(req.session.signed).then(function(results) {
        console.log("results from thanks route: ", results);
        res.render("thanks", {
            layout: "main",
            // signature: signature,
            image: results.rows[0].signature
        });
    }).catch(function(error) {
        console.log(error);
    });
}
);

app.get("/signers", (req, res) => {
    if (!req.session.signed) {
        res.redirect('/petition');
    } else {
        db.getSigners().then(function(results) {
            console.log(results);
            res.render("signers", {
                layout: "main",
                results: results.rows
            });
        }).catch(function(error) {
            console.log("error:", error);
        });
    }
});

app.get('/logout', function(req, res) {
    req.session = null;
    res.redirect('/register');
});

app.listen(8080, () => console.log("I'm listening!"));
