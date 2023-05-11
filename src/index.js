const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const url = "mongodb+srv://hlev2454:mongodatabase77@barknetcluster.ksy8pmw.mongodb.net/?retryWrites=true&w=majority";
const dbName = "your-database-name"; // we need to do universal function to get the db name to connect to

const app = express();
app.use(cors());
app.use(express.json());

app.get("/message", (req, res) => {
    res.json({ message: "Hello from server!!" });
});
app.get("/data", (req, res) => {
    MongoClient.connect(url, (connectionError, client) => {
        if (connectionError) {
            console.log(connectionError);
            res.status(500).send("Failed to connect to the database");
        } else {
            const db = client.db(dbName);
            const collection = db.collection("your-collection-name");
            collection.find({}).toArray((queryError, result) => {
                if (queryError) {
                    console.log(queryError);
                    res.status(500).send("Failed to retrieve data from the database");
                } else {
                    res.json(result);
                }
                client.close();
            });
        }
    });
});

app.listen(8000, () => {
    console.log("Server is running on port 8000.");
});
