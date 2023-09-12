//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption"); // Correct import statement

const app = express();
console.log(process.env.API_KEY); 

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
    .connect("mongodb://127.0.0.1:27017/secretweb", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });

// Define a User schema if you haven't already
const userSchema = new mongoose.Schema({ email: String, password: String });

// Apply mongoose-encryption plugin to encrypt the password field

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = mongoose.model("User", userSchema);

app.get("/", function (req, res) {
    res.render("Home");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", async function (req, res) {
    const newUser = new User({ email: req.body.username, password: req.body.password });

    try {
        await newUser.save(); // Use await to wait for the save operation to complete
        res.render("secrets");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error registering user.");
    }
});

app.post("/login", async function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const foundUser = await User.findOne({ email: username });
        if (foundUser) {
            if (foundUser.password === password) {
                res.render("secrets");
            } else {
                res.status(401).send("Incorrect password.");
            }
        } else {
            res.status(404).send("User not found.");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred during login.");
    }
});

app.listen(3000, function () {
    console.log("Server started on port 3000");
});
