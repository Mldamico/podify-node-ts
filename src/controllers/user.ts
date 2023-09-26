import User from "@/models/user";
import { CreateUser } from "@/types/user";
import { Response } from "express";

export const create = async (req: CreateUser, res: Response) => {
  const { email, password, name } = req.body;

  const user = await User.create({ name, email, password });

  res.status(201).json({ user });
};