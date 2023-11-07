import Audio from "@/models/audio";
import Playlists from "@/models/playlists";
import { CreatePlaylistRequest, UpdatePlaylistRequest } from "@/types/audio";
import { RequestHandler } from "express";

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
