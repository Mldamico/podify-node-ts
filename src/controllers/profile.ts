import Audio, { AudioDocument } from "@/models/audio";
import User from "@/models/user";
import { paginationQuery } from "@/types/misc";
import { RequestHandler } from "express";
import { ObjectId, isValidObjectId } from "mongoose";

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

export const getUploads: RequestHandler = async (req, res) => {
  const { pageNo = "0", limit = "20" } = req.query as paginationQuery;

  const data = await Audio.find({ owner: req.user.id })
    .skip(parseInt(pageNo) * parseInt(limit))
    .limit(parseInt(limit))
    .sort("-createdAt");

  const audios = data.map((audio) => ({
    id: audio.id,
    title: audio.title,
    about: audio.about,
    file: audio.file.url,
    poster: audio.poster?.url,
    date: audio.createdAt,
    owner: { name: req.user.name, id: req.user.id },
  }));

  res.json({ audios });
};

export const getPublicUploads: RequestHandler = async (req, res) => {
  const { pageNo = "0", limit = "20" } = req.query as paginationQuery;
  const { profileId } = req.params;

  if (!isValidObjectId(profileId))
    return res.status(422).json({ error: "Invalid profile id provided" });

  const data = await Audio.find({ owner: profileId })
    .skip(parseInt(pageNo) * parseInt(limit))
    .limit(parseInt(limit))
    .sort("-createdAt")
    .populate<AudioDocument<{ name: string; _id: ObjectId }>>("owner");

  const audios = data.map((audio) => ({
    id: audio.id,
    title: audio.title,
    about: audio.about,
    file: audio.file.url,
    poster: audio.poster?.url,
    date: audio.createdAt,
    owner: { name: audio.owner.name, id: audio.owner._id },
  }));

  res.json({ audios });
};
