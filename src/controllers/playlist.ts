import Audio from "@/models/audio";
import Playlists from "@/models/playlists";
import { CreatePlaylistRequest } from "@/types/audio";
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
