var express = require("express");
var router = express.Router();

var adminsRouter = require("./admin");
var usersRouter = require("./user");

const middleware = require("../../service/middleware").middleware;

// No authorization
// router.use("/", usersRouter);

router.use(middleware);

// with authorization
router.use("/admin", adminsRouter);
router.use("/user", usersRouter);
module.exports = router;
