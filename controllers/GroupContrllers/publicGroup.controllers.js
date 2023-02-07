// 2022 Sep 25 01:03:42

import Group from "../../models/PublicGroup.model.js";
import Chat from "../../models/Chat.model.js";
import User from "../../models/User.model.js";

export const createGroup = async (req, res) => {
  try {
    let group = new Group({
      name: req.body.name,
      usersLimit: req.body.usersLimit,
      groupImage: req.file.filename,
    });

    group
      .save()
      .then((response) => {
        req.body.users.map(async (userId) => {
          let user = await User.find({ _id: userId });
          user.group.push(req.body.name);
          await user.save();
        });
      })
      .catch((err) => {
        return res
          .status(400)
          .send({ success: false, Message: "got an error while" });
      });
    return res
      .status(200)
      .send({ success: true, Message: "Created group successfully!" });
  } catch (err) {
    return res
      .status(200)
      .send({ success: false, Message: "Internal Server Error!" });
  }
};

export const updateGroup = async (req, res) => {
  let groupId = req.body.groupId;
  let payload = req.body;
  if (req.file) {
    payload.groupImage = req.file.filename;
  }
  try {
    await Group.updateOne({ _id: groupId }, payload);
    return res
      .status(200)
      .send({ success: true, Message: "updated group successfully!" });
  } catch (err) {
    return res.status(500).send({
      success: false,
      Message: "Got an error while updating the group!",
    });
  }
};

export const deleteGroup = async (req, res) => {
  let groupId = req.body.groupId;
  try {
    await Group.deleteOne({ _id: groupId });
    //delete groupChat
    await Chat.deleteMany({ groupId });
    return res
      .status(200)
      .send({ success: true, Message: "Deleted the group successfully!" });
  } catch (err) {
    return res.status(500).send({
      success: false,
      Message: "Got an error while deleting the group",
    });
  }
};
