import nodemailer from 'nodemailer';
import { generateToken } from "@/utils/helper";
import { MAILTRAP_PASS, MAILTRAP_USER, VERIFICATION_EMAIL } from "@/utils/variables";

import EmailVerificationToken from "@/models/emailVerificationToken";
import { generateTemplate } from "@/mail/template";
import path from 'path';
const generateMailTransporter = () => {

  return nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: MAILTRAP_USER,
      pass: MAILTRAP_PASS
    }
  });
};

interface Profile {
  name: string;
  email: string;
  userId: string;
}

export const sendVerificationMail = async (token: string, profile: Profile) => {
  const transport = generateMailTransporter();
  const { name, email, userId } = profile;
  await EmailVerificationToken.create({
    owner: userId,
    token
  });

  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: 'Welcome to Podify',
    html: generateTemplate({
      title: "Welcome to Podify",
      message: `Hi ${name}, welcome to Podify! There are so much thing that we do for verified users. Use the given OTP to verify your email.`,
      logo: "cid:logo",
      banner: "cid:welcome",
      link: "#",
      btnTitle: token
    }),
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../mail/logo.png"),
        cid: "logo"
      },
      {
        filename: "welcome.png",
        path: path.join(__dirname, "../mail/welcome.png"),
        cid: "welcome"
      },
    ]
  });
};
