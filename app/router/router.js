const homecontroller = require("../controllers/homecontroller");
const { LoginController } = require("../controllers/logincontroller");

const router = require("express").Router();

router.get("/", homecontroller.indexPage)

router.get("/login", LoginController.LoginPage)
router.post("/login", LoginController.handleLogin)

module.exports = {
    AllRoutes: router
}