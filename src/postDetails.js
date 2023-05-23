const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    postID: {
        type: Number,
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },
    picture: {
        type: Buffer,
        required: true,
    },
    caption: {
        type: String,
        required: true,
    },
    hashtag: {
        type: String,
        required: true,
    },
    likesCount: {
        type: Number,
        required: true,
    },

});

module.exports = mongoose.model("posts", userSchema);
