import User from "../models/User.model.js";

const verifyEmail = async (req, res, next) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).send("A user with email already exists!");
    }
    next();
  } catch (err) {
    console.log(err);
  }
}; // end verifyEmail

export default verifyEmail;

