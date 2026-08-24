import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password?: string
  image?: string
  role: 'USER' | 'ADMIN'
  publicId?: number
  isBanned: boolean
  bannedAt?: Date
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String },
  image: { type: String },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  // A short, non-admin-only identifier shown to admins as #1, #2, etc.
  publicId: { type: Number, unique: true, sparse: true, index: true },
  isBanned: { type: Boolean, default: false, index: true },
  bannedAt: Date,
}, { timestamps: true })

export const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>('User', UserSchema)
