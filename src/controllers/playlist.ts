import Audio from "@/models/audio";
import Playlists from "@/models/playlists";
import { CreatePlaylistRequest, UpdatePlaylistRequest } from "@/types/audio";
import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";

export const createPlaylist: RequestHandler = async (
  req: CreatePlaylistRequest,
  res
) => {
  const { title, resId, visibility } = req.body;
  const ownerId = req.user.id;

  if (resId) {
    const audio = await Audio.findById(resId);
    if (!audio)
      return res.status(404).json({ error: "Could not found the audio!" });

    const newPlayList = new Playlists({
      title,
      owner: ownerId,
      visibility,
    });

    if (resId) newPlayList.items = [resId as any];
    await newPlayList.save();

    res.status(201).json({
      playlist: {
        id: newPlayList._id,
        title: newPlayList.title,
        visibility: newPlayList.visibility,
      },
    });
  }
};

export const updatePlaylist: RequestHandler = async (
  req: UpdatePlaylistRequest,
  res
) => {
  const { id, item, title, visibility } = req.body;

  const playlist = await Playlists.findOneAndUpdate(
    { _id: id, owner: req.user.id },
    { title, visibility },
    { new: true }
  );

  if (!playlist) return res.status(404).json({ error: "Playlist not found" });

  if (item) {
    const audio = await Audio.findById(item);
    if (!audio) return res.status(404).json({ error: "Audio not found" });
    // playlist.items.push(audio._id);
    // await playlist.save();
    await Playlists.findByIdAndUpdate(playlist._id, {
      $addToSet: { items: item },
    });
  }

  res.status(201).json({
    playlist: {
      id: playlist._id,
      title: playlist.title,
      visibility: playlist.visibility,
    },
  });
};

export const removePlaylist: RequestHandler = async (
  req: UpdatePlaylistRequest,
  res
) => {
  const { playlistId, resId, all } = req.query;

  if (!isValidObjectId(playlistId))
    return res.status(422).json({ error: "Invalid playlistId" });

  if (all === "yes") {
    const playlist = await Playlists.findOneAndDelete({
      _id: playlistId,
      owner: req.user.id,
    });

    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
  }

  if (resId) {
    if (!isValidObjectId(resId))
      return res.status(422).json({ error: "Invalid audio Id" });

    const playlist = await Playlists.findOneAndUpdate(
      {
        _id: playlistId,
        owner: req.user.id,
      },
      {
        $pull: { items: resId },
      }
    );
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
  }

  res.json({ success: true });
};
