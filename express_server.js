//localhost:8080/urls
//localhost:8080/urls/new

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
let user_id = '';
app.use(cookieParser())
app.set("view engine", "ejs")

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

const users = {
    "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: "purple-monkey-dinosaur"
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "dishwasher-funk"
    }
}

function generateRandomString() {
    let characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    let length = 6;
    let randomString = '';
    for (let i = 0; i < length; i++) {
        let randomNumber = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomNumber);
    }
    return randomString;
}

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/urls/new", (req, res) => {
    let templateVars = {
        user_id: req.cookies["user_id"],
    };
    res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
    let shortURL = generateRandomString();
    let longURL = req.body.longURL;
    urlDatabase[shortURL] = longURL;
    res.redirect('urls/' + shortURL);
});

// change short URLs into links

app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});

app.get("/urls", (req, res) => {
    let templateVars = {
        user_id: req.cookies["user_id"],
        urls: urlDatabase
    };
    res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
    let templateVars = {
        user_id: req.cookies["user_id"],
        shortURL: req.params.shortURL,
        longURL: urlDatabase
    };
    res.render("urls_show", templateVars);
});

// delete
app.post('/urls/:shortURL/delete', (req, res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
});

//edit

app.post('/urls/:shortURL', (req, res) => {
    const newName = req.body.newName;
    const shortURL = req.params.shortURL;
    // console.log(newName, shortURL)
    // if (newName) {
    urlDatabase[shortURL] = newName; // }
    res.redirect(`/urls/${shortURL}`);
});

app.get("/", (req, res) => {
    res.send("Hello!");
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});


// LOGIN / LOGOUT

app.post("/login", (req, res) => {
    // console.log("user_id: ", req.body.user_id)
    user_id = req.body.user_id;
    res.cookie('user_id', user_id);
    res.redirect('/urls')
});

app.post("/logout", (req, res) => {
    res.clearCookie('user_id', user_id);
    res.redirect('/urls')
})

//REGISTRATION

let userAuthentication = (email, password) => {
    for (id in users) {
        let currentUser = users[id].email;
        console.log("hello", email, currentUser)
        if (!email || !password) {
            return false;
        } else if (currentUser === email) {
            console.log("match found")
            return false;
        }
        console.log("no match found");
        return true;
    }
}

app.get("/register", (req, res) => {
    res.render("urls_registration")
});

app.post("/register", (req, res) => {
    let id = generateRandomString();
    let email = req.body.email;
    let password = req.body.password;
    let validUser = userAuthentication(email, password)
    if (!validUser) {
        res.send("Please enter a valid email and password");
        return;
    }
    users[id] = { id: id, password: password, email: email }
    res.cookie('user_id', id);
    res.redirect('/urls');
});