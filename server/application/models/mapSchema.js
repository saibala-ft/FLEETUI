const { Schema, model, mongoose } = require("mongoose");
const { roboSchema, zoneSchema } = require("./roboSchema");
const { dashboardConnection } = require("../../common/db_config");

const mapSchema = new Schema( // yet to add proj_id, WIP
  {
    mapId: {
      type: String,
      required: [true, "map_Id is required!"],
      unique: true,
    },
    mapName: {
      type: String,
      required: [true, "map_Name is required!"],
      trim: true,
    },
    imgUrl: { type: String, default: "" },
    zones: [zoneSchema],
    robots: [roboSchema],
  },
  { timestamps: true, versionKey: false }
);
const dumMapModel = dashboardConnection.model("mapData", mapSchema, "mapData");

module.exports = dumMapModel;
