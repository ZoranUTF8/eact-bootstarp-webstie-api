require("dotenv").config();
require("express-async-errors");
// Swagger API
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

const express = require("express");
const app = express();

// Secuirty packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

// connect db
const connectDb = require("./db/connect");
// routers
const authRouter = require("./routes/auth");
const employeesRouter = require("./routes/employees");
// middleware
const authenticationMiddleware = require("./middleware/authentication");
// express.json need to be above routes
app.use(express.json());

//
app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());

// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/employees", authenticationMiddleware, employeesRouter);

// General api route with the link to the Api documentation
app.use(
  "/api-documentation",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);
app.get("/", (req, res) => {
  res.send(
    "<h1>Employee website API</h1> <a href='/api-documentation'>Documentation</a>"
  );
});

// error handler    git push --set-upstream origin master
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// extra packages

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

/*
Connect to db and than start the server if connection is established
*/
const start = async () => {
  try {
    await connectDb(process.env.MONGO_URI)
      .then((connection) =>
        app.listen(port, () =>
          console.log(
            `Server is listening on port ${port}... and connected to db`
          )
        )
      )
      .catch((error) => console.log(`Error connecting to mongo atlas`));
  } catch (error) {
    console.log(error);
  }
};

start();
