const path = require("path");
require("dotenv").config();
const express = require("express");

let port = process.env.PORT || "3000";
let host = process.env.HOST || "127.0.0.1";

const app = express();

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, host, () => {
    console.log(`Listening on http://${host}:${port}/`);
});
