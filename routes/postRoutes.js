const express = require("express");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

const router = express.Router();


// Dashboard / Feed
router.get("/dashboard", async (req, res) => {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const posts = await Post.find()
        .populate("user")
        .populate({
            path: "comments",
            populate: {
                path: "user"
            }
        })
        .sort({ createdAt: -1 });

    res.render("dashboard", { posts });
});


// Create Post
router.post("/posts/create", async (req, res) => {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const newPost = new Post({
        content: req.body.content,
        user: req.session.userId
    });

    await newPost.save();

    res.redirect("/dashboard");
});


// Add Comment
router.post("/comments/create/:postId", async (req, res) => {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const comment = new Comment({
        text: req.body.text,
        user: req.session.userId,
        post: req.params.postId
    });

    await comment.save();

    const post = await Post.findById(req.params.postId);

    post.comments.push(comment._id);

    await post.save();

    res.redirect("/dashboard");
});

//
// Delete Comment
//
router.post("/comments/delete/:id", async (req, res) => {

    try {

        const comment = await Comment.findById(req.params.id);

        // Delete only own comment
        if (comment.user.toString() === req.session.userId) {

            // Remove comment from post
            await Post.updateOne(
                { comments: comment._id },
                { $pull: { comments: comment._id } }
            );

            await Comment.findByIdAndDelete(req.params.id);
        }

        res.redirect("/dashboard");

    } catch (err) {

        console.log(err);
    }

});

// Like Post
router.post("/posts/like/:id", async (req, res) => {

    const post = await Post.findById(req.params.id);

    if (!post.likes.includes(req.session.userId)) {
        post.likes.push(req.session.userId);
    }

    await post.save();

    res.redirect("/dashboard");
});

//
// Delete Post
//
router.post("/posts/delete/:id", async (req, res) => {

    try {

        const post = await Post.findById(req.params.id);

        // Allow only owner to delete
        if (post.user.toString() === req.session.userId) {

            await Comment.deleteMany({
                _id: { $in: post.comments }
            });

            await Post.findByIdAndDelete(req.params.id);
        }

        res.redirect("/dashboard");

    } catch (err) {

        console.log(err);
    }

});

//
// Delete Comment
//
router.post("/comments/delete/:id", async (req, res) => {

    try {

        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.redirect("/dashboard");
        }

        // Allow only comment owner to delete
        if (comment.user.toString() === req.session.userId) {

            // Remove comment from post
            await Post.updateOne(
                { comments: comment._id },
                { $pull: { comments: comment._id } }
            );

            // Delete comment
            await Comment.findByIdAndDelete(req.params.id);
        }

        res.redirect("/dashboard");

    } catch (err) {

        console.log(err);

        res.redirect("/dashboard");
    }

});

module.exports = router;