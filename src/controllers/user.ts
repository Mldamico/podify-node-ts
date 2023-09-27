import User from "@/models/user";
import { CreateUser } from "@/types/user";
import { MAILTRAP_PASS, MAILTRAP_USER } from "@/utils/variables";
import { Response } from "express";
import nodemailer from 'nodemailer';
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

  transport.sendMail({
    to: user.email,
    from: "auth@fake.com",
    html: '<h1></h1>'
  });
  res.status(201).json({ user });
};