//^ Error 404
exports.get404 = (req, res) => {
    res.render("404", {
        Code: "404",
        pageTitle: "Page not found",
        Message: "I can't find the page I want",
    });
}
