import express from "express";
import cors from "cors";
import cookieparser from "cookie-parser";
const app = express();

///basic configuration
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieparser()); //express does not accept the cookies for that we have import cookiparser

//cors configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "OPTIONS", "DELETE"],
    allowedHeaders: ["content-type", "Authorization"],
  }),
);
//import the routes
import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRoter from "./routes/auth.rout.js";
import ProjectRouter from "./routes/project.rout.js";
app.use("/api/v1/healthCheck", healthCheckRouter);
app.use("/api/v1/auth", authRoter);
app.use("/api/v1/project", ProjectRouter);

app.get("/", (req, res) => {
  res.send("well come to basecampy");
});

export default app;
