const Controller = require("./controller");

module.exports = new (class HomeController extends Controller {
  async indexPage(req, res, next) {
    try {

      if (!req.cookies.roomGap) res.redirect("/login");

      res.render("index", {
        username: req.cookies.roomGap,
        pageTitle: "وبلاگ",
        path: "/"
      });
    } catch (error) {
      next(error);
    }
  }
})();
