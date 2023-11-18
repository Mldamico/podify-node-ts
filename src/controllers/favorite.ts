import Audio, { AudioDocument } from "@/models/audio";
import Favorite from "@/models/favorite";
import { PopulateFavList } from "@/types/audio";
import { paginationQuery } from "@/types/misc";
import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";

export const toggleFavorite: RequestHandler = async (req, res) => {
  const { audioId } = req.query;
  let status: "added" | "removed";
  if (isValidObjectId(audioId)) {
    return res.status(422).json({ error: "Invalid audio id" });
  }

  const audio = await Audio.findById(audioId);

  if (!audio) return res.status(404).json({ error: "Audio not found" });

  const favoriteAlready = await Favorite.findOne({
    owner: req.user.id,
    items: audioId,
  });

  if (favoriteAlready) {
    await favoriteAlready.updateOne({ $pull: { items: audioId } });
    status = "removed";
  } else {
    const favorite = await Favorite.findOne({ owner: req.user.id });
    if (favorite) {
      await favorite.updateOne({ $push: { items: audioId } });
    }
    await Favorite.create({ owner: req.user.id, items: [audioId] });
    status = "added";
  }

  if (status === "added") {
    await Audio.findByIdAndUpdate(audioId, {
      $addToSet: { likes: req.user.id },
    });
  } else {
    await Audio.findByIdAndUpdate(audioId, {
      $pull: { likes: req.user.id },
    });
  }

  res.json({ status });
};

export const getFavorites: RequestHandler = async (req, res) => {
  const { pageNo = "0", limit = "20" } = req.query as paginationQuery;
  const ownerId = req.user.id;

  const favorites = await Favorite.aggregate([
    { $match: { owner: ownerId } },
    {
      $project: {
        audioIds: {
          $slice: [
            "$items",
            parseInt(pageNo) * parseInt(limit),
            parseInt(limit),
          ],
        },
      },
    },
    {
      $unwind: "$audioIds",
    },
    {
      $lookup: {
        from: "audios",
        localField: "audioIds",
        foreignField: "_id",
        as: "audoInfo",
      },
    },
    { $unwind: "$audioInfo" },
    {
      $lookup: {
        from: "users",
        localField: "audioInfo.owner",
        foreignField: "_id",
        as: "ownerInfo",
      },
    },
    { $unwind: "$ownerInfo" },
    {
      $project: {
        _id: 0,
        id: "$audioInfo._id",
        title: "$audioInfo.title",
        about: "$audioInfo.about",
        category: "$audioInfo.category",
        file: "$audioInfo.file.url",
        poster: "$audioInfo.poster.url",
        owner: {
          name: "$ownerInfo.name",
          id: "$ownerInfo._id",
        },
      },
    },
  ]);

  res.json({ audios: favorites });
};

export const getIsFavorite: RequestHandler = async (req, res) => {
  const { audioId } = req.query;

  if (isValidObjectId(audioId))
    return res.status(422).json({ error: "Invalid audio id" });

  const favorite = await Favorite.findOne({
    owner: req.user.id,
    items: audioId,
  });

  res.json({ result: favorite ? true : false });
};
