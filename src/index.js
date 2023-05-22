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
        console.log("error");
        return res.json({ status: "error" });
    }
});
app.post("/Login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        return res.json({ error: "User not found" });
    }
    if (user.password === password) {
        const token = jwt.sign({}, jwtSecret);
        if (res.status(201)) {
            return res.json({ status: "OK", data: token });
        }

        return res.json({ error: "error" });
    }

    return res.json({ status: "error", error: "Invalid pass" });
});

app.listen(8000, () => {
    console.log("Server is running on port 8000.");
});