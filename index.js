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
        secret: 'I am always hungry',
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


app.get("/", (req, res) => {
    res.redirect("/register");
});

app.get('/register', (req, res) => {
    if (req.session.user_id) {
        //console.log("log user_id:", req.session.user_id);
        res.redirect('/profile');
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
            res.redirect("/profile");
        }).catch(function(error) {
            console.log("error:", error);
            res.render("register", {
                layout: "main",
                error: error
            });
        });
    });
});

app.get('/profile', (req, res) => {
    res.render("profile", {
        layout: "main",
        error: "error"
    });
});


app.post('/profile', (req, res) => {
    return db.createUserProfiles(req.body.age, req.body.city, req.body.url, req.session.user_id
    ).then(() => {
        res.redirect('/petition');
    }).catch(function(error) {
        console.log("error:", error);
        res.render("petition", {
            layout: "main",
            error: error
        });
    });
});

app.get('/login', (req, res) => {
    if (!req.session.user_id) {
        res.render("login", {
            layout: "main"
        });
    } else {
        res.redirect('/petition');
    }
});

app.post("/login", (req, res) => {
    db.getUser(req.body.email)
        .then(result => {
            compare(req.body.password, result.rows[0].pass)
                .then(doesMatch => {
                    if (doesMatch === true) {
                        req.session.user_id = result.rows[0].user_id;
                        req.session.signed = result.rows[0].signed;
                        //console.log(result.rows[0].sig);
                    } else {
                        throw new Error();
                    }
                })
                .then(() => {
                    //console.log("THESE ARE THE RESULTS: ", result);
                    if (req.session.signed == null) {
                        res.redirect("/petition");
                    } else {
                        res.redirect("/thanks");
                    }
                });
        })
        .catch(err => {
            console.log("error in login: ", err);
            res.render("logIn", {
                layout: "main",
                error: err
            });
        });
});

app.get("/petition", (req, res) => {
    //console.log(req.session.signed);
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
    db.saveSigners(req.body.signature, req.session.user_id
    ).then(results => {
        //console.log("petition results:", results);
        //req.session.user_id = results.rows[0].id;
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
        res.redirect("/petition");
    } else {
        db.getSignature(req.session.signed).then(function(results) {
            res.render("thanks", {
                layout: "main",
                link: "yes",
                image: results.rows[0].signature
            });
        });
    }
});


app.get("/signers", (req, res) => {
    if (!req.session.signed) {
        res.redirect('/petition');
    } else {
        db.getUserProfiles().then(function(results) {
            //console.log(results);
            res.render("signers", {
                layout: "main",
                signers: results.rows
            });
        }).catch(function(error) {
            console.log("error:", error);
        });
    }
});


app.get("/signers/:city", (req, res) => {
    db.getSignersByCity(req.params.city).then(results => {
    //    console.log("getSignersByCity: ", results);
        res.render("signers", {
            layout: "main",
            signers: results.rows
        });
    }).catch(function(error) {
        console.log("error:", error);
    });
});

app.get("/profile/edit", (req, res) => {
    db.editProfile(req.session.user_id).then(results => {
        res.render("editprofile", {
            layout: "main",
            // results: results.rows[0],
            profile: results.rows[0]
        });
    }).catch(function(error) {
        console.log("error editing profile:", error);
    });
});

app.post("/profile/edit", (req, res) => {
    let promises;
    if (req.body.password != "") {
        promises = [
            hash(req.body.password).then(hash => db.updateUser(req.session.user_id, req.body.firstname,
                req.body.lastname, req.body.email, hash)),
            db.updateProfile(req.body.age, req.body.city, req.body.url, req.session.user_id)
        ];
    } else {
        promises = [
            db.updateUser(req.session.user_id, req.body.firstname,
                req.body.lastname, req.body.email),
            db.updateProfile(req.body.age, req.body.city, req.body.url, req.session.user_id)
        ];
    }

    Promise.all(promises)
        .then(() => {
            res.redirect('/petition');
        }).catch(function(error) {
            console.log("error:", error);
        });
});


app.post("/signature/delete", (req, res) => {
    db.deleteSignatures(req.session.signed).
        then(function() {
            delete req.session.signed;
            res.redirect('/petition');
        }).catch(function(error) {
            console.log("error deleting signature:", error);
        });
});




app.get('/logout', function(req, res) {
    req.session = null;
    res.redirect('/register');
});

// app.listen(8080, () => console.log("I'm listening!"));

//CHANGE THIS FOR HEROKU:
app.listen(process.env.PORT || 8080, function() {
    console.log("I'm listening on heroku or 8080");
});
