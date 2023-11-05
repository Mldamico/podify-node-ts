import Audio, { AudioDocument } from "@/models/audio";
import Favorite from "@/models/favorite";
import { PopulateFavList } from "@/types/audio";
import { RequestHandler } from "express";
import { ObjectId, isValidObjectId } from "mongoose";

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
  const ownerId = req.user.id;
  const favorite = await Favorite.findOne({ owner: ownerId }).populate<{
    items: PopulateFavList;
  }>({
    path: "items",
    select: "title about file poster likes",
    populate: {
      path: "owner",
      select: "username avatar",
    },
  });

  if (!favorite) return res.status(404).json({ error: "Favorite not found" });

  const audios = favorite.items.map((item) => {
    return {
      id: item._id,
      title: item.title,
      category: item.category,
      file: item.file.url,
      poster: item.poster?.url,
      owner: { name: item.owner.name, id: item.owner._id },
    };
  });

  res.json({ audios });
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
