import nodemailer from "nodemailer";

const sendEmail = async (email, subject, text, res,userId) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "shoaibur206@gmail.com",
      pass: "ufduvmtvfxvbyeca",
    },
  });

  let options = {
    from: "SmashAndPass",
    to: email,
    subject,
    text,
  };

  transporter.sendMail(
    options,
    function (error, info) {
      if (error) {
        res.status(400).send(error);
      } else {
        res
          .status(200)
          .send({
            success: true,
            message:
              "An email with the opt has been sent on your email address",userId
          });
      }
    },
    res
  );
};

export default sendEmail;
