const { get } = require("mongoose");
const { Map, Robo } = require("../../../application/models/mapSchema");

const eventStreamHeader = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
};

const getSampSeries = () => {
  let arr = [];
  for (let i = 1; i <= 5; i++) {
    arr.push({
      rate: Math.floor(Math.random() * 100),
      time: new Date().toLocaleString("en-IN", {
        // day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }),
    });
  }
  return arr;
};

let throughPutArr = getSampSeries();
let starvationRateArr = getSampSeries();
let pickAccuracyArr = getSampSeries();
let errRateArr = getSampSeries();
//..

const getFleetThroughput = (req, res, next) => {
  fetch(`http://fleetIp:8080/fms/amr/get_throughput_stats`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ timeStamp1: "", timeStamp2: "" }),
  })
    .then((response) => {
      if (!response.ok) {
        req.responseStatus = "NOT_OK";
        return next();
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      req.fleetData = data;
    })
    .catch((err) => {
      req.fleetErr = err;
    });
  next();
};

const throughput = async (req, res, next) => {
  const mapId = req.params.mapId;
  const { timeSpan } = req.body;
  try {
    //..
    const isMapExist = await Map.exists({ _id: mapId });
    if (!isMapExist)
      return res.status(500).json({ msg: "map not found!", map: null });

    const mapData = await Map.findOne({ _id: mapId });
    // const mapData = await Map.findOneAndUpdate(
    //   { _id: mapId },
    //   {
    //     $push: {
    //       "throughPut.Stat": { $each: dummyStat }, // can push multiple entries to the array using $each
    //       "throughPut.inProg": InProgress,
    //     },
    //   },
    //   { new: true }
    // );
    // let throughput = mapData.throughPut;

    if (timeSpan === "week")
      return res.status(200).json({
        msg: "data sent",
        throughput: Array.from({ length: 7 }, () => {
          return {
            rate: Math.floor(Math.random() * 100),
            time: new Date().toLocaleString("en-IN", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            }),
          };
        }),
      });
    else if (timeSpan === "month")
      return res.status(200).json({
        msg: "data sent",
        throughput: Array.from({ length: 30 }, () => {
          return {
            rate: Math.floor(Math.random() * 100),
            time: new Date().toLocaleString("en-IN", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            }),
          };
        }),
      });
    throughPutArr.push({
      rate: Math.floor(Math.random() * 100),
      time: new Date().toLocaleString("en-IN", {
        hour: "numeric",
        minute: "numeric",
      }),
    });
    return res.status(200).json({
      msg: "data sent",
      throughput: throughPutArr,
      // throughput: throughput,
    });
  } catch (err) {
    console.log("error occured : ", err);
    if (err.name === "CastError")
      return res.status(400).json({ error: err, msg: "not valid map Id" });
    res.status(500).json({ opt: "failed", error: err });
  }
};

const getFleetStarvation = (req, res, next) => {
  fetch(`http://fleetIp:8080/-----`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ timeStamp1: "", timeStamp2: "" }),
  })
    .then((response) => {
      if (!response.ok) {
        req.responseStatus = "NOT_OK";
        return next();
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      req.fleetData = data;
    })
    .catch((err) => {
      req.fleetErr = err;
    });
  next();
};

const starvationRate = async (req, res) => {
  const mapId = req.params.mapId;
  const { timeSpan } = req.body;
  try {
    const isMapExist = await Map.exists({ _id: mapId });
    if (!isMapExist)
      return res.status(500).json({ msg: "map not found!", map: null });
    const mapData = await Map.findOne({ _id: mapId });
    // const mapData = await Map.findOneAndUpdate(
    //   { _id: mapId },
    //   {
    //     $push: {
    //       "throughPut.Stat": { $each: dummyStat }, // can push multiple entries to the array using $each
    //       "throughPut.inProg": InProgress,
    //     },
    //   },
    //   { new: true }
    // );
    // let throughput = mapData.throughPut;

    if (timeSpan === "week")
      return res.status(200).json({
        msg: "data sent",
        starvation: Array.from({ length: 7 }, () => {
          return {
            rate: Math.floor(Math.random() * 100),
            time: new Date().toLocaleString("en-IN", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            }),
          };
        }),
      });
    else if (timeSpan === "month")
      return res.status(200).json({
        msg: "data sent",
        starvation: Array.from({ length: 30 }, () => {
          return {
            rate: Math.floor(Math.random() * 100),
            time: new Date().toLocaleString("en-IN", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            }),
          };
        }),
      });
    starvationRateArr.push({
      rate: Math.floor(Math.random() * 100),
      time: new Date().toLocaleString("en-IN", {
        hour: "numeric",
        minute: "numeric",
      }),
    });
    return res.status(200).json({
      msg: "data sent",
      starvation: starvationRateArr,
      map: mapData,
    });
  } catch (err) {
    console.log("error occured : ", err);
    if (err.name === "CastError")
      return res.status(400).json({ msg: "not valid map Id" });
    res.status(500).json({ opt: "failed", error: err });
  }
};

const getFleetPickAccuracy = async (req, res) => {
  fetch(`http://fleetIp:8080/-----`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ timeStamp1: "", timeStamp2: "" }),
  })
    .then((response) => {
      if (!response.ok) {
        req.responseStatus = "NOT_OK";
        return next();
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      req.fleetData = data;
    })
    .catch((err) => {
      req.fleetErr = err;
    });
  next();
};

const pickAccuracy = async (req, res) => {
  const mapId = req.params.mapId;
  const { timeSpan } = req.body;
  try {
    const isMapExist = await Map.exists({ _id: mapId });
    if (!isMapExist)
      return res.status(500).json({ msg: "map not found!", map: null });
    const mapData = await Map.findOne({ _id: mapId });
    // const mapData = await Map.findOneAndUpdate(
    //   { _id: mapId },
    //   {
    //     $push: {
    //       "throughPut.Stat": { $each: dummyStat }, // can push multiple entries to the array using $each
    //       "throughPut.inProg": InProgress,
    //     },
    //   },
    //   { new: true }
    // );
    // let throughput = mapData.throughPut;

    if (timeSpan === "week")
      return res.status(200).json({
        msg: "data sent",
        pickAccuracy: Array.from({ length: 7 }, () => {
          return {
            rate: Math.floor(Math.random() * 100),
            time: new Date().toLocaleString("en-IN", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            }),
          };
        }),
      });
    else if (timeSpan === "month")
      return res.status(200).json({
        msg: "data sent",
        pickAccuracy: Array.from({ length: 30 }, () => {
          return {
            rate: Math.floor(Math.random() * 100),
            time: new Date().toLocaleString("en-IN", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            }),
          };
        }),
      });
    pickAccuracyArr.push({
      rate: Math.floor(Math.random() * 100),
      time: new Date().toLocaleString("en-IN", {
        hour: "numeric",
        minute: "numeric",
      }),
    });
    return res.status(200).json({
      msg: "data sent",
      pickAccuracy: pickAccuracyArr,
      map: mapData,
    });
  } catch (err) {
    console.log("error occured : ", err);
    if (err.name === "CastError")
      return res.status(400).json({ msg: "not valid map Id" });
    res.status(500).json({ opt: "failed", error: err });
  }
};

const getFleetErrRate = async (req, res) => {
  fetch(`http://fleetIp:8080/-----`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ timeStamp1: "", timeStamp2: "" }),
  })
    .then((response) => {
      if (!response.ok) {
        req.responseStatus = "NOT_OK";
        return next();
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      req.fleetData = data;
    })
    .catch((err) => {
      req.fleetErr = err;
    });
  next();
};

const errRate = async (req, res) => {
  const mapId = req.params.mapId;
  const { timeSpan } = req.body;
  try {
    const isMapExist = await Map.exists({ _id: mapId });
    if (!isMapExist)
      return res.status(500).json({ msg: "map not found!", map: null });
    const mapData = await Map.findOne({ _id: mapId });
    // const mapData = await Map.findOneAndUpdate(
    //   { _id: mapId },
    //   {
    //     $push: {
    //       "throughPut.Stat": { $each: dummyStat }, // can push multiple entries to the array using $each
    //       "throughPut.inProg": InProgress,
    //     },
    //   },
    //   { new: true }
    // );
    // let throughput = mapData.throughPut;

    if (timeSpan === "week")
      return res.status(200).json({
        msg: "data sent",
        errRate: Array.from({ length: 7 }, () => {
          return {
            rate: Math.floor(Math.random() * 100),
            time: new Date().toLocaleString("en-IN", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            }),
          };
        }),
      });
    else if (timeSpan === "month")
      return res.status(200).json({
        msg: "data sent",
        errRate: Array.from({ length: 30 }, () => {
          return {
            rate: Math.floor(Math.random() * 100),
            time: new Date().toLocaleString("en-IN", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            }),
          };
        }),
      });
    errRateArr.push({
      rate: Math.floor(Math.random() * 100),
      time: new Date().toLocaleString("en-IN", {
        hour: "numeric",
        minute: "numeric",
      }),
    });
    return res.status(200).json({
      msg: "data sent",
      errRate: errRateArr,
      map: mapData,
    });
  } catch (err) {
    console.log("error occured : ", err);
    if (err.name === "CastError")
      return res.status(400).json({ msg: "not valid map Id" });
    res.status(500).json({ opt: "failed", error: err });
  }
};

const getRoboFleetGraph = async () => {
  fetch(`http://fleetIp:8080/-----`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ timeStamp1: "", timeStamp2: "" }),
  })
    .then((response) => {
      if (!response.ok) {
        req.responseStatus = "NOT_OK";
        return next();
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      req.fleetData = data;
    })
    .catch((err) => {
      req.fleetErr = err;
    });
  next();
};

const getCpuUtilization = async (req, res) => {
  const mapId = req.params.mapId;

  try {
    const isMapExist = await Map.exists({ _id: mapId });
    if (!isMapExist)
      return res.status(500).json({ msg: "map not found!", map: null });
    const mapData = await Map.findOne({ _id: mapId });

    return res.status(200).json({
      msg: "data sent",
      cpuUtil: Math.floor(Math.random() * 30) + 10,
      map: mapData,
    });
  } catch (err) {
    console.log("error occured : ", err);
    if (err.name === "CastError")
      return res.status(400).json({ msg: "not valid map Id" });
    res.status(500).json({ opt: "failed", error: err });
  }
};

const getRoboUtilization = async (req, res) => {
  const mapId = req.params.mapId;
  try {
    const isMapExist = await Map.exists({ _id: mapId });
    if (!isMapExist)
      return res.status(500).json({ msg: "map not found!", map: null });
    const mapData = await Map.findOne({ _id: mapId });

    return res.status(200).json({
      msg: "data sent",
      roboUtil: Math.floor(Math.random() * 30) + 10,
      map: mapData,
    });
  } catch (err) {
    console.log("error occured : ", err);
    if (err.name === "CastError")
      return res.status(400).json({ msg: "not valid map Id" });
    res.status(500).json({ opt: "failed", error: err });
  }
};

const getBatteryStat = async (req, res) => {
  const mapId = req.params.mapId;
  try {
    const isMapExist = await Map.exists({ _id: mapId });
    if (!isMapExist)
      return res.status(500).json({ msg: "map not found!", map: null });
    const mapData = await Map.findOne({ _id: mapId });

    return res.status(200).json({
      msg: "data sent",
      batteryStat: Math.floor(Math.random() * 30) + 10,
      map: mapData,
    });
  } catch (err) {
    console.log("error occured : ", err);
    if (err.name === "CastError")
      return res.status(400).json({ msg: "not valid map Id" });
    res.status(500).json({ opt: "failed", error: err });
  }
};

const getMemoryStat = async (req, res) => {
  const mapId = req.params.mapId;
  try {
    const isMapExist = await Map.exists({ _id: mapId });
    if (!isMapExist)
      return res.status(500).json({ msg: "map not found!", map: null });
    const mapData = await Map.findOne({ _id: mapId });

    return res.status(200).json({
      msg: "data sent",
      memoryStat: Math.floor(Math.random() * 30) + 10,
      map: mapData,
    });
  } catch (err) {
    console.log("error occured : ", err);
    if (err.name === "CastError")
      return res.status(400).json({ msg: "not valid map Id" });
    res.status(500).json({ opt: "failed", error: err });
  }
};

const getNetworkStat = async (req, res) => {
  const mapId = req.params.mapId;
  try {
    const isMapExist = await Map.exists({ _id: mapId });
    if (!isMapExist)
      return res.status(500).json({ msg: "map not found!", map: null });
    const mapData = await Map.findOne({ _id: mapId });

    return res.status(200).json({
      msg: "data sent",
      networkStat: Math.floor(Math.random() * 30) + 10,
      map: mapData,
    });
  } catch (err) {
    console.log("error occured : ", err);
    if (err.name === "CastError")
      return res.status(400).json({ msg: "not valid map Id" });
    res.status(500).json({ opt: "failed", error: err });
  }
};

const getIdleTime = async (req, res) => {
  const mapId = req.params.mapId;
  try {
    const isMapExist = await Map.exists({ _id: mapId });
    if (!isMapExist)
      return res.status(500).json({ msg: "map not found!", map: null });
    const mapData = await Map.findOne({ _id: mapId });

    return res.status(200).json({
      msg: "data sent",
      idleTime: Math.floor(Math.random() * 30) + 10,
      map: mapData,
    });
  } catch (err) {
    console.log("error occured : ", err);
    if (err.name === "CastError")
      return res.status(400).json({ msg: "not valid map Id" });
    res.status(500).json({ opt: "failed", error: err });
  }
};

const getRoboErr = async (req, res) => {
  const mapId = req.params.mapId;
  try {
    const isMapExist = await Map.exists({ _id: mapId });
    if (!isMapExist)
      return res.status(500).json({ msg: "map not found!", map: null });
    const mapData = await Map.findOne({ _id: mapId });

    return res.status(200).json({
      msg: "data sent",
      roboErr: Math.floor(Math.random() * 30) + 10,
      map: mapData,
    });
  } catch (err) {
    console.log("error occured : ", err);
    if (err.name === "CastError")
      return res.status(400).json({ msg: "not valid map Id" });
    res.status(500).json({ opt: "failed", error: err });
  }
};

module.exports = {
  getFleetThroughput,
  throughput,
  getFleetStarvation,
  starvationRate,
  getFleetPickAccuracy,
  pickAccuracy,
  getFleetErrRate,
  errRate,
  getRoboFleetGraph,
  getCpuUtilization,
  getRoboUtilization,
  getBatteryStat,
  getMemoryStat,
  getNetworkStat,
  getIdleTime,
  getRoboErr,
};
