const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const methodOverride = require("method-override");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const app = express();


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride("_method"));

app.use(session({
    secret: "socialsecret",
    resave: false,
    saveUninitialized: false
}));


// View Engine
app.set("view engine", "ejs");


// Routes
app.use(authRoutes);
app.use(postRoutes);    
app.use(userRoutes);

// Home Route
app.get("/", (req, res) => {
    res.send("Social Media App Running");
});


// Server
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});