const Controller = require("./controller");

class LoginController extends Controller {
    async LoginPage(req, res, next) {
        try {
            res.render("login", {
                pageTitle: "Login",
                path: "/login",
            });
        } catch (error) {
            next(error);
        }
    }
    handleLogin(req, res, next) {
        try {

            res.cookie('roomGap', req.body.username, { maxAge: 86400000 });

            res.redirect("/");

        } catch (error) {
            next(error);
        }
    }
    handleLogout(req, res, next) {
        try {
            res.clearCookie("roomGap");
            res.redirect("/login");
        } catch (error) {
            next(error);
        }
    }
};

module.exports = {
    LoginController: new LoginController()
}