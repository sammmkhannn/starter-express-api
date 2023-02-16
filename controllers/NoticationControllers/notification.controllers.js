// import Notification from "../../models/Notification.js";
// import Socket from "../../models/Socket.model.js";
// import { io } from "../../index.js";

// export const sendNotification = async (req, res) => {
//   let userId = req.params.userId;
//   try {
//     // get user sockets
//     let userSockets = await Socket.find({ userId });

//     if (userSockets) {
//       let notification = new Notification({
//         content: req.body.content,
//         image: {
//           title: req.file.filename,
//           path: process.env.BASE_URL + req.file.filename,
//         },
//       });
//       await notification.save();
//       for (let userSocket of userSockets) {
//         io.to(userSocket).emit("notify", {
//           content: req.body.content,
//           image: notification.image.path,
//         });
//       }
//       return res
//         .status(200)
//         .send({ success: true, Message: "notification has been sent" });
//     }
//     return res.status(400).send({
//       success: false,
//       Message: "Notification could not be sent",
//       err: err.message,
//     });
//   } catch (err) {
//     return res.status(500).send({
//       success: false,
//       Message: "Got an error while sending a notification",
//     });
//   }
// };

// export const deleteNotification = async (req, res) => {
//   let notificaitonId = req.params.notificationId;
//   try {
//     await Notification.deleteOne({ _id: notificaitonId });
//     return res
//       .status(200)
//       .send({ success: true, Message: "Notification has been deleted!" });
//   } catch (err) {
//     return res
//       .status(500)
//       .send({ success: true, Message: "Notification could not be deleted" });
//   }
// };

// export const deleteNotificationsOfAUser = async (req, res) => {
//   let userId = req.params.userId;
//   try {
//     await Notification.deleteMany({ userId: userId });
//     return res
//       .status(200)
//       .send({ success: true, Message: "Notification have been deleted" });
//   } catch (err) {
//     return res.status(500).send({ success: false, Message: err.message });
//   }
// };

// export const getAllNotificationsOfAUser = async (req, res) => {
//   let userId = req.params.userId;
//   try {
//     let notifications = await Notification.find({ userId });
//     return res.status(200).send({ success: true, notifications });
//   } catch (err) {
//     return res
//       .status(500)
//       .send({
//         success: false,
//         Message: "Got an error while getting notifications",
//       });
//   }
// };
