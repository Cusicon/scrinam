const express = require("express");
const path = require("path");
const http = require("http");
const publicPath = path.join(__dirname, "../public");
const port = process.env.PORT || 3030;

let app = express();

app.use(express.static(publicPath));

app.get("/", (req, res) => {
  res.render("index");
});

app.listen(port, err =>
  err ? console.log(err) : console.log(`Server started @ port: ${port}`)
);
