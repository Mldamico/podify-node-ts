import emailVerificationToken from "@/models/emailVerificationToken";
import User from "@/models/user";
import { CreateUser, VerifyEmailRequest } from "@/types/user";
import { generateToken } from "@/utils/helper";
import { sendVerificationMail } from "@/utils/mail";

import { RequestHandler, Response } from "express";
import { isValidObjectId } from "mongoose";


export const create = async (req: CreateUser, res: Response) => {
  const { email, password, name } = req.body;


  const user = await User.create({ name, email, password });

  const token = generateToken();

  await emailVerificationToken.create({
    owner: user._id,
    token
  });

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

export const sendReverificationToken: RequestHandler = async (req, res: Response) => {
  const { userId } = req.body;

  if (!isValidObjectId(userId)) return res.status(403).json({ error: 'Invalid request' });

  const user = await User.findById(userId);

  if (!user) return res.status(403).json({ error: 'Invalid request' });


  await emailVerificationToken.findOneAndDelete({
    owner: userId
  });

  const token = generateToken();
  await emailVerificationToken.create({
    owner: userId,
    token
  });


  sendVerificationMail(token, {
    name: user?.name, email: user?.email, userId: user?._id.toString()
  });

  res.json({ message: 'Prease check your mail!' });

};