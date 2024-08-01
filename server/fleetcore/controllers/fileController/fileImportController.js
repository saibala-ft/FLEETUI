const decompress = require("decompress");
const fs = require("fs");
const path = require("path");
const { copyImages } = require("./fileExportController");
const { projectModel } = require("../../models/projectSchema");

const validateExtractedFile = async ({ target }) => {
  let fileArr = ["/mapInfo.json", "/projInfo.json", "/roboInfo.json"];
  const files = fs.readdirSync(target);
  if (files.length < 3) return false;
  fileArr.forEach((file) => {
    if (!fs.existsSync(target + file)) return false;
  });
  return true;
};

const renameProjFile = async ({ target, alterName }) => {
  let doc = await projectModel.exists({ projectName: alterName });
  if (doc)
    return res.status(409).json({
      idExist: false,
      nameExist: true,
      msg: "project with this name already exists, you can't insert into database",
    });
  const data = JSON.parse(fs.readFileSync(target + "/projInfo.json"));
  data.project.projectName = alterName;
  fs.writeFileSync(target + "/projInfo.json", JSON.stringify(data, null, 2));
};
//..

const extractProjFile = async (req, res, next) => {
  try {
    const absPath = path.resolve("./proj_assets/projectFile"); // returns absolute path of the given file or folder! (helps to find a file)
    const destDirName = path.basename(
      // ( dist.txt - .txt ) => dist
      req.file.originalname,
      path.extname(req.file.originalname) // returns extension type
    );
    // respond has been sent.. background process (incase of emergency use timeOut)
    await decompress(absPath + `/${req.file.originalname}`, absPath); // absPath + `/${destDirName}` [ alter ]
    if (fs.existsSync(absPath + `/${req.file.originalname}`))
      fs.unlinkSync(absPath + `/${req.file.originalname}`);
    next();
  } catch (err) {
    console.log("error occ : ", err);
    res.status(500).json({ error: err, msg: "operation failed" });
  }
};

const parseProjectFile = async (req, res, next) => {
  // const { isRenamed, alterName } = JSON.parse(req.body.projRename);
  let isRenamed = false;
  let alterName = "altered_name";
  const target = path.resolve("./proj_assets/projectFile/");

  const isDirValidate = validateExtractedFile({ target });
  if (!isDirValidate)
    return res.status(400).json({ isZipValidate: false, msg: "Files missing" });

  try {
    if (isRenamed) await renameProjFile({ target, alterName });

    const { project, img } = JSON.parse(
      fs.readFileSync(target + "/projInfo.json")
    );
    const { _id, projectName } = project;
    const doc = await projectModel.findById("669e27f46d07913165284ad3"); // _id : 669e27f46d07913165284ad3
    if (doc)
      return res.status(409).json({
        idExist: true,
        msg: "Seems project already exists!(project with this Id already exist)",
      });
    const data = await projectModel.exists({ projectName: projectName });
    if (data)
      return res.status(409).json({
        idExist: false,
        nameExist: true,
        msg: "project with this name already exists, you can't insert into database",
      });
    if (img.length)
      copyImages({
        imgUrlArr: img,
        src: "projectFile",
        dest: "dashboardMap",
      });
    // restoreRobots();
    return res.json("good");
  } catch (err) {
    console.log("error occ : ", err);
    res.status(500).json({ error: err, msg: "operation failed" });
  }
};

module.exports = { extractProjFile, parseProjectFile };

// 409 - conflict
