import User from "@/models/user";
import EmailVerificationToken from "@/models/emailVerificationToken";
import { CreateUser } from "@/types/user";
import { generateToken } from "@/utils/helper";
import { MAILTRAP_PASS, MAILTRAP_USER } from "@/utils/variables";
import { Response } from "express";
import nodemailer from 'nodemailer';
import { generateTemplate } from "@/mail/template";
import path from 'path';

export const create = async (req: CreateUser, res: Response) => {
  const { email, password, name } = req.body;


  const user = await User.create({ name, email, password });



  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: MAILTRAP_USER,
      pass: MAILTRAP_PASS
    }
  });

  const token = generateToken(6);
  await EmailVerificationToken.create({
    owner: user._id,
    token
  });

  transport.sendMail({
    to: user.email,
    from: "auth@fake.com",
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
  res.status(201).json({ user });
};