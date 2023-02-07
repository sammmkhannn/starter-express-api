// Sep 24 2022 23:50:33

import User from "../../models/User.model.js";

//get all users
export const getUsers = async (req, res) => {
    try {
        let users = await User.find();
        return res.status(200).send({ success: true, users });
    } catch (err) {
        return res.status(200).send({ success: false, Message: "Got an error while fetching all users" });
    }
}

//block/unblock user
export const blockUnblockUser = async (req, res) => {
    let userId = req.body.userId;
    try {
        let user = await User.findOne({ _id: userId });
        user.block = !user.block;
        await user.save();
        return res.status(200).send({ success: true, Message: user.block ? "You blocked the User!" : "You unblocked the user!" });
    } catch (err) {
        return res.status(500).send({ success: false, Message: "Internal Server Error" });
    }
}


export const removeUser = async (req, res) => {
    let userId = req.body.userId;

    try {
        let user = await User.findOne({ _id: userId });
        user.deleted = user.deleted;
        await user.save();
        return res.status(200).send({ success: true, Message: "Removed the user!" });
    } catch (err) {
        return res.status(500).send({ success: false, Message: "Internal Server Error!" });
    }
}


export const updateUser = async (req, res) => {
    let userId = req.body.userId;
    
    try {
        await User.updateOne({ _id: userId }, req.body);
        return res.status(200).send({ success: true, Message: "updated the user details" });
    } catch (err) {
        return res.status(500).send({ success: false, Message: "Internal Server Error!" });
    }
}

