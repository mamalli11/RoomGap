const path = require("path");
const cors = require("cors");

const morgan = require("morgan");
const helmet = require("helmet");
const express = require("express");
const createError = require("http-errors");
const cookieParser = require('cookie-parser');
const ExpressEjsLayouts = require("express-ejs-layouts");

require("dotenv").config();

const { AllRoutes } = require("./router/router");
const { initialSocket } = require("./utils/initSocket");
const { socketHandler } = require("./socket.io");

module.exports = class Application {
  #app = express();
  #PORT;
  constructor(PORT,) {
    this.#PORT = PORT;
    this.configApplication();
    this.initTemplateEngine();
    this.createServer();
    this.createRoutes();
    // this.errorHandling();
  }
  configApplication() {
    this.#app.use(cors());
    this.#app.use(morgan("dev"));
    this.#app.use(express.json());
    this.#app.use(express.urlencoded({ extended: true }));
    this.#app.use(express.static(path.join(__dirname, "..", "public")));
    this.#app.use(cookieParser());

    //* Set security HTTP headers
    this.#app.use(helmet({ contentSecurityPolicy: false }));

  }
  createServer() {
    const http = require("http");
    const server = http.createServer(this.#app);
    const io = initialSocket(server);
    socketHandler(io);
    server.listen(this.#PORT, () => {
      console.log("run > http://localhost:" + this.#PORT);
    });
  }
  initTemplateEngine() {
    this.#app.set("view engine", "ejs");
    this.#app.set("Views", "views");
    this.#app.use(ExpressEjsLayouts);
    this.#app.set("layout", "./layouts/master");

  }
  createRoutes() {
    this.#app.use(AllRoutes);
    
    //* 404 Page
    this.#app.use(require("./controllers/errorcontroller").get404);
  }
  errorHandling() {
    this.#app.use((req, res, next) => {
      next(createError.NotFound("آدرس مورد نظر یافت نشد"));
    });
    this.#app.use((error, req, res, next) => {
      const serverError = createError.InternalServerError();
      const statusCode = error.status || serverError.status;
      const message = error.message || serverError.message;
      return res.status(statusCode).json({
        statusCode,
        errors: {
          message,
        },
      });
    });
  }
};
