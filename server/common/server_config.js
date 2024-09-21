const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:4200",
      "http://192.168.122.149:4200",
    ], // WIP...
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(
  "/dashboard", // virtual path, (just the placeholder for original path)
  express.static(path.join("proj_assets", "dashboardMap")) // "/dashboard/map_1.jpg"
  // or express.static("proj_assets/dashboard")
);

app.use(
  "/roboSpecification",
  express.static(path.join("proj_assets/roboSpecification"))
);

module.exports = app;
