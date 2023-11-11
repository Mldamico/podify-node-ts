import User from "@/models/user";
import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";

export const updateFollower: RequestHandler = async (req, res) => {
  const { profileId } = req.params;
  let status: "added" | "removed";
  if (!isValidObjectId(profileId))
    return res.status(422).json({ error: "Invalid profile id provided" });

  const user = await User.findById(profileId);

  if (!user) return res.status(404).json({ error: "User not found" });

  const currentFollower = await User.findOne({
    _id: profileId,
    followers: req.user.id,
  });

  if (currentFollower) {
    User.updateOne({ _id: profileId }, { $pull: { followers: req.user.id } });
    status = "removed";
  } else {
    await User.updateOne(
      { _id: profileId },
      { $addToSet: { followers: req.user.id } }
    );
    status = "added";
  }

  if (status === "added") {
    await User.updateOne(
      { _id: req.user.id },
      { $addToSet: { following: profileId } }
    );
  }

  if (status === "removed") {
    await User.updateOne(
      { _id: req.user.id },
      { $pull: { following: profileId } }
    );
  }

  res.json({ status });
};
