const { Map } = require("./../models/mapSchema");
const { roboSchema, zoneSchema } = require("./../models/roboSchema");
const {
  projectModel,
  siteModel,
} = require("../../fleetcore/models/projectSchema");

const insertMapId = async ({ MapId, mapName, projectName, siteName }) => {
  const proj = await projectModel.findOneAndUpdate(
    {
      projectName: projectName,
      "sites.siteName": siteName,
    },
    {
      $push: {
        "sites.$.maps": {
          // '$' positional operator, from array it matches the query condition..
          mapId: MapId,
          mapName: mapName,
        },
      },
    }
  );
  return proj;
};

const mapInsert = async (req, res) => {
  const mapData = JSON.parse(req.body.mapData);
  try {
    mapData.imgUrl = `localhost:3000/dashboard/${req.file.originalname}`;
    const { projectName, siteName, mapName, imgUrl, zones, robots } = mapData;

    const map = await Map.exists({ mapName: mapName });
    if (map) return res.json({ exits: true, msg: "name already exits" });

    const newMap = await new Map({ mapName, imgUrl, zones, robots }).save();
    const MapId = newMap._id;
    const proj = await insertMapId({ MapId, mapName, projectName, siteName });
    if (!proj)
      return res.status(400).json({
        succeded: false,
        msg: "project name or site name not exists!",
      });
    res.status(201).json({ exits: false, msg: "data inserted!" });
  } catch (err) {
    console.log("err occs : ", err);
    res.status(500).json({ msg: "error occured while inserting!" });
  }
};

const mapGet = async (req, res) => {
  try {
    const data = await Map.find({ mapId: req.params.mapId });
    if (data == null) {
      res.send(404).json({ msg: "Map not found!" });
    }
    res.json(data);
  } catch (err) {
    console.log("err occ : ", err);
    res.status(500).json({ error: err, msg: "request not attained!" });
  }
};

const newRoboInMap = async (req, res, next) => {
  try {
    const { new_robo } = req.body;
    const mapId = req.params.mapId;
    const doc = await Map.findOne({ mapId });
    if (!doc)
      return res.status(400).json({ exits: false, msg: "mapId not exits" });
    const isExists = doc.robots.some((robo) => robo.roboId === new_robo.roboId);
    if (isExists)
      return res.status(400).json({
        inserted: false,
        msg: "Robo (roboId) already exists!",
        updatedMap: doc,
      });
    doc.robots = [...doc.robots, new_robo]; // doc.robots.push(new_robo)
    const updatedMap = await doc.save();
    return res.status(201).json({
      inserted: true,
      msg: "new robo data inserted!",
      updatedMap: updatedMap,
    });
  } catch (err) {
    console.log("err occs : ", err);
    if (err.code === 11000)
      return res.status(400).json({
        msg: "Duplicate key error: Robo (roboId) already exists!",
        error: err,
      });
    return res
      .status(500)
      .json({ msg: "error occured, while inserting new robo!", error: err });
  }
};

const deleteRoboInMap = async (req, res, next) => {
  try {
    const doc = await Map.findOne({ mapId: req.params.mapId });
    if (!doc)
      return res
        .status(400)
        .json({ opt: "failed", msg: "mapId/mapname not exist!" });
    const ind = doc.robots.findIndex(
      (robo) => robo.roboId === req.params.roboId
    );
    if (ind === -1)
      return res.status(400).json({ opt: "failed", msg: "robo not exist!" });
    doc.robots.splice(ind, 1);
    doc.save();
    res.status(200).json({ opt: "succeed", msg: "Robo deleted from map" });
  } catch (err) {
    console.log("err occ : ", err);
    res.status(500).json({
      opt: "failed",
      msg: "error occured while deleting robo!",
      error: err,
    });
  }
};

const deleteMap = async (req, res, next) => {
  try {
    const mapId = req.params.mapId;
    const map = await Map.deleteOne({ mapId: mapId });
    if (map.deletedCount === 0)
      return res.status(400).json({ opt: "failed", msg: "map not exist!" });
    // await Map.deleteOne({ mapId: req.params.mapId });
    return res.status(200).json({ opt: "succeed!" });
  } catch (err) {
    console.log("err occ : ", err);
    res.send(500).json({
      opt: "failed",
      msg: "error occured while deleting map!",
      error: err,
    });
  }
};

const delMapImg = async (req, res, next) => {
  try {
    const mapDoc = await Map.findOne({ mapId: req.params.mapId });
    if (!mapDoc)
      return res
        .status(400)
        .json({ opt: "failed", msg: "Map does not exist!" });
    const url = new URL(mapDoc.imgUrl);
    const imgPath = url.pathname.split("/")[2]; // bending through production!
    if (fs.existsSync(path.join("proj_assets/dashboardMap" + `/${imgPath}`))) {
      fs.unlinkSync(path.join("proj_assets/dashboardMap" + `/${imgPath}`));
      mapDoc.imgUrl = "";
      const updatedMap = await mapDoc.save();
    } else res.status(404).json({ opt: "Failed!", msg: "File not found!" });
    if (req.url.split("/")[2] === "replace_img") return next();
    else
      return res.status(200).json({
        img_deleted: true,
        msg: "Operation succeeded!",
        updatedMap: updatedMap,
      });
  } catch (err) {
    res.json({ opt: "failed!", error: err });
  }
};

const newMapImg = async (req, res, next) => {
  try {
    const map = await Map.findOne({ mapId: req.params.mapId });
    if (!map)
      return res
        .status(400)
        .json({ exists: false, msg: "mapId doesn't exists!" });
    map.imgUrl = `localhost:3000/dashboard/${req.file.originalname}`;
    await map.save();
    return res
      .status(200)
      .json({ inserted: true, Map_exists: true, opt: "succeed!" });
  } catch (err) {
    return res.status(404).json({ opt: "failed", error: err });
  }
};

module.exports = {
  mapInsert,
  mapGet,
  newRoboInMap,
  deleteRoboInMap,
  deleteMap,
  delMapImg,
  newMapImg,
};
