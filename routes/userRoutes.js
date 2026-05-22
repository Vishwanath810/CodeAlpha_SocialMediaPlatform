const express = require("express");
const User = require("../models/User");
const Post = require("../models/Post");

const router = express.Router();


// User Profile
router.get("/profile/:id", async (req, res) => {

    try {

        const user = await User.findById(req.params.id);

        const posts = await Post.find({
            user: req.params.id
        }).sort({ createdAt: -1 });

        res.render("profile", {
            user,
            posts,
            currentUserId: req.session.userId
        });

    } catch (err) {
        console.log(err);
    }

});


// Follow User
router.post("/follow/:id", async (req, res) => {

    try {

        const currentUser = await User.findById(req.session.userId);

        const targetUser = await User.findById(req.params.id);

        // Prevent duplicate follow
        if (!currentUser.following.includes(targetUser._id)) {

            currentUser.following.push(targetUser._id);

            targetUser.followers.push(currentUser._id);

            await currentUser.save();

            await targetUser.save();
        }

        res.redirect("/profile/" + req.params.id);

    } catch (err) {
        console.log(err);
    }

});

module.exports = router;