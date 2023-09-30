import User from "@/models/user";
import { CreateUser } from "@/types/user";
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