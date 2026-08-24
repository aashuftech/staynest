import mongoose, { Schema } from 'mongoose'

const CounterSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 },
}, { timestamps: true })

export const Counter: mongoose.Model<any> =
  (mongoose.models.Counter as mongoose.Model<any>) ||
  mongoose.model<any>('Counter', CounterSchema)
