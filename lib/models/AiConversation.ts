import mongoose, { Document, Schema } from "mongoose";

export interface IAiConversationMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface IAiConversation extends Document {
  userId?: mongoose.Types.ObjectId;
  visitorId?: string;
  messages: IAiConversationMessage[];
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AiConversationMessageSchema = new Schema<IAiConversationMessage>(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true, maxlength: 6000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const AiConversationSchema = new Schema<IAiConversation>(
  {
    // Exactly one of these is used: a real server-authenticated user or an anonymous browser.
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    visitorId: { type: String, trim: true, maxlength: 100 },
    messages: { type: [AiConversationMessageSchema], default: [] },
    lastActivityAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

// This creates one conversation document per user / anonymous browser, not one document per message.
AiConversationSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { userId: { $exists: true } } },
);
AiConversationSchema.index(
  { visitorId: 1 },
  { unique: true, partialFilterExpression: { visitorId: { $exists: true } } },
);

export const AiConversation =
  (mongoose.models.AiConversation as mongoose.Model<IAiConversation>) ||
  mongoose.model<IAiConversation>("AiConversation", AiConversationSchema);
