const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();


// Register Page
router.get("/register", (req, res) => {
    res.render("register");
});


// Register User
router.post("/register", async (req, res) => {

    try {

        const { username, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.redirect("/login");

    } catch (err) {
        console.log(err);
    }

});


// Login Page
router.get("/login", (req, res) => {
    res.render("login");
});


// Login User
router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.send("User not found");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.send("Incorrect Password");
        }

        req.session.userId = user._id;

        res.redirect("/dashboard");

    } catch (err) {
        console.log(err);
    }

});


// Logout
router.get("/logout", (req, res) => {

    req.session.destroy(() => {
        res.redirect("/login");
    });

});

module.exports = router;