import mailgen from "mailgen";
import nodemailer from "nodemailer";

//this is done to send the email we r using a nodemailer plateform.

const sendEmail = async (options) => {
  //this is done to baranding of mailgenrator
  const mailGenerator = new mailgen({
    theme: "default",
    product: {
      name: "productmanager",
      link: "https://Taskmanager.com",
    },
  });

  //here in generation part we can use both .generat(HTML based text)and .generatePlaintext(may be the client not support HTML text)
  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
  const emailHTML = mailGenerator.generate(options.mailgenContent);

  //thai is transporter object t6hta transport the email
  // Create a transporter using Ethereal test credentials.
  // For production, replace with your actual SMTP server details.
  const Transpoter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMPT_USERNAME,
      pass: process.env.MAILTRAP_SMPT_PASSWORD,
    },
  });
  const mail = {
    from: "mail.taskmanager@example.com",
    to: options.mail,
    subject: options.subject,
    text: emailTextual,
    html: emailHTML,
  };

  try {
    await Transpoter.sendMail(mail); // send the mail including all the vale:key pair mentiond in the mail object
  } catch (error) {
    console.log(
      "Email service failed siliently. make sure that you have provided your MAILTRAP credentials in the .env file",
    );
  }
};

// this is used to generate the mail content only generation part is deone in this not the sending  part

const emailVerificationMailgenContent = (username, verificatioUrl) => {
  return {
    body: {
      name: username,
      intro: "wellcome to our App! we'are excitrd to have you on board.",
      action: {
        instructions:
          "to verify your eamil please click on the following button",
        button: {
          color: "#22BC66",
          text: "verify your email",
          link: verificatioUrl,
        },
      },
      outro:
        "neeed help ,or have questions? just reply to this email, ew'd love to help",
    },
  };
};

const passwordVerificationmelgenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: "we got the request to reset the password of your account.",
      action: {
        instructions:
          "to reset your password please click on the following button",
        button: {
          color: "#22BC66",
          text: "reset your password",
          link: passwordResetUrl,
        },
      },
      outro:
        "neeed help ,or have questions? just reply to this email, ew'd love to help",
    },
  };
};
const forgotpasswordMailgenContent = (username, password) => {
  return {
    body: {
      name: username,
      intro: "we got the request you forgot your the password of your account.",
      action: {
        instructions:
          "to reset your password please click on the following button",
        button: {
          color: "#22BC66",
          text: "reset your password",
          link: "https://Taskmanager.com",
        },
      },
      outro:
        "neeed help ,or have questions? just reply to this email, ew'd love to help",
    },
  };
};
export {
  emailVerificationMailgenContent,
  passwordVerificationmelgenContent,
  forgotpasswordMailgenContent,
  sendEmail,
};
