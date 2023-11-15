import Audio, { AudioDocument } from "@/models/audio";
import History from "@/models/history";
import Playlists from "@/models/playlists";
import User from "@/models/user";
import { paginationQuery } from "@/types/misc";
import { RequestHandler } from "express";
import moment from "moment";
import { ObjectId, PipelineStage, isValidObjectId } from "mongoose";

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

export const getPublicProfile: RequestHandler = async (req, res) => {
  const { profileId } = req.params;

  if (!isValidObjectId(profileId))
    return res.status(422).json({ error: "Invalid profile id provided" });

  const user = await User.findById(profileId).select("-password");

  if (!user) return res.status(422).json({ error: "User not found" });

  res.json({
    profile: {
      id: user._id,
      name: user.name,
      followers: user.followers.length,
      avatar: user.avatar?.url,
    },
  });
};

export const getPublicPlaylist: RequestHandler = async (req, res) => {
  const { pageNo = "0", limit = "20" } = req.query as paginationQuery;
  const { profileId } = req.params;

  if (!isValidObjectId(profileId))
    return res.status(422).json({ error: "Invalid profile id provided" });

  const playlists = await Playlists.find({
    _id: profileId,
    visibility: "public",
  })
    .skip(parseInt(pageNo) * parseInt(limit))
    .limit(parseInt(limit))
    .sort("-createdAt");

  if (!playlists) return res.json({ playlists: [] });

  res.json({
    playlists: playlists.map((playlist) => ({
      id: playlist._id,
      title: playlist.title,
      itemsCount: playlist.items.length,
      visibility: playlist.visibility,
    })),
  });
};

export const getRecommendedByProfile: RequestHandler = async (req, res) => {
  const user = req.user;
  let matchOptions: PipelineStage.Match = {
    $match: { _id: { $exists: true } },
  };

  if (user) {
    const usersPreviewsHistory = await History.aggregate([
      { $match: { owner: user.id } },
      { $unwind: "$all" },
      {
        $match: {
          "all.date": {
            $gte: moment().subtract(30, "days").toDate(),
          },
        },
      },
      {
        $group: { _id: "$all.audio" },
      },
      {
        $lookup: {
          from: "audios",
          localField: "_id",
          foreignField: "_id",
          as: "audioData",
        },
      },
      { $unwind: "$audioData" },
      {
        $group: {
          _id: null,
          category: {
            $addToSet: "$audioData.category",
          },
        },
      },
    ]);

    const categories = usersPreviewsHistory[0].category;

    if (categories.length) {
      matchOptions: {
        $match: {
          category: {
            $in: categories;
          }
        }
      }
    }
  }

  const audios = await Audio.aggregate([
    matchOptions,
    {
      $sort: {
        "likes.count": -1,
      },
    },
    { $limit: 10 },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: "$owner" },
    {
      $project: {
        _id: 0,
        id: "$_id",
        title: "$title",
        about: "$about",
        category: "$category",
        file: "$file.url",
        poster: "$poster.url",
        owner: {
          name: "$owner.name",
          id: "$owner._id",
        },
      },
    },
  ]);
  res.json({ audios });
};
