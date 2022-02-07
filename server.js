import express from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import "express-async-errors";
import morgan from "morgan";

import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";

import helmet from "helmet";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";

// db
import connectDB from "./db/connect.js";

// import routes
import authRouter from "./routes/authRoutes.js";
import jobRouter from "./routes/jobsRoutes.js";
// middleware
import errorHandlerMiddleware from "./middleware/error-handler.js";
import notFoundMiddleware from "./middleware/not-found.js";
import authenticateUser from "./middleware/auth.js";

// morgan
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.json())
app.use(helmet())
app.use(xss())
app.use(mongoSanitize())

app.use(express.static(path.resolve(__dirname, "./client/build")));

// Routes


app.use("/api/v1/auth", authRouter);
app.use("/api/v1/job", authenticateUser, jobRouter);

app.get("*", function (request, response) {
  response.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
});

//app use
app.use(errorHandlerMiddleware);
app.use(notFoundMiddleware);

// setting server
const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
