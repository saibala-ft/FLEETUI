const mqtt = require("mqtt");
const { Map, Robo } = require("../../../application/models/mapSchema");
require("dotenv").config();

let mqttClient = null;
let endResponse = null;
let factScheetAmr = [];

const initMqttConnection = () => {
  if (mqttClient) mqttClient.end();
  mqttClient = mqtt.connect(
    `mqtt://${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`
  ); // .connect(host,  {username: , password:  })

  mqttClient.on("connect", () => {
    // mqttClient.subscribe("maps/map1", { qos: 0 });
    console.log("Mqtt client connected");
  });

  mqttClient.on("error", (err) => {
    console.log("Mqtt Err occured : ", err);
    mqttClient.end();
    endResponse.end();
  });

  mqttClient.on("disconnect", () => {
    console.log("Mqtt client disconnected");
    endResponse.end();
  });
};

const eventStreamHeader = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
};

// initMqttConnection();
const getAgvTelemetry = (req, res) => {
  const mapId = req.params.mapId;
  initMqttConnection();
  endResponse = res;
  try {
    res.writeHead(200, eventStreamHeader);

    res.on("close", () => {
      res.end();
    });

    mqttClient.subscribe("map/map1", { qos: 0 });
    mqttClient.on("message", (topic, message) => {
      let pos = { topic: topic, message: message.toString("utf8") };
      res.write(`data: ${JSON.stringify(pos)}\n\n`);
      // console.log(topic, message.toString("utf8"));
    });
  } catch (err) {
    console.error("Error in getAgvTelemetry:", err);
    res.status(500).json({ error: err.message, msg: "Internal Server Error" });
  }
};

const getGrossTaskStatus = async (req, res) => {
  const mapId = req.params.mapId;
  try {
    let isMapExists = await Map.exists({ _id: mapId });
    if (!isMapExists)
      return res.status(400).json({ msg: "Map not found!", map: null });
    const map = await Map.findOne({ _id: mapId });
    let tasksStatus = [];
    for (let i of [1, 2, 3, 4, 5]) {
      tasksStatus.push(Math.floor(Math.random() * 10));
    }
    return res
      .status(200)
      .json({ tasksStatus: tasksStatus, map: map, msg: "data sent!" });
  } catch (error) {
    console.error("Error in getting tasks status :", err);
    res.status(500).json({ error: err.message, msg: "Internal Server Error" });
  }
};

const getRoboStateCount = async (req, res) => {
  const mapId = req.params.mapId;
  try {
    let isMapExists = await Map.exists({ _id: mapId });
    if (!isMapExists)
      return res.status(400).json({ msg: "Map not found!", map: null });
    const map = await Map.findOne({ _id: mapId });
    let roboStates = [];
    for (let i of [1, 2, 3]) {
      roboStates.push(Math.floor(Math.random() * 60));
    }
    return res
      .status(200)
      .json({ roboStates: roboStates, map: map, msg: "data sent!" });
  } catch (error) {
    console.error("Error in getting tasks status :", err);
    res.status(500).json({ error: err.message, msg: "Internal Server Error" });
  }
};

const getRoboActivities = async (req, res) => {
  const { mapId } = req.body;
  try {
    let isMapExists = await Map.exists({ _id: mapId });
    if (!isMapExists)
      return res.status(400).json({ msg: "Map not found!", map: null });
    const map = await Map.findOne({ _id: mapId });
    let roboActivities = [
      {
        roboId: 1,
        roboName: "AMR-001",
        task: "PICK SCREWS",
        taskStatus: "In Progress",
        desc: "N/A",
      },
      {
        roboId: 2,
        roboName: "AMR-002",
        task: "DROP SCREWS",
        taskStatus: "In Progress",
        desc: "N/A",
      },
    ];
    return res
      .status(200)
      .json({ roboActivities: roboActivities, map: map, msg: "data sent!" });
  } catch (error) {
    console.error("Error in getting tasks status :", err);
    res.status(500).json({ error: err.message, msg: "Internal Server Error" });
  }
};

const getRoboFactSheet = async (req, res) => {};

const getRoboDetails = async (req, res) => {
  const { mapId } = req.body;
  try {
    let isMapExists = await Map.exists({ _id: mapId });
    if (!isMapExists)
      return res.status(400).json({ msg: "Map not found!", map: null });
    const { robots } = await Map.findOne(
      { _id: mapId },
      { robots: 1 }
    ).populate({
      // findeOne({filter doc},{projection doc})..
      path: "robots.roboId",
      model: Robo,
    });
    factScheetAmr = robots.map((robo) => {
      let robot = robo.roboId;

      return {
        id: robot._id.toString().slice(15),
        name: robot.roboName,
        imageUrl: "",
        status: "Active",
        battery: Math.floor(Math.random() * 100),
        serialNumber: robot._id.toString().slice(15),
        temperature: Math.floor(Math.random() * 40),
        networkstrength: Math.floor(Math.random() * 80),
        robotutilization: Math.floor(Math.random() * 80),
        cpuutilization: Math.floor(Math.random() * 80),
        memory: Math.floor(Math.random() * 70),
        error: Math.floor(Math.random() * 50),
        batteryPercentage: Math.floor(Math.random() * 100),
        totalPicks: Math.floor(Math.random() * 40),
        totalDrops: Math.floor(Math.random() * 40),
        SignalStrength: "",
        isCharging: Math.floor(Math.random() * 40) > 20 ? true : false,
      };
    });
    return res.status(200).json({
      robots: factScheetAmr,
      msg: "data sent!",
    });
  } catch (error) {
    console.error("Error in getting tasks status :", error);
    res
      .status(500)
      .json({ error: error.message, msg: "Internal Server Error" });
  }
};

module.exports = {
  getAgvTelemetry,
  getGrossTaskStatus,
  getRoboStateCount,
  getRoboActivities,
  getRoboFactSheet,
  getRoboDetails,
  mqttClient,
};
