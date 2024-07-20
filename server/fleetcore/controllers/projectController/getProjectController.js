const { projectModel } = require("../../models/projectSchema");

const getProject = async (req, res, next) => {
  const projectName = req.params.projectName;
  try {
    const project = await projectModel.findOne({ projectName: projectName });
    if (!project)
      return res
        .status(400)
        .json({ exsists: false, msg: "project name not found!" });
    return res
      .status(200)
      .json({ exists: true, project: project, msg: "project returned!" });
  } catch (error) {
    console.log("err occ : ", error);
    return res.status(500).json({ error: err, msg: "request not attained!" });
  }
};

const getProjectList = async (req, res, next) => {
  try {
    const doc = await projectModel.find({}).select("projectName");
    res.status(200).json({ projects: doc, msg: "list sent!" });
  } catch (error) {
    console.log("err occ : ", error);
    return res.status(500).json({ error: error, msg: "request not attained!" });
  }
};

module.exports = { getProject, getProjectList };
