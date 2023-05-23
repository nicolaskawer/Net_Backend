const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

const jwt = require("jsonwebtoken");

const jwtSecret = "hjgfdghsjkahugwthdsvhxbjnwhigjyq4782769()gsygwsijjj";
const url = "mongodb+srv://hlev2454:passwordmongo@barknetcluster.ksy8pmw.mongodb.net/AuthDB?retryWrites=true&w=majority";

mongoose
    .connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log(err, "Unable to connect to MongoDB Atlas!"));

require("./userDetails");

const User = mongoose.model("users");

app.post("/", async (req, res) => {
    const {
        firstName, lastName, username, email, password, birthdate,
    } = req.body;
    console.log(req.body);
    try {
        const oldUser = await User.findOne({ username });
        if (oldUser) {
            console.log("exist");
            return res.json({ error: "User Exsits" });
        }
        await User.create([{
            firstName, lastName, username, email, password, birthdate,
        }]);
        console.log("create");
        return res.json({ status: "OK" });
    } catch (err) {
        console.log("error1");
        return res.json({ status: "error" });
    }
});
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
        return res.json({ error: "User not found" });
    }

    if (user.password === password) {
        const token = jwt.sign({}, jwtSecret);
        return res.json({ status: "OK", data: token });
    }

    return res.json({ status: "error", error: "Invalid password" });
});
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
        return res.sendStatus(401);
    }

    return jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};

app.get("/home", authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await User.findById(userId);
        if (user) {
            // Handle user data
            return res.json({ user });
        }
        return res.json({ error: "User not found" });
    } catch (err) {
        console.log("An error occurred:", err);
        return res.json({ error: "Error retrieving user data" });
    }
});
app.post("/search", async (req, res) => {
    const { query } = req.body;
    console.log(req.body);
    try {
        const users = await User.find({
            username: { $regex: query, $options: "i" },
        });
        console.log(users);
        return res.json({ users });
    } catch (err) {
        console.log("An error occurred:", err);
        return res.json({ error: "Error retrieving user list" });
    }
});
const Post = require("./postDetails");

const createPost = async (req, res) => {
    const {
        postID, username, picture, caption, hashtag, likesCount,
    } = req.body;

    try {
        // Create a new post
        const newPost = await Post.create({
            postID,
            username,
            picture,
            caption,
            hashtag,
            likesCount,
        });
        console.log("createPost");
        return res.json({ status: "OK", data: newPost });
    } catch (error) {
        console.error("Error creating post:", error);
        return res.status(500).json({ error: "Failed to create post" });
    }
};

module.exports = createPost;

app.listen(8000, () => {
    console.log("Server is running on port 8000.");
});
