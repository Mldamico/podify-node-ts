import emailVerificationToken from "@/models/emailVerificationToken";
import User from "@/models/user";
import { CreateUser, VerifyEmailRequest } from "@/types/user";
import { generateToken } from "@/utils/helper";
import { sendVerificationMail } from "@/utils/mail";

import { Response } from "express";


export const create = async (req: CreateUser, res: Response) => {
  const { email, password, name } = req.body;


  const user = await User.create({ name, email, password });

  const token = generateToken();
  sendVerificationMail(token, { name, email, userId: user._id.toString() });

  res.status(201).json({ user: { id: user._id, name, email } });
};

export const verifyEmail = async (req: VerifyEmailRequest, res: Response) => {
  const { token, userId } = req.body;

  const verificationToken = await emailVerificationToken.findOne({
    owner: userId
  });

  if (!verificationToken) return res.status(403).json({ error: "Invalid token" });

  const matched = await verificationToken.compareToken(token);

  if (!matched) return res.status(403).json({ error: "Invalid token" });

  await User.findByIdAndUpdate(userId, {
    verified: true
  });
  await emailVerificationToken.findByIdAndDelete(verificationToken._id);

  return res.status(200).json({ message: "Your email is verified" });

};