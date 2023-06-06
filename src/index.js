const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");

const app = express();

const storage = multer.memoryStorage();
const upload = multer({ storage });
const bodyParser = require("body-parser");

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
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
        await User.create([
            {
                firstName,
                lastName,
                username,
                email,
                password,
                birthdate,
            },
        ]);
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

require("./postDetails");

const newPost = mongoose.model("posts");
app.post("/New_Post", upload.single("picture"), async (req, res) => {
    const {
        username, picture, caption, hashtag, likesCount,
    } = req.body;
    console.log(req.body);
    const highestPost = await newPost.findOne().sort({ postID: -1 }).limit(1);
    const nextPostId = highestPost ? highestPost.postID + 1 : 1;
    try {
        // create a new post
        await newPost.create([
            {
                postID: nextPostId,
                username,
                picture,
                caption,
                hashtag,
                likesCount,
            },
        ]);
        console.log("create_post");
        return res.json({ status: "OK", data: "create_post" });
    } catch (error) {
        console.error("Error creating post:", error);
        return res.status(500).json({ error: "Failed to create post" });
    }
});

require("./likesDetails");

const LikesDetails = mongoose.model("likes");
app.post("/updateLikeCount", async (req, res) => {
    const { postID, likesCount, useRname } = req.body;
    console.log("start", likesCount);

    let temp = likesCount;
    console.log("start temp", temp);
    try {
        const likedPost = await LikesDetails.findOne({
            postID,
            likedBy: useRname,
        });

        if (likedPost) {
            temp = likesCount - 1;
            await newPost.findOneAndUpdate({ postID }, { likesCount: temp });
            await LikesDetails.deleteOne({ postID, likedBy: useRname });
            console.log("User has already liked the post", temp);
            return res.json({
                status: "OK",
                data: temp,
            });
        }
        temp = likesCount + 1;
        await newPost.findOneAndUpdate({ postID }, { likesCount: temp });

        const newLike = new LikesDetails({
            postID,
            likedBy: useRname,
        });
        await newLike.save();
        console.log("added like", temp);
        return res.json({ status: "OK", data: temp });
    } catch (error) {
        console.error("Error updating like count:", error);
        return res.status(500).json({ error: "Failed to update like count" });
    }
});

require("./postDetails");

const displayPost = mongoose.model("posts");
app.get("/Explore", async (req, res) => {
    try {
        const postsD = await displayPost.find();
        res.json(postsD);
    } catch (error) {
        console.error("error retrieving posts: ", error);
        res.status(500).json({ error: "error retrieving posts" });
    }
});

require("./postDetails");

app.get("/adoption", async (req, res) => {
    try {
        const postsD = await displayPost.find({ hashtag: "Adoption" });
        res.json(postsD);
    } catch (error) {
        console.error("error retrieving posts: ", error);
        res.status(500).json({ error: "error retrieving posts" });
    }
});

require("./postDetails");

app.get("/fashion", async (req, res) => {
    try {
        const postsD = await displayPost.find({ hashtag: "Fashion" });
        res.json(postsD);
    } catch (error) {
        console.error("error retrieving posts: ", error);
        res.status(500).json({ error: "error retrieving posts" });
    }
});

require("./postDetails");

app.get("/food", async (req, res) => {
    try {
        const postsD = await displayPost.find({ hashtag: "Food" });
        res.json(postsD);
    } catch (error) {
        console.error("error retrieving posts: ", error);
        res.status(500).json({ error: "error retrieving posts" });
    }
});

require("./postDetails");

app.get("/funny", async (req, res) => {
    try {
        const postsD = await displayPost.find({ hashtag: "Funny" });
        res.json(postsD);
    } catch (error) {
        console.error("error retrieving posts: ", error);
        res.status(500).json({ error: "error retrieving posts" });
    }
});

require("./postDetails");

app.get("/grooming", async (req, res) => {
    try {
        const postsD = await displayPost.find({ hashtag: "Grooming" });
        res.json(postsD);
    } catch (error) {
        console.error("error retrieving posts: ", error);
        res.status(500).json({ error: "error retrieving posts" });
    }
});

require("./postDetails");

app.get("/health", async (req, res) => {
    try {
        const postsD = await displayPost.find({ hashtag: "Health" });
        res.json(postsD);
    } catch (error) {
        console.error("error retrieving posts: ", error);
        res.status(500).json({ error: "error retrieving posts" });
    }
});

require("./postDetails");

app.get("/others", async (req, res) => {
    try {
        const postsD = await displayPost.find({ hashtag: "Others" });
        res.json(postsD);
    } catch (error) {
        console.error("error retrieving posts: ", error);
        res.status(500).json({ error: "error retrieving posts" });
    }
});

require("./postDetails");

app.get("/traveling", async (req, res) => {
    try {
        const postsD = await displayPost.find({ hashtag: "Traveling" });
        res.json(postsD);
    } catch (error) {
        console.error("error retrieving posts: ", error);
        res.status(500).json({ error: "error retrieving posts" });
    }
});

app.post("/notification", async (req, res) => {
    const { username } = req.body;

    try {
    // Retrieve postIDs corresponding to the username
        const posts = await displayPost.find({ username }, "postID");
        console.log("find posts:", posts);

        // Extract postIDs from the posts array
        const postIDs = posts.map((post) => post.postID);
        console.log("map posts:", postIDs);

        // Retrieve likedBy fields for the postIDs
        const likes = await LikesDetails.find({ postID: { $in: postIDs } }, "likedBy");
        console.log("users:", likes);

        // Extract likedBy values from the likes array
        const likedByValues = likes.map((like) => like.likedBy);
        console.log("map users:", likedByValues);

        res.json(likedByValues);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while retrieving likedBy values." });
    }
});

app.listen(8000, () => {
    console.log("Server is running on port 8000.");
});
