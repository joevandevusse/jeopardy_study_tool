var path = require("path");
var express = require("express");
var app = express();
//var port = process.env.port || 80;
const PORportT = process.env.PORT || 8080;
//var http = require("http").Server(app).listen(port);

app.use("/css", express.static("./css"));
app.use("/img", express.static("./img"));
app.use("/js", express.static("./js"));
app.use("/pages", express.static("./pages"));
app.use("/questions", express.static("./questions"));

console.log("Server started at port 80");

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get("/categories", function(req, res) {
    res.sendFile(__dirname + "/pages/categories.html");
});

// var server = app.listen(3000, function() {
//     var host = 'localhost';
//     var port = server.address().port;
//     console.log("Listening on http://" + host + ": " + port + "/");
// });

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
    console.log('Press Ctrl+C to quit.');
  });

