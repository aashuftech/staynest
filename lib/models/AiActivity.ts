import mongoose, { Document, Schema } from 'mongoose'

export type AiActivityKind = 'CHAT' | 'PROPERTY_SEARCH'

export interface IAiActivity extends Document {
  userId?: mongoose.Types.ObjectId
  visitorId?: string
  kind: AiActivityKind
  input: string
  output?: string
  pathname?: string
  role?: 'GUEST' | 'USER' | 'ADMIN'
  listingPurpose?: 'RENT' | 'BUY'
  criteria?: Record<string, unknown>
  matchedPropertyIds: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const AiActivitySchema = new Schema<IAiActivity>({
  // userId is set only from the server-side NextAuth session, never from client input.
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  // Guests have no account id, so their activity is linked to a random browser id only.
  visitorId: { type: String, trim: true, maxlength: 100, index: true },
  kind: { type: String, enum: ['CHAT', 'PROPERTY_SEARCH'], required: true, index: true },
  input: { type: String, required: true, maxlength: 1500 },
  output: { type: String, maxlength: 6000 },
  pathname: { type: String, maxlength: 160 },
  role: { type: String, enum: ['GUEST', 'USER', 'ADMIN'] },
  listingPurpose: { type: String, enum: ['RENT', 'BUY'] },
  criteria: { type: Schema.Types.Mixed },
  matchedPropertyIds: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
}, { timestamps: true })

AiActivitySchema.index({ userId: 1, createdAt: -1 })
AiActivitySchema.index({ visitorId: 1, createdAt: -1 })

export const AiActivity =
  (mongoose.models.AiActivity as mongoose.Model<IAiActivity>) ||
  mongoose.model<IAiActivity>('AiActivity', AiActivitySchema)
