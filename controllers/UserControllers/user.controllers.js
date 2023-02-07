import User from "../../models/User.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../../utils/sendEmail.js";
import otpGenerator from "otp-generator";
import crypto from "crypto";
import multer from "multer";
import Image from "../../models/Image.model.js";
import Request from "../../models/Request.model.js";
import Filter from "../../models/Filter.model.js";
import formatDate from "../../utils/getDate.js";
import PrivateGroup from "../../models/PrivateGroup.model.js";
import Socket from "../../models/Socket.model.js";
import Message from "../../models/Message.model.js";
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + file.originalname);
  },
});
export const upload = multer({ storage: diskStorage });
export const register = async (req, res) => {
  try {
    let payload = req.body;
    let salt = await bcryptjs.genSalt(10);
    payload.password = await bcryptjs.hash(payload.password, salt);
    let newUser = new User(payload);
   let response = await newUser.save();
    return res
      .status(200)
      .send({ success: true, message: "registered successfully!",user:response });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ success: false, message: err.message });
  }
}; // end register

export const login = async (req, res) => {
  try {
    let payload = req.body;
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      return res.status(400).send("User not found");
    }
    let isValid = await bcryptjs.compare(payload.password, user.password);
    if (!isValid) {
      return res.status(400).send("Invalid password");
    }
    let images = await Image.find({ userId: user._id });
    let userPayload = user;
    if (images.length > 0) {
      userPayload.images = images;
    }
    let token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET);
    let refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET
    );
    let friendRequests = await Request.find({
      receiverId: user._id,
      status: false,
    });

    return res.send({
      success: true,
      message: "User logged in",
      token,
      refreshToken,
      user: {
        _id: user?._id,
        name: user?.name,
        email: user?.email,
        age: user?.age,
        gender: user?.gender,
        lastSeen: user?.lastSeen,
        country: user?.country,
        state: user?.state,
        city: user?.city,
        status: user?.status,
        friendList: user?.friendList,
        showOnline: user?.showOnline,
        hideFriendList: user?.hideFriendList,
        hidPosts: user?.hidePosts,
        allowFriendRequest: user?.allowFriendRequest,
        hideWealthStore: user?.hideWealthStore,
        profile: user?.profileImage,
        hobies: user?.hobies,
        aboutMe: user?.aboutMe,
        deleted: user?.deleted,
        block: user?.block,
        images,
        numberOfFriendRequests: friendRequests.length,
      },
    });
  } catch (err) {
    return res.status(200).send({ success: false, message: err.message });
  }
  // end login
};

export const forgotPassword = async (req, res) => {
  try {

    let user = await User.findOne({ email: req.body.email });

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    user.otp = otp;
    await user.save();
    let userId = user._id;
    sendEmail(
      user.email,
      `Reset Password!`,
      `Hi ${user.name},\n ${otp} is your one time password.`,
      res,
      userId
    );
  } catch (err) {
    res.status(500).send({ success: false, message: err.message });
  }
};

export const verifyOTP = async (req, res) => {
  let id = req.body.id;
  
  try {
    let user = await User.findOne({ _id: id });
    if (req.body.otp != user.otp) {
      return res.status(400).send("Invalid OTP!");
    }
    let token = crypto.randomBytes(64).toString("hex");
    user.resetToken = token;
    //get all info
    let images = await Image.find({ userId: user._id });
    let userPayload = user;
    if (images.length > 0) {
      userPayload.images = images;
    }

    let tokens = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET);
    let refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET
    );
    
    let friendRequests = await Request.find({
      receiverId: user._id,
      status: false,
    });


    user
      .save()
      .then((response) => {
        
        return res.status(200).send({
          success: true,
          message: "verified!",
          token: response.resetToken,
          user: {
            _id: user?._id,
            name: user?.name,
            email: user?.email,
            age: user?.age,
            gender: user?.gender,
            lastSeen: user?.lastSeen,
            country: user?.country,
            state: user?.state,
            city: user?.city,
            status: user?.status,
            friendList: user?.friendList,
            showOnline: user?.showOnline,
            hideFriendList: user?.hideFriendList,
            hidPosts: user?.hidePosts,
            allowFriendRequest: user?.allowFriendRequest,
            hideWealthStore: user?.hideWealthStore,
            profile: user?.profileImage,
            hobies: user?.hobies,
            aboutMe: user?.aboutMe,
            deleted: user?.deleted,
            block: user?.block,
            resetToken:user?.resetToken,
            images,
            numberOfFriendRequests: friendRequests.length,
          },
          token:tokens,
          refreshToken
        });
      })
      .catch((err) => {
        return res.status(400).send({ success: false, message: err.message });
      });
  } catch (err) {
    res.status(500).send({ success: false, message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let id = decoded.id;

  try {
    let user = await User.findOne({ _id: id });
    if (user.resetToken != req.body.resetToken) {
      return res.status(400).send("Invalid token!");
    }
    let salt = bcryptjs.genSaltSync(10);
    user.password = bcryptjs.hashSync(req.body.password, salt);
    user.resetToken = "";
    await user.save();
    return res
      .status(200)
      .send({ success: true, message: "Successfull reset your password!" });
  } catch (err) {
    return res.status(500).send({ success: false, message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let id = decoded.id;
  try {
    let payload = req.body;
    if (req.file) {
      payload.profile = req.file.filename;
    }
    let updated = await User.updateOne({ _id: id }, payload);
    return res.status(200).send({
      success: true,
      message: "profile successfully updated!",
      updated,
    });
  } catch (err) {
    return res.status(500).send({ success: false, message: err.message });
  }
};

export const completeProfile = async (req, res) => {

  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let id = decoded.id;
 

  try {
    await User.updateOne({ _id: id }, req.body);
    return res
      .status(200)
      .send({ success: true, Message: "Successfully completed the profile!" });
  } catch (err) {
    return res.status(500).send({ success: false, Message: err.message });
  }
};

export const getAllProfilePictures = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let id = decoded.id;

  try {
    let images = await Image.find({ userId: id });
    return res.status(200).send(images);
  } catch (err) {
    return res.status(500).send({ success: false, message: err.message });
  }
};

export const uploadProfilePicture = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let id = decoded.id;
  try {
    
    let user = await User.findOne({ _id: id });

    user.profile = process.env.BASE_URL + req.file.filename;
    await user.save();
    return res.status(200).send({
      success: true,
      message: "Image has been uploaded successfully!",
    });
  } catch (err) {
    return res.status(200).send({ success: true, message: err.message });
  }
};

export const setProfilePicture = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let userId = decoded.id;
  let imageId = req.body.imageId;
  try {
    let user = await User.findOne({ _id: userId });
    let image = await Image.findOne({ _id: imageId });
    user.profile = image._id;
    await user.save();
    return res
      .status(200)
      .send({ success: true, message: "successfully set profile picture" });
  } catch (err) {
    return res.status(200).send({ success: false, message: err.message });
  }
};

export const delImage = async (req, res) => {
  let id = req.body.imageId;
  try {
    await Image.deleteOne({ _id: id });
    return res
      .status(200)
      .send({ success: true, message: "Image has been deleted successfully!" });
  } catch (err) {
    return res.status(500).send({ success: false, message: err.message });
  }
};

export const filterUsers = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let userId = decoded.id;

  try {
  
    let filter = await Filter.findOne({ userId: userId });

   
   //get the filter values
    let { minAge, maxAge, gender, city, state, country } = filter;
    //CREATE THE QUERY WITH ALL THE FILTER VALUES PASS
    let query = {};
    gender ? query.gender = gender : "";
    city ? query.city = city : "";
    state ? query.state = state : "";
    country ? query.country = country : "";
    minAge && maxAge ? query.$and = [{ age: { $lte: maxAge } }, {age: { $gte: minAge } }] : "";


    //if the user does not select a filter
    if (!filter || (!gender && !country && !state && !city && !minAge && !maxAge)) {
      users = await User.find({});

      if (users.length <= 0) {
        return res.status(404).send({success:false,Message:"Users Not Found!"})
      }

    }
   
    //get all the matching users found in the database
    let users = await User.find({ _id: { $ne: userId }, ...query });

    if (users.length <= 0) {
      return res.status(404).send({ success: false, Message: 'Users Not Found!' });
    }

      let modifiedUsers = users.map((user) => {
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          age: user.age,
          gender: user.gender,
          lastSeen: user.lastSeen,
          country: user.country,
          state: user.state,
          city: user.city,
          password: user.password,
          status: user.status,
          friendList: user.friendList,
          showOnline: user.showOnline,
          showLastSeen: user.showLastSeen,
          hideFriendList: user.hideFriendList,
          hidePosts: user.hidePosts,
          allowFriendRequest: user.allowFriendRequest,
          hideWealthStore: user.hideWealthStore,
          otp: user.otp,
          resetToken: user.resetToken,
          profileImage: user.profileImage,
          hobies: user.hobies,
          aboutMe: user.aboutMe,
          deleted: user.deleted,
          block: user.block,
          profile: user.profile ? process.env.BASE_URL + user.profile : "",
          showAd: user.showAd,
          showDate: user.showDate,
          isFriend: true,
          isRequestSent: false,
        };
      });
    return res.status(200).send({ success: true, Message: 'all the filter users', modifiedUsers });
  } catch (err) {
    return res.status(500).send({ success: false, message: err.message });
  }
};

export const sendFriendRequest = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let senderId = decoded.id;

  let receiverId = req.body.receiverId;
  if (!senderId) {
    return res
      .status(400)
      .send({ success: false, Message: "Sender Id is missing" });
  }
  if (!senderId) {
    return res
      .status(400)
      .send({ success: false, Message: "The reciever Id is missing!" });
  }
  try {
    let sender = await User.findOne({ _id: senderId });
    if (!sender) {
      return res
        .status(404)
        .send({ success: false, Message: "The Sender Profile does not exist" });
    }
    let receiver = await User.findOne({ _id: receiverId });
    if (!receiver) {
      return res.status(404).send({
        success: false,
        Message: "The receiver profile does not exist!",
      });
    }
    let senderProfile = await Image.findOne({ userId: senderId });
    let receiverProfile = await Image.findOne({ userId: receiverId });
    let request = new Request({
      sender: {
        name: sender.name,
        profile: sender.profile ? senderProfile.imageTitle : "",
        id: senderId,
      },
      receiver: {
        name: receiver.name,
        profile: receiver.profile ? receiverProfile.imageTitle : "",
        id: receiverId,
      },
    });
    let response = await request.save();
    return res.status(200).send({
      success: true,
      Message: " Your Friend Request has been sent!",
      response,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      Message: "Got an error while sending request!",
      err: err.message,
    });
  }
};

//accept friend request
export const acceptFriendRequest = async (req, res) => {
  let requestId = req.body.requestId;

  try {
    //get the request mark it to true
    let request = await Request.findOne({ _id: requestId });
    request.status = true;
    await request.save();

    //add the sender to the receiver's friendList
    let receiver = await User.findOne({ _id: request.receiver.id });
    receiver.friendList.push(request.sender.id);
    await receiver.save();
    
    
    //add the receiver to the sender's friendList
    let sender = await User.findOne({ _id: request.sender.id });
    sender.friendList.push(request.receiver.id);
    await sender.save();

    //get sender sockets
    let sockets = await Socket.find({ userId: request.receiver.id });
    //send the acknowledgement
    //delete the request after being accepted
    await Request.deleteOne({ _id: requestId });
    return res
      .status(200)
      .send({ success: true, Message: "Added to the friendList" });
  } catch (err) {
    return res.status(500).send({
      success: false,
      Message: "Got an error while accepting the request",
      err: err.message,
    });
  }
};

//cancel friend request
export const denyFriendRequest = async (req, res) => {
  let requestId = req.body.requestId;
  try {
    await Request.deleteOne({ _id: requestId });
    return res
      .status(200)
      .send({ success: true, Message: "Successfully denied the request" });
  } catch (err) {
    return res.status(500).send({
      success: false,
      Message: "Got an error while denying freind request",
    });
  }
};

//withdraw request
export const withdrawRequest = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let senderId = decoded.id;
  let receiverId = req.body.receiverId;
  try {
    await Request.deleteOne({
      "sender.id": senderId,
      "receiver.id": receiverId,
    });
    return res
      .status(200)
      .send({ success: true, Message: "Successfully withdrew the request" });
  } catch (err) {
    return res.status(500).send({
      success: false,
      Message: "Got an error while withdrawing freind request",
    });
  }
};
//get all friend requests
export const getFriendRequests = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let userId = decoded.id;

  try {
    let requests = await Request.find({ "receiver.id": userId });
    return res
      .status(200)
      .send({ success: true, Message: "All friend requests", requests });
  } catch (err) {
    return res.status(200).send({
      success: false,
      Message: "Got an error while getting all the friend requests",
    });
  }
};

//update status
export const updateStatus = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let userId = decoded.id;
  let lastSeen = formatDate(new Date());
  try {
    await User.updateOne(
      { _id: userId },
      {
        status: req.body.status,
        lastSeen,
      }
    );
    return res.status(200).send({ success: true, Message: "Updated status" });
  } catch (err) {
    return res.status(500).send({
      success: false,
      Message: "Got an error while updating status",
      err: err.message,
    });
  }
};

//update show status permission
export const updateShowStatus = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let userId = decoded.id;
  try {
    await User.updateOne({ _id: userId }, req.body);
    return res
      .status(200)
      .send({ success: true, Message: "status has been changed" });
  } catch (err) {
    return res.status(500).send({
      success: false,
      Message: "Got an error while updating the show status",
    });
  }
};

//update show lastSeen permission
export const updateShowLastSeen = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let userId = decoded.id;
  try {
    await User.updateOne({ _id: userId }, req.body);
    return res
      .status(200)
      .send({ success: true, Message: "setting has been applied" });
  } catch (err) {
    return res.status(500).send({
      success: false,
      Message: "Got an error while updating the show lastSeen",
    });
  }
};

//update show wealth permission
export const updateShowWealth = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let userId = decoded.id;
  try {
    await User.updateOne({ _id: userId }, req.body);
    return res
      .status(200)
      .send({ success: true, Message: "setting has been applied" });
  } catch (err) {
    return res.status(500).send({
      success: false,
      Message: "Got an error while updating the show wealth",
    });
  }
};

//update hide friendList  permission
export const updateHideFriendList = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let userId = decoded.id;
  try {
    await User.updateOne({ _id: userId }, req.body);
    return res
      .status(200)
      .send({ success: true, Message: "settings has been applied" });
  } catch (err) {
    return res.status(500).send({
      success: false,
      Message: "Got an error while updating the hide friend list",
    });
  }
};

//update hide posts  permission
export const updateHidePosts = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let userId = decoded.id;
  try {
    await User.updateOne({ _id: userId }, req.body);
    return res
      .status(200)
      .send({ success: true, Message: "setting has been applied!" });
  } catch (err) {
    return res.status(500).send({
      success: false,
      Message: "Got an error while updating the hide posts",
    });
  }
};

//update send friend request permission
export const updateSendFriedRequests = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let userId = decoded.id;
  try {
    await User.updateOne({ _id: userId }, req.body);
    return res
      .status(200)
      .send({ success: true, Message: "setting has been applied!" });
  } catch (err) {
    return res.status(500).send({
      success: false,
      Message: "Got an error while updating the sendFriendRequests",
    });
  }
};

//get friend list
export const getFriendList = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let userId = decoded.id;
  try {
    let user = await User.findOne({ _id: userId });
    if (user.friendList.length <= 0) {
      return res
        .status(404)
        .send({ success: false, Message: "Friends Not Found!" });
    }
    let friends = [];
    for (let friend of user.friendList) {
      let frnd = await User.findOne({ _id: friend });
      friends.push(frnd);
    }
    let friendImages = [];
    for (let friend of friends) {
      let images = await Image.find({ userId: friend._id });
      friendImages.push(images);
    }
    let modifiedFriendsList = friends.map((friend, index) => {
      return {
        _id: friend._id,
        name: friend.name,
        email: friend.email,
        age: friend.age,
        gender: friend.gender,
        lastSeen: friend.lastSeen,
        country: friend.country,
        state: friend.state,
        city: friend.city,
        password: friend.password,
        status: friend.status,
        friendList: friend.friendList,
        showOnline: friend.showOnline,
        showLastSeen: friend.showLastSeen,
        hideFriendList: friend.hideFriendList,
        hidePosts: friend.hidePosts,
        allowFriendRequest: friend.allowFriendRequest,
        hideWealthStore: friend.hideWealthStore,
        otp: friend.otp,
        resetToken: friend.resetToken,
        profileImage: friend.profileImage,
        hobies: friend.hobies,
        aboutMe: friend.aboutMe,
        deleted: friend.deleted,
        block: friend.block,
        profile: friend.profile ? process.env.BASE_URL + friend.profile : "",
        showAd: friend.showAd,
        showDate: friend.showDate,
        isFriend: friend.isFriend,
        isRequestSent: friend.isRequestSent,
        images: friendImages[index],
      };
    });
    return res.status(200).send(modifiedFriendsList);
  } catch (err) {
    return res.status(500).send({
      success: false,
      Message: "All friends",
    });
  }
};

//unfriend
export const unFriend = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let userId = decoded.id;
  let friendId = req.body.friendId;
  try {
    let user = await User.findOne({ _id: userId });
    let friend = await User.findOne({ _id: friendId });
    let index = user.friendList.indexOf(friendId);
    user.friendList.splice(index, 1);
    index = friend.friendList.indexOf(userId);
    friend.friendList.splice(index, 1);
    await user.save();
    await friend.save();
    return res.status(200).send({
      success: true,
      Message: "You are no longer friends",
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      Message: "Got an error while unfriending",
    });
  }
};

//update get user
export const getOtherUserProfile = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let userId = decoded.id;
  let otherUserId = req.body.otherUserId;

  try {
    let user = await User.findOne({ _id: userId });
    let payload = {};

    let request = await Request.findOne({
      "sender.id": userId,
      "receiver.id": otherUserId,
    });

    let images = await Image.find({ userId });
    if (user.friendList.includes(otherUserId)) {
      payload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        lastSeen: user.lastSeen,
        country: user.country,
        state: user.state,
        city: user.city,
        password: user.password,
        status: user.status,
        friendList: user.friendList,
        showOnline: user.showOnline,
        showLastSeen: user.showLastSeen,
        hideFriendList: user.hideFriendList,
        hidePosts: user.hidePosts,
        allowFriendRequest: user.allowFriendRequest,
        hideWealthStore: user.hideWealthStore,
        otp: user.otp,
        resetToken: user.resetToken,
        profileImage: user.profileImage,
        hobies: user.hobies,
        aboutMe: user.aboutMe,
        deleted: user.deleted,
        block: user.block,
        profile: process.env.BASE_URL + user.profile,
        showAd: user.showAd,
        showDate: user.showDate,
        isFriend: true,
        isRequestSent: false,
        images,
      };
    } else {
      payload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        lastSeen: user.lastSeen,
        country: user.country,
        state: user.state,
        city: user.city,
        password: user.password,
        status: user.status,
        friendList: user.friendList,
        showOnline: user.showOnline,
        showLastSeen: user.showLastSeen,
        hideFriendList: user.hideFriendList,
        hidePosts: user.hidePosts,
        allowFriendRequest: user.allowFriendRequest,
        hideWealthStore: user.hideWealthStore,
        otp: user.otp,
        resetToken: user.resetToken,
        profileImage: user.profileImage,
        hobies: user.hobies,
        aboutMe: user.aboutMe,
        deleted: user.deleted,
        block: user.block,
        profile: process.env.BASE_URL + user.profile,
        showAd: user.showAd,
        showDate: user.showDate,
        isFriend: false,
        isRequestSent: request ? true : false,
        images,
      };
    }

    return res.status(200).send({ success: true, payload });
  } catch (err) {
    return res.status(500).send({ success: false, Message: err.message });
  }
};

//get user profile
export const getUserProfile = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let userId = decoded.id;

  try {
    let user = await User.findOne({ _id: userId });
    if (!user) {
      return res
        .status(404)
        .send({ success: false, Message: "User Not Found!" });
    }
    if (user) {
      //get prifile image
      let image = await Image.findOne({ _id: user.profile });
      if (image) {
        user.profile = process.env.BASE_URL + image.imageTitle;
      } else {
        user.profile = "";
      }

      let images = await Image.find({ userId });
      let payload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        lastSeen: user.lastSeen,
        country: user.country,
        state: user.state,
        city: user.city,
        password: user.password,
        status: user.status,
        friendList: user.friendList,
        showOnline: user.showOnline,
        showLastSeen: user.showLastSeen,
        hideFriendList: user.hideFriendList,
        hidePosts: user.hidePosts,
        allowFriendRequest: user.allowFriendRequest,
        hideWealthStore: user.hideWealthStore,
        otp: user.otp,
        resetToken: user.resetToken,
        profileImage: user.profileImage,
        hobies: user.hobies,
        aboutMe: user.aboutMe,
        deleted: user.deleted,
        block: user.block,
        profile: process.env.BASE_URL + user.profile,
        showAd: user.showAd,
        showDate: user.showDate,
        images,
      };
      return res
        .status(200)
        .send({ success: true, Message: "user profile", payload });
    } else {
      return res
        .status(404)
        .send({ success: false, Message: "User not found" });
    }
  } catch (err) {
    return res.status(500).send({
      success: false,
      Message: "Got an error while getting user profile",
      err: err.message,
    });
  }
};
//update filter
export const updateFilter = async (req, res) => {
  try {
    let authToken = req.header('auth-token');
    let decoded = jwt.decode(authToken);
    let userId = decoded.id;
    // return res.status(200).send({ success: true, payload: req.body });
    //delete existing filter and create a brand new filter each time
    Filter.deleteOne({ userId }).then(async(resp) => {
      let payload = req.body;
      payload.userId = userId;
      let filter = new Filter(payload);
      await filter.save();
      return res
      .status(200)
      .send({ success: true, Message: "filter has been set!" });
    })
    
  } catch (err) {
    return res.status(200).send({ succes: false, message: err.message });
  }
};

export const getFilter = async (req, res) => {
  try {
    let authToken = req.header('auth-token');
    let decoded = jwt.decode(authToken);
    let userId = decoded.id;

    let filter = await Filter.findOne({ userId});
    if (!filter) {
      return res
        .status(404)
        .send({ success: false, Message: "Filter Not Found!" });
    }
    return res.status(200).send({ success: true, filter });
  } catch (err) {
    return res.status(500).send({ success: false, Message: err.message });
  }
};

export const blockUnblockUser = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let userId = decoded.id;
  
  let otherUserId = req.body.otherUserId;
  try {
    let user = await User.findOne({ _id: userId });
    if (user.blockedUsers.includes(otherUserId)) {
      //ublock user
      let index = user.blockedUsers.indexOf(otherUserId);
      user.blockedUsers.splice(index, 1);
      await user.save();
      return res
        .status(200)
        .send({ success: true, Message: "You unblocked this user!" });
    } else {
      await User.updateOne(
        { _id: userId },
        { $push: { blockedUsers: otherUserId } }
      );
      return res
        .status(200)
        .send({ success: true, Message: " You blocked the user" });
    }
  } catch (err) {
    return res.status(200).send();
  }
};

export const getAllGroups = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let userId = decoded.id;
  try {
    let user = await User.findOne({ _id: userId });
    if (!user.groups) {
      return res
        .status(404)
        .send({ success: true, Message: "Groups Not Found!" });
    }
    return res.status(200).send({ success: false, groups: user.groups });
  } catch (err) {
    return res.status(500).send({
      success: false,
      Message: "got an error while fetching groups",
      err: err.message,
    });
  }
};


export const getUserPrivateGroups = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let userId = decoded.id;

  try {
    let groups = await PrivateGroup.find();
    let userPrivateGroups = groups.filter((group) => {
      return  group.users.includes(userId);
    });
    if (userPrivateGroups === []) {
      return res.status(404).send({ success: false, Message: "Groups Not Found!" });
    }
    return res.status(200).send({ success: true, groups: userPrivateGroups });
  }catch(err) {
    return res.status(500).send({ success: false, Message: err.message  });
  }
}


export const getUserChatLogs = async(req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let userId = decoded.id;
  try {
    let messages = await Message.find({ or: [{ "senderId": userId }, { "receiverId": userId }] });
    return res.status(200).send({ succes: true, messages });
  } catch (er) {
    return res.status(500).send({ success: false, Message: "Got an error while fetching chat logs" });
  }
}