import emailVerificationToken from "@/models/emailVerificationToken";
import passwordResetToken from "@/models/passwordResetToken";
import User from "@/models/user";
import { CreateUser, VerifyEmailRequest } from "@/types/user";
import { formatProfile, generateToken } from "@/utils/helper";
import {
  sendForgetPasswordLink,
  sendVerificationMail,
  sendpasswordResetSuccessEmail,
} from "@/utils/mail";
import { JWT_SECRET, PASSWORD_RESET_LINK } from "@/utils/variables";
import crypto from "crypto";
import { RequestHandler, Response } from "express";
import { isValidObjectId } from "mongoose";
import jwt from "jsonwebtoken";
import { RequestWithFiles } from "@/middleware/fileParser";
import cloudinary from "@/cloud";
import formidable from "formidable";

export const create = async (req: CreateUser, res: Response) => {
  const { email, password, name } = req.body;

  const user = await User.create({ name, email, password });

  const token = generateToken();

  await emailVerificationToken.create({
    owner: user._id,
    token,
  });

  sendVerificationMail(token, { name, email, userId: user._id.toString() });

  res.status(201).json({ user: { id: user._id, name, email } });
};

export const verifyEmail = async (req: VerifyEmailRequest, res: Response) => {
  const { token, userId } = req.body;

  const verificationToken = await emailVerificationToken.findOne({
    owner: userId,
  });

  if (!verificationToken)
    return res.status(403).json({ error: "Invalid token" });

  const matched = await verificationToken.compareToken(token);

  if (!matched) return res.status(403).json({ error: "Invalid token" });

  await User.findByIdAndUpdate(userId, {
    verified: true,
  });
  await emailVerificationToken.findByIdAndDelete(verificationToken._id);

  return res.status(200).json({ message: "Your email is verified" });
};

export const sendReverificationToken: RequestHandler = async (
  req,
  res: Response
) => {
  const { userId } = req.body;

  if (!isValidObjectId(userId))
    return res.status(403).json({ error: "Invalid request" });

  const user = await User.findById(userId);

  if (!user) return res.status(403).json({ error: "Invalid request" });

  if (user.verified)
    return res.status(422).json({ error: "Your email is already verified" });

  await emailVerificationToken.findOneAndDelete({
    owner: userId,
  });

  const token = generateToken();
  await emailVerificationToken.create({
    owner: userId,
    token,
  });

  sendVerificationMail(token, {
    name: user?.name,
    email: user?.email,
    userId: user?._id.toString(),
  });

  res.json({ message: "Prease check your mail!" });
};

export const generateForgetPasswordLink: RequestHandler = async (
  req,
  res: Response
) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ error: "Account not found!" });

  await passwordResetToken.findOneAndDelete({
    owner: user._id,
  });

  const token = crypto.randomBytes(36).toString("hex");

  await passwordResetToken.create({
    owner: user._id,
    token,
  });

  const resetLink = `${PASSWORD_RESET_LINK}?token=${token}&userId=${user._id}`;

  sendForgetPasswordLink({ email, link: resetLink });

  res.json({ message: "Check your registered mail." });
};

export const grantValid: RequestHandler = async (req, res: Response) => {
  res.json({ valid: true });
};

export const updatePassword: RequestHandler = async (req, res: Response) => {
  const { password, userId } = req.body;

  const user = await User.findById(userId);

  if (!user) return res.status(403).json({ error: "Unauthorized access!" });

  const matched = await user.comparePassword(password);

  if (matched)
    return res
      .status(422)
      .json({ error: "The new password must be different than previous" });

  user.password = password;
  await user.save();

  await passwordResetToken.findOneAndDelete({ owner: user._id });

  sendpasswordResetSuccessEmail(user.name, user.email);

  res.json({ message: "Password resets successfully" });
};

export const singIn: RequestHandler = async (req, res: Response) => {
  const { password, email } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return res
      .status(404)
      .json({ error: "Cannot find a user with those credentials" });

  const passwordMatch = await user.comparePassword(password);

  if (!passwordMatch)
    return res
      .status(404)
      .json({ error: "Cannot find a user with those credentials" });

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: "30d",
  });

  user.tokens.push(token);

  await user.save();

  return res.json({
    profile: {
      id: user._id,
      name: user.name,
      email: user.email,
      verified: user.verified,
      avatar: user.avatar?.url,
      followers: user.followers.length,
      followings: user.followings.length,
    },
    token,
  });
};

export const updateProfile: RequestHandler = async (
  req: RequestWithFiles,
  res: Response
) => {
  const { name } = req.body;
  const avatar = req.files?.avatar;

  const user = await User.findById(req.user.id);
  if (!user) throw new Error("something went wrong, user not found!");

  if (typeof name[0] !== "string")
    return res.status(422).json({ error: "Invalid name" });

  if (name[0].trim().length < 3)
    return res.status(422).json({ error: "Invalid name" });

  user.name = name[0];

  if (avatar && avatar[0]) {
    if (user.avatar?.publicId) {
      await cloudinary.uploader.destroy(user.avatar?.publicId);
    }
    try {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        avatar[0].filepath,
        {
          width: 300,
          height: 300,
          crop: "thumb",
          gravity: "face",
        }
      );
      user.avatar = {
        url: secure_url,
        publicId: public_id,
      };
    } catch (error) {
      console.log(error);
    }
  }

  await user.save();
  res.json({ profile: formatProfile(user) });
};

export const sendProfile: RequestHandler = (req, res) => {
  res.json({ profile: req.user });
};

export const logout: RequestHandler = async (req, res) => {
  const { fromAll } = req.query;

  const token = req.token;

  const user = await User.findById(req.user.id);
  if (!user) throw new Error("Something went wrong");

  if (fromAll === "yes") user.tokens = [];
  else user.tokens = user.tokens.filter((tok) => tok !== token);

  await user.save();

  res.json({ success: true });
};
