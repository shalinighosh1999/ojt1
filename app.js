var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var mongoose = require("mongoose");
var colors = require("colors");
require("dotenv").config();

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

console.log("Mongo URI:", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB is Connected".cyan.underline))
  .catch((error) => console.log(`Error: ${error.message}`.red.underline.bold));

app.use(
  cors({
    origin: "*",
  })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug"); // Use 'pug' instead of 'jade' if you're using newer versions

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.use(express.static(path.join(__dirname, "./buildd")));
app.use(express.static(path.join(__dirname, "public")));
app.use(function (req, res) {
  res.sendFile(path.join(__dirname, "./buildd", "index.html"));
});

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

const port = process.env.PORT || 2556; // Ensure you use an environment variable or fallback to 2556
app.listen(port, "0.0.0.0", () => {
  // Ensure server binds to all IPs
  console.log(`Server is running on http://localhost:${port}`.green.underline);
});

module.exports = app;
