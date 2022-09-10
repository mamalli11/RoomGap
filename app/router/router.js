const router = require("express").Router();

const homecontroller = require("../controllers/homecontroller");
const { LoginController } = require("../controllers/logincontroller");

router.get("/", homecontroller.indexPage);

router.get("/login", LoginController.LoginPage);

router.post("/login", LoginController.handleLogin);

router.get("/logout", LoginController.handleLogout);

module.exports = { AllRoutes: router }