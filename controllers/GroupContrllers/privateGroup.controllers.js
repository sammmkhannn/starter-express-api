// 2022 Sep 25 01:03:42

import Group from "../../models/PrivateGroup.model.js";
import Chat from "../../models/Chat.model.js";
import User from "../../models/User.model.js";

export const createGroup = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let userId = decoded.id;

  let users = req.body.users;
  
  users = [...users.split(','), userId];
  // return res.status(200).send(users);
  try {
    let group = new Group({
      name: req.body.name,
      users: users,
      groupImage: req.file.filename,
      admins: [userId],
    });
    await group.save();
    return res.status(200).send({ success: true, Message: "Group created successfully!" });
  } catch (err) {
    return res.status(200).send({
      success: false,
      Message: "Internal Server Error!",
      err: err.message,
    });
  }
};

export const updateGroup = async (req, res) => {
  let groupId = req.body.groupId;
  let payload = req.body;

  try {
    if (req.file) {
      payload.groupImage = req.file.filename;
    }
    await Group.updateOne({ _id: groupId }, payload);
    return res
      .status(200)
      .send({ success: true, Message: "updated group successfully!" });
  } catch (err) {
    return res.status(500).send({
      success: false,
      Message: "Got an error while updating the group!",
      err: err.message,
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

export const makeAdmin = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let userId = decoded.id;

  let groupId = req.params.groupId;
  try {
    let group = await Group.findOne({ _id: groupId });
    group.admins.push(userId);
    await group.save();
    return res.status(200).send({ success: true, Message: "added as admin" });
  } catch (err) {
    return res.status(500).send({
      success: false,
      Message: "Got an error while the user setting as admin",
    });
  }
};

export const getAllUsers = async (req, res) => {
  let groupId = req.body.groupId;

  try {
    let group = await Group.findOne({ _id: groupId });

    let users = [];
    let groupUserIds = group.users[0].split(",");
    for (let i = 0; i < groupUserIds.length; i++) {
      let user = await User.findOne({ _id: groupUserIds[i].trim() });
      let payload = user;
      payload.isAdmin = group.admins.includes(group.users[i]);
      users.push(payload);
    }

    return res.status(200).send({ success: true, users: users });
  } catch (err) {
    return res.status(200).send({
      success: false,
      Message: "got an error while getting all the users",
      err: err.message,
    });
  }
};

export const updateGroupUsers = async (req, res) => {
  let groupId = req.body.groupId;
  
  try {
    await Group.updateOne({ _id: groupId }, req.body);
    return res
      .status(200)
      .send({ success: true, Message: "Group users have been updated!" });
  } catch (err) {
    return res
      .status(500)
      .send({ success: false, Message: "Got an error whil updating users" });
  }
};
