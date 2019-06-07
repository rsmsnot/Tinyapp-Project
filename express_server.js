//localhost:8080/urls
//localhost:8080/urls/new

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
let user_id = '';
app.use(cookieParser())
app.set("view engine", "ejs")

const urlDatabase = {
    "b2xVn2": { longURL: "http://www.lighthouselabs.ca", user_id: "userRandomID" },
    "9sm5xK": { longURL: "http://www.google.com", user_id: "userRandomID" }
};

const users = {
    "userRandomID": {
        id: "userRandomID",
        email: "123@123.com",
        password: "123"
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "1234@123.com",
        password: "1234"
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
        users: users,
    };
    if (!templateVars.user_id) {
        res.redirect("/login");
        return;
    }
    res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
    let shortURL = generateRandomString();
    let longURL = req.body.longURL;
    urlDatabase[shortURL] = {
        longURL: longURL,
        user_id: user_id
    }
    // console.log(longURL);
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
        urls: urlDatabase,
        users: users,
    };
    res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
    let templateVars = {
        user_id: req.cookies["user_id"],
        shortURL: req.params.shortURL,
        urls: urlDatabase,
        users: users,
    };
    if (!templateVars.user_id) {
        res.redirect("/login");
        return;
    }
    res.render("urls_show", templateVars);
});

// delete
app.post('/urls/:shortURL/delete', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let validUser = userAuthentication(email, password)
    if (!validUser) {
        res.redirect("/login");
        return;
    }
    if (user_id == urlDatabase[shortURL].user_id) {
        delete urlDatabase[req.params.shortURL];
        res.redirect('/urls');
    } else {
        res.redirect('/login');
    }
});

//edit

app.post('/urls/:shortURL', (req, res) => {
    const newName = req.body.newName;
    const shortURL = req.params.shortURL;
    // console.log(newName, shortURL)
    urlDatabase[shortURL].longURL = newName; // }
    res.redirect(`/urls/${shortURL}`);
});

app.get("/", (req, res) => {
    res.redirect("/urls");
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});


// LOGIN


app.get("/login", (req, res) => {
    res.render("urls_login")
});

app.post("/login", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let validUser = false;
    for (let user in users) {
        if (users[user].email == email && users[user].password == password) {
            validUser = true;
            user_id = user;
        }
    }
    // console.log(validUser);
    if (!validUser) {
        res.send("Please enter a valid email and password");
        return;
    }
    res.cookie('user_id', user_id);
    res.redirect('/urls')
});

// LOGOUT

app.post("/logout", (req, res) => {
    res.clearCookie('user_id', user_id);
    res.redirect('/urls')
})

//REGISTRATION

let userAuthentication = (email, password) => {
    for (id in users) {
        let currentUser = users[id].email;
        // console.log("hello", email, currentUser)
        if (!email || !password) {
            return false;
        } else if (currentUser === email) {
            // console.log("match found")
            return false;
        }
        // console.log("no match found");
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
        res.send("Please enter a valid email address and password");
        return;
    }
    users[id] = { id: id, password: password, email: email }
    res.cookie('user_id', id);
    res.redirect('/urls');
});