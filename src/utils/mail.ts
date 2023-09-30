import nodemailer from 'nodemailer';
import { generateToken } from "@/utils/helper";
import { MAILTRAP_PASS, MAILTRAP_USER, SIGN_IN_URL, VERIFICATION_EMAIL } from "@/utils/variables";

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

interface Options {
  email: string;
  link: string;
}

export const sendForgetPasswordLink = async (options: Options) => {
  const transport = generateMailTransporter();
  const { email, link } = options;

  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: 'Reset Password',
    html: generateTemplate({
      title: "Recover Password",
      message: `We just received a request that you forget your password. Please use the link below and create a new password.`,
      logo: "cid:logo",
      banner: "cid:forget_password",
      link,
      btnTitle: "Reset Password"
    }),
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../mail/logo.png"),
        cid: "logo"
      },
      {
        filename: "forget_password.png",
        path: path.join(__dirname, "../mail/forget_password.png"),
        cid: "forget_password"
      },
    ]
  });
};


export const sendpasswordResetSuccessEmail = async (name: string, email: string) => {
  const transport = generateMailTransporter();

  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: 'Password Reset Successfully',
    html: generateTemplate({
      title: "Password Reset Successfully",
      message: `Dear ${name} we just updated your new password. You can now sign in with your new password.`,
      logo: "cid:logo",
      banner: "cid:forget_password",
      link: SIGN_IN_URL,
      btnTitle: "Log in"
    }),
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../mail/logo.png"),
        cid: "logo"
      },
      {
        filename: "forget_password.png",
        path: path.join(__dirname, "../mail/forget_password.png"),
        cid: "forget_password"
      },
    ]
  });
};