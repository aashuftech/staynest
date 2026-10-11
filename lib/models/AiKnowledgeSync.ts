import mongoose, { Schema, type Document } from "mongoose";

/** A small audit snapshot proving which StayNest knowledge was last synced. */
export interface IAiKnowledgeSync extends Document {
  key: string;
  propertyCount: number;
  rentPropertyCount: number;
  buyPropertyCount: number;
  verifiedPropertyCount: number;
  synchronizedAt: Date;
  synchronizedBy?: mongoose.Types.ObjectId;
}

const AiKnowledgeSyncSchema = new Schema<IAiKnowledgeSync>(
  {
    key: { type: String, required: true, unique: true, default: "primary" },
    propertyCount: { type: Number, required: true, default: 0 },
    rentPropertyCount: { type: Number, required: true, default: 0 },
    buyPropertyCount: { type: Number, required: true, default: 0 },
    verifiedPropertyCount: { type: Number, required: true, default: 0 },
    synchronizedAt: { type: Date, required: true, default: Date.now },
    synchronizedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: false },
);

export const AiKnowledgeSync =
  (mongoose.models.AiKnowledgeSync as mongoose.Model<IAiKnowledgeSync>) ||
  mongoose.model<IAiKnowledgeSync>("AiKnowledgeSync", AiKnowledgeSyncSchema);
