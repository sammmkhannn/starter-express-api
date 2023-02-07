import CustomerHelp from "../../models/CustomerHelp.model.js";

export const createRequest = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let userId = decoded.id;
  try {
    let request = new CustomerHelp({
      subject: req.body.subject,
      message: req.body.message,
      userId: userId,
      timeStamp: req.body.timeStamp,
    });
    await request.save();
    return res.status(200).send({
      success: true,
      Message: "Your request has been sent to the customer support",
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      Message: "Got an error while contacting customer help",
    });
  }
};

export const getAllCustomerRequests = async (req, res) => {
  try {
    let requests = await CustomerHelp.find({});
    return res.status(200).send({ success: true, requests });
  } catch (err) {
    return res
      .status(500)
      .send({
        success: false,
        Message: "Got an error while getting all the notifications",
      });
  }
};
