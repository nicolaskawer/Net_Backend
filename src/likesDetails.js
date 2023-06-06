const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    postID: {
        type: Number,
        unique: true,
    },
    likedBy: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("likes", userSchema);
