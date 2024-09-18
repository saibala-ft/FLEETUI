const express = require("express");
const {
  getAgvTelemetry,
  getGrossTaskStatus,
  getRoboStateCount,
  getRoboActivities,
} = require("../controllers/liveStreamController/telemetryController");

const liveStreamRouter = express.Router();
liveStreamRouter.get("/live-AMR-pos/:mapId", getAgvTelemetry);
liveStreamRouter.post("/get-tasks-status/:mapId", getGrossTaskStatus);
liveStreamRouter.post("/get-robos-state/:mapId", getRoboStateCount);
liveStreamRouter.post("/get-robo-activities", getRoboActivities);

module.exports = liveStreamRouter;
