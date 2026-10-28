import fs from "fs";
import nodemailer from "nodemailer";
import { User } from "../startup/models.js";
import moment from "moment";
import path from "path";
// import axios from 'axios';
import https from "https";

export const sendOneSignalEmail = async ({ to, subject, text, html }) => {
  try {
    const url = "https://api.onesignal.com/notifications?c=email";

    const data = JSON.stringify({
      app_id: process.env.ONESIGNAL_APP_ID,
      email_subject: subject,
      email_body: html || text,
      email_from_name: "Connect",
      email_to: [to],
    });

    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: `Key ${process.env.ONESIGNAL_API_KEY}`,
        "content-type": "application/json",
      },
    };

    const req = https.request(url, options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        console.log(
          "Email sent successfully via OneSignal:",
          JSON.parse(responseData)
        );
      });
    });

    req.on("error", (error) => {
      console.error("Error sending email via OneSignal:", error.message);
    });

    req.write(data);
    req.end();
  } catch (error) {
    console.error("Error in sendOneSignalEmail function:", error.message);
  }
};

/**
 * Transporter
 */
export const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  tls: {
    rejectUnauthorized: false,
  },
  // host: process.env.SMTP_HOST,
  // port: process.env.SMTP_PORT,
  // secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
  // host: process.env.SMTP_HOST,
  // port: 465,
  // secure: true,
  // // port: 587,
  // // secure: false,
  // auth: {
  //     user: process.env.SMTP_EMAIL,
  //     pass: process.env.SMTP_PASSWORD,
  // },
});

export async function sendEmailOnRegistration(email, code) {
  try {
    // Fetch user details
    const thisUser = await User.findOne({ email });
    if (!thisUser) {
      console.error("Error: User not found for the given email:", email);
      return;
    }

    // Template file path
    const filePath =
      thisUser?.language == "ar"
        ? "src/templates/userRegistrationAr.html"
        : "src/templates/userRegistration.html";
    // Read the email template
    const htmlString = fs.readFileSync(filePath, "utf8");

    if (!htmlString) {
      console.error("Error: Email template file is empty or missing.");
      return;
    }

    // Replace placeholders in the template
    let template = htmlString;
    const currentYear = moment().year();

    // Replace placeholders
    template = template.split("||YEAR||").join(currentYear);
    template = template.split("||CODE||").join(code);
    template = template.split("||USERNAME||").join(thisUser?.name || "User");
    template = template.split("||NAME||").join(thisUser?.name || "User");
    template = template.split("||EMAIL||").join(email);

    // Fetch company details
    const companyName = await Config.findOne({ keyName: "companyName" });
    console.log("companyName: ", companyName);
    const companyWeb = await Config.findOne({ keyName: "companyWeb" });
    console.log("companyWeb: ", companyWeb);
    const companyAPI = await Config.findOne({ keyName: "companyAPI" });
    console.log("companyAPI: ", companyAPI);

    template = template
      .split("||COMPANYNAME||")
      .join(companyName?.keyValue || "Connect");
    template = template
      .split("||COMPANYWEB||")
      .join(companyWeb?.keyValue || "www.connect.com");
    template = template
      .split("||COMPANYAPI||")
      .join(companyAPI?.keyValue || "api.connect.com");

    var subject =
      thisUser?.language == "ar"
        ? `شكرًا لك على التسجيل في ${companyName?.keyValue || "بيزباي"}`
        : `Thank you for Registering with ${
            companyName?.keyValue || "Connect"
          }`;
    await sendOneSignalEmail({
      to: email,
      html: template,
      subject: subject,
    });

    // Prepare email data
    // const mailData = {
    //     from: process.env.FROM_EMAIL,
    //     to: email,
    //     bcc: email, // Use BCC for better privacy
    //     subject: thisUser?.language == 'ar' ? `شكرًا لك على التسجيل في ${companyName?.keyValue || "بيزباي"}` : `Thank you for Registering with ${companyName?.keyValue || "Connect"}`,
    //     html: template,
    //     replyTo: process.env.FROM_EMAIL,
    // };

    // // Send the email
    // const info = await transporter.sendMail(mailData);
    // console.log("Email sent successfully:", info);
  } catch (error) {
    console.error("Error in sending registration email:", error);
  }
}

export async function sendEmailForResetCode(
  email,
  code,
  name,
  language = "en"
) {
  try {
    const fileName =
      language == "ar"
        ? "src/templates/resetPasswordAr.html"
        : "src/templates/resetPassword.html";

    // Read template file
    const htmlString = fs.readFileSync(fileName, "utf8");
    // const htmlString = await fs.readFile(new URL(fileName, import.meta.url), 'utf8');

    if (htmlString) {
      let template = htmlString;

      if (email) {
        const currentYear = moment().year();

        // Replace placeholders
        template = template.split("||YEAR||").join(currentYear);
        template = template.split("||USERNAME||").join(name);
        template = template.split("||USEREMAIL||").join(email);
        template = template.split("||CODE||").join(code);

        // Fetch company details
        const thisCompanyName = await Config.findOne({
          keyName: "companyName",
        });
        const thisCompanyWeb = await Config.findOne({ keyName: "companyWeb" });
        const thisCompanyAPI = await Config.findOne({ keyName: "companyAPI" });

        template = template
          .split("||COMPANYNAME||")
          .join(thisCompanyName?.keyValue || "Connect");
        template = template
          .split("||COMPANYWEB||")
          .join(thisCompanyWeb?.keyValue || "www.connect.com");
        template = template
          .split("||COMPANYAPI||")
          .join(thisCompanyAPI?.keyValue || "api.connect.com");

        var subject =
          language == "ar"
            ? `${code} هو الرمز الخاص بك لاستعادة كلمة المرور`
            : `${code} is your code to reset password`;
        // await sendOneSignalEmail({
        //     to: email,
        //     html: template,
        //     subject: subject,
        // });

        // Mail data

        const mailData = {
          from: process.env.FROM_EMAIL,
          to: email,
          bcc: email, // Use bcc to hide "to" emails from recipients
          subject:
            language == "ar"
              ? `${code} هو الرمز الخاص بك لاستعادة كلمة المرور`
              : `${code} is your code to reset password`,
          html: template,
          replyTo: process.env.FROM_EMAIL,
        };

        // Send email
        const info = await transporter.sendMail(mailData);
        console.log(" ------ info ----- ");
        console.log(info);
        console.log(" ------ info ----- ");
      }
    }
  } catch (error) {
    console.error("Error in sending registration email:", error);
  }
}

export const sendEmail = async ({ to, subject, text, html }) => {
  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    text,
    html,
  });
};
