import express from "express";
import mongoose from "mongoose";
import { config } from "dotenv";
import helmet from "helmet";
import cors from "cors";
import userRoutes from "./routes/userRoutes/user.routes.js";
import postRoutes from "./routes/UserPostRoutes/post.routes.js";
import adminRoutes from "./routes/AdminRoutes/admin.routes.js";
import notificationRoutes from "./routes/NotificationRoutes/notification.routes.js";
import customerHelpRoutes from "./routes/CustomerHelpRoutes/customerHelp.routes.js";
import publicGroupRoutes from "./routes/GroupRoutes/publicGroup.routes.js";
import privateGroupRoutes from "./routes/GroupRoutes/privateGroup.routes.js";
import { Server } from "socket.io";
import { createServer } from "http";
import Message from "./models/Message.model.js";
import MessageReply from "./models/MessageReply.model.js";
import User from "./models/User.model.js";
import Socket from "./models/Socket.model.js";
import File from "./models/File.model.js";
import Image from "./models/Image.model.js";
import { writeFile } from "fs";
import formatDate from "./utils/getDate.js";
import forge from "node-forge";
forge.options.usePureJavaScript = true;

config();
const port = process.env.PORT || 3000;
const app = express();
let server = createServer(app);
export let io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/images", express.static("images"));

//database config
mongoose.connect(`${process.env.MONGO_URI}`, {
  useNewUrlParser: true,
});

let conn = mongoose.connection;
conn.once("open", () => {
  console.log("connected to the database");
});
conn.on("error", (err) => {
  console.log(err);
});

app.get("/", (req, res) => {
  return res.status(200).send("Hello, World!");
});

app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/admin", adminRoutes);
app.use("/private-group", privateGroupRoutes);
app.use("/public-group", publicGroupRoutes);
app.use('/notifications', notificationRoutes);
app.use('/cutomer-help', customerHelpRoutes);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

let allMessages = [];
io.on("connection", (socket) => {
  console.log("userConnected");
  socket.on("join", async ({ userId }) => {
    let sockets = await Socket.find({ userId });
    if (!sockets.includes(socket.id)) {
      await Socket.updateOne(
        { userId, socketId: socket.id },
        { socketId: socket.id },
        { upsert: true }
      );
    }
  });

  //listen for the typing event
  socket.on("typing", async (data) => {
    //get the receiver sockets
    let receiversSockets = await Socket.find({ receiverId: data.receiverId });
    for (let receiversSocket of receiversSockets) {
      socket.to(receiversSocket.socketId).emit("typing:response", { data });
    }
  });

  //private message
  socket.on("privateMessage", async (data, callback) => {
    console.table(data);
    allMessages.push(data);
    data.date = formatDate(data.date);
    console.log("private message event occurred!");
    let receiversSockets = await Socket.find({ userId: data.receiverId });
    let sendersSockets = await Socket.find({ userId: data.senderId });

    //add coins, diamonds and key to the reciever's account
    if (data.diamond || data.coin || data.key) {
      let user = await User.find({ _id: receiverId });
      user.diamonds = data.diamond.count
        ? user.diamond.count + data.diamond.count
        : user.diamonds;
      user.coins = data.coins ? user.coins + data.coins.count : user.coins;
      user.keys = data.keys ? user.keys + data.key.count : user.keys;
      await user.save();
    }

    data.id = forge.random.getBytesSync(16);

    //get all sockets of the reciever
    for (let receiverSocket of receiversSockets) {
      io.to(receiverSocket.socketId).emit("privateMessage:response", data);
    }

    //broadcast the message to the sender
    for (let senderSocket of sendersSockets) {
      io.to(senderSocket.socketId).emit("privateMessage:response", data);
    }

    if (data.audio) {
      // write file to the disk
      writeFile(
        `./public/audios/${new Date().getTime() + data.audio.Filename}`,
        audio,
        (err) => {
          callback({ message: err ? "failure" : "success" });
        }
      );

      //save file info to the database
      let newAudio = new File({
        senderId: data.senderId,
        reiceiverId: data.receiverId,
        title: new Date().getTime() + data.audioFileName,
        path: `/audios/${new Date().getTime() + data.videoFilename}`,
      });
      socket;

      let savedAudioFile = await newAudio.save();
      audioTitle = savedAudioFile.audioTitle;
      audioPath = savedAudioFile.audioPath;
    }

    if (data.video) {
      console.log("got a video");
      //write file to the disk
      writeFile(`./public/videos/${data.videoFilename}`, data.video, (err) => {
        callback({ message: err ? "failure" : "success" });
      });

      //save video info to the database
      let newVideo = new File({
        senderId: data.senderId,
        recieverId: data.recieverId,
        title: new Date().getTime() + data.videoFilename,
        path: `/videos/${new Date().getTime() + data.videoFilename}`,
      });

      let savedVideoFile = await newVideo();
      videoTitle = savedVideoFile.title;
      videoPath = savedVideoFile.path;
    }

    if (data.image) {
      console.log("got an image");
      //write file to the disk
      writeFile(`./public/videos/${data.imageFilename}`, data.image, () => {
        callback({ message: err ? "failure" : "success" });
      });

      //save video info to the database
      let newImage = new Image({
        senderId: data.senderId,
        receiverId: data.receiverId,
        title: new Date().getTime() + data.imageFilename,
        path: `/images/${new Date().getTime() + data.imageFilename}`,
      });
      let savedImageFile = await newImage.save();
      imageTitle = savedImageFile.title;
      imagePath = savedImageFile.path;
    }

    //save the image to the database
    let message = new Message({
      messageText: data.messageText,
      username: data.username,
      video: {
        title: data.videoTitle ? data.videoTitle : "",
        path: data.videoPath ? data.videoPath : "",
      },
      audio: {
        title: data.audioTitle ? data.audioTitle : "",
        path: data.audioPath ? data.audioPath : "",
      },
      image: {
        title: data.imageTitle ? data.imageTitle : "",
        path: data.imagePath ? data.imagePath : "",
      },
      coin: {
        count: data.coin ? data.coin.count : 0,
      },
      diamond: {
        count: data.diamond ? data.diamond.count : 0,
      },
      key: {
        count: data.key ? data.key.count : 0,
      },
      senderId: data.senderId,
      receiverId: data.receiverId,
      status: data.status,
      messageType: data.type ? data.type : null,
    });
    await message.save();
  });

  //reply message
  socket.on("replyMessage", async (data) => {
    console.log("message reply");
    let sendersSockets = await Socket.find({ userId: data.senderId });

    console.table(data);

    for (let senderSocket of sendersSockets) {
      io.to(senderSocket.socketId).emit("replyMessage:response", data);
    }

    if (data.audio) {
      // write file to the disk
      writeFile(
        `./public/audios/${new Date().getTime() + data.audioFilename}`,
        audio,
        (err) => {
          callback({ message: err ? "failure" : "success" });
        }
      );

      //save file info to the database
      let newAudio = new File({
        senderId: data.senderId,
        reiceiverId: data.receiverId,
        title: new Date().getTime() + data.audioFileName,
        path: `/audios/${new Date().getTime() + videoFilename}`,
      });

      let savedAudioFile = await newAudio.save();
      audioTitle = savedAudioFile.audioTitle;
      audioPath = savedAudioFile.audioPath;
    }

    if (data.video) {
      console.log("got a video");
      //write file to the disk
      writeFile(`./public/videos/${videoFilename}`, video, (err) => {
        callback({ message: err ? "failure" : "success" });
      });

      //save video info to the database
      let newVideo = new File({
        senderId: data.senderId,
        recieverId: data.recieverId,
        title: new Date().getTime() + data.videoFilename,
        path: `/videos/${new Date().getTime() + data.videoFilename}`,
      });

      let savedVideoFile = await newVideo();
      videoTitle = savedVideoFile.title;
      videoPath = savedVideoFile.path;
    }

    if (data.image) {
      console.log("got an images");
      //write file to the disk
      writeFile(`./public/videos/${data.imageFilename}`, image, (err) => {
        callback({ message: err ? "failure" : "success" });
      });

      //save video info to the database
      let newImage = new Image({
        senderId: data.senderId,
        receiverId: data.receiverId,
        title: new Date().getTime() + data.imageFilename,
        path: `/images/${new Date().getTime() + data.imageFilename}`,
      });
      let savedImageFile = await newImage.save();
      imageTitle = savedImageFile.title;
      imagePath = savedImageFile.path;
    }

    let messageReply = new MessageReply({
      messageText: data.messageText ? data.mmessageText : "",
      username: data.username,
      video: {
        title: data.videoTitle ? data.videoTitle : "",
        path: data.videoPath ? data.videoPath : "",
      },
      audio: {
        title: data.audioTitle ? data.audioTitle : "",
        path: data.audioPath ? data.audioPath : "",
      },
      image: {
        title: data.imageTitle ? data.imageTitle : "",
        path: data.imagePath ? data.imagePath : "",
      },
      coin: {
        count: data.coin ? data.coin.count : 0,
      },
      diamond: {
        count: data.diamond ? data.diamond.count : 0,
      },
      key: {
        count: data.key ? data.key.count : 0,
      },
      senderId: data.senderId,
      messageId: data.messageId,
      messageType: data.type ? data.type : null,
    });
    await messageReply.save();
  });

  //get messages
  socket.on("getMessages", async (data) => {
    console.log("getMessages event occurred on the server");
    let messages = await Message.find({
      $or: [
        { senderId: data.senderId, recieverId: data.receiverId },
        { senderId: data.recieverId, recieverId: data.senderId },
      ],
    });

    // let finalMessages = messages.concat(messageReplies);
    //get receiver's sockets

    // //get sender's sockets
    let sendersSockets = await Socket.find({ userId: data.senderId });
    console.table(sendersSockets);

    for (let senderSocket of sendersSockets) {
      io.to(senderSocket.socketId).emit("getMessages:response", messages);
    }
  });

  //delete message
  socket.on("deleteMessage", async (data) => {
    data.messageId && (await Message.findByIdAndDelete(data.messageId));
    data.messageId && (await MessageReply.findByIdAndDelete(data.messageId));
    console.log();

    //get sender's sockets
    let sendersSockets =
      data.senderId && (await Socket.find({ userId: data.senderId }));
    for (let senderSocket of sendersSockets) {
      io.to(senderSocket.socketId).emit("deleteMessage:response", data);
    }
  });

  //on delivered
  //on seen
  //on pending
  //user offline

  //delete message reply
  socket.on("deleteMessageReply", async (data) => {
    await MessageReply.findByIdAndDelete(data.replyId);
    console.table(data);
    //get sender's sockets
    let senderSockets = await Socket.find({ userId: data.senderId });
    console.table(senderSockets.map((socket) => socket.socketId));
    for (let senderSocket of senderSockets) {
      io.to(senderSocket.socketId).emit("deleteMessageReply:response", data);
    }
  });

  //join group
  socket.on("join", async ({ groupName, userId }) => {
    socket.join(groupName);
    //emit message
    socket.on("sendMessage", async (message) => {
      socket.broadcast.to(message.group).emit("message", message);
    });
    //emit reply
    socket.on("sendReply", (reply) => {
      socket.broadcast.to(reply.room).emit("reply", reply);
    });
  });
}).on("disconnect", async (socket) => {
  //remove the socketId
  //when it gets closed
  await Socket.deleteMany({ socketId: socket.id });
});
