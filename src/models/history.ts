import { Model, Schema, model, models } from "mongoose";
import { ObjectId } from "mongoose";

type historyType = { audio: ObjectId; progress: number; date: Date };

interface HistoryDocument {
  owner: ObjectId;
  last: historyType;
  all: historyType[];
}

const historySchema = new Schema<HistoryDocument>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    last: {
      audio: {
        type: Schema.Types.ObjectId,
        ref: "Audio",
        required: true,
      },
      progress: {
        type: Number,
      },
      date: {
        type: Date,
        required: true,
      },
    },
    all: {
      audio: {
        type: Schema.Types.ObjectId,
        ref: "Audio",
        required: true,
      },
      progress: {
        type: Number,
      },
      date: {
        type: Date,
        required: true,
      },
    },
  },
  { timestamps: true }
);

const History = models.Playlist || model("history", historySchema);

export default History as Model<HistoryDocument>;
