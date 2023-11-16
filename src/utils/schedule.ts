import Audio from "@/models/audio";
import AutoGeneratedPlaylists from "@/models/autoGeneratedPlaylist";
import cron from "node-cron";

const generatedPlaylist = async () => {
  const result = await Audio.aggregate([
    { $sort: { likes: -1 } },
    {
      $group: {
        _id: "$category",
        audios: { $push: "$$ROOT._id" },
      },
    },
    { $limit: 20 },
  ]);

  result.map(async (item) => {
    await AutoGeneratedPlaylists.updateOne(
      { title: item._id },
      { $set: { items: item.audios } },
      { upsert: true }
    );
  });
};

cron.schedule("0 0 * * *", async () => {
  await generatedPlaylist();
});
