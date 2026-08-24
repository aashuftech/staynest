import mongoose, { Document, Model, Schema } from 'mongoose'

export type PropertyRequestStatus = 'NEW' | 'REVIEWING' | 'CONTACTED' | 'MATCH_FOUND' | 'CLOSED'

export interface IPropertyRequest extends Document {
  ownerId: mongoose.Types.ObjectId
  purpose: 'RENT' | 'BUY'
  propertyType: string
  preferredLocation: string
  minBudget?: number
  maxBudget: number
  bedrooms: number
  bathrooms: number
  moveInDate?: Date
  requirements: string
  status: PropertyRequestStatus
  adminNotes?: string
  matchedProperties: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const PropertyRequestSchema = new Schema<IPropertyRequest>({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  purpose: { type: String, enum: ['RENT', 'BUY'], required: true },
  propertyType: { type: String, enum: ['ANY', 'FLAT', 'HOUSE', 'STUDIO', 'CONDO', 'TOWNHOUSE', 'VILLA'], default: 'ANY' },
  preferredLocation: { type: String, required: true, trim: true, maxlength: 120 },
  minBudget: { type: Number, min: 0 },
  maxBudget: { type: Number, required: true, min: 1 },
  bedrooms: { type: Number, required: true, min: 0, max: 20 },
  bathrooms: { type: Number, required: true, min: 0, max: 20 },
  moveInDate: Date,
  requirements: { type: String, required: true, trim: true, maxlength: 3000 },
  status: { type: String, enum: ['NEW', 'REVIEWING', 'CONTACTED', 'MATCH_FOUND', 'CLOSED'], default: 'NEW', index: true },
  adminNotes: { type: String, maxlength: 3000 },
  matchedProperties: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
}, { timestamps: true })

export const PropertyRequest: Model<IPropertyRequest> =
  (mongoose.models.PropertyRequest as Model<IPropertyRequest>) || mongoose.model<IPropertyRequest>('PropertyRequest', PropertyRequestSchema)
