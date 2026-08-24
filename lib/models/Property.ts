import mongoose, { Schema, Document } from 'mongoose'

export interface IProperty extends Document {
  title: string
  description: string
  type: string
  city: string
  neighborhood?: string
  address: string
  latitude?: number
  longitude?: number
  pricePerMonth: number
  securityDeposit?: number
  listingPurpose: 'RENT' | 'BUY'
  listingStatus: 'PENDING' | 'APPROVED' | 'DECLINED'
  finalPrice?: number
  bookingPrice?: number
  saleStatus: 'AVAILABLE' | 'RESERVED' | 'SOLD'
  reservationDeadline?: Date
  ownerId?: mongoose.Types.ObjectId
  ownerContact?: string
  bedrooms: number
  bathrooms: number
  area?: number
  maxGuests: number
  images: string[]
  amenities: string[]
  isVerified: boolean
  isAvailable: boolean
  rating: number
  reviewCount: number
  createdAt: Date
}

const PropertySchema = new Schema<IProperty>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true, enum: ['FLAT','HOUSE','STUDIO','CONDO','TOWNHOUSE','VILLA'] },
  city: { type: String, required: true },
  neighborhood: String,
  address: { type: String, required: true },
  latitude: Number,
  longitude: Number,
  pricePerMonth: Number,
  securityDeposit: Number,
  listingPurpose: { type: String, enum: ['RENT', 'BUY'], default: 'RENT' },
  listingStatus: { type: String, enum: ['PENDING', 'APPROVED', 'DECLINED'], default: 'PENDING' },
  finalPrice: Number,
  bookingPrice: Number,
  saleStatus: { type: String, enum: ['AVAILABLE', 'RESERVED', 'SOLD'], default: 'AVAILABLE' },
  reservationDeadline: Date,
  ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
  ownerContact: String,
  bedrooms: { type: Number, required: true, default: 1 },
  bathrooms: { type: Number, required: true, default: 1 },
  area: Number,
  maxGuests: { type: Number, default: 2 },
  images: [String],
  amenities: [String],
  isVerified: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
}, { timestamps: true })

export const Property = (mongoose.models.Property as mongoose.Model<IProperty>) || mongoose.model<IProperty>('Property', PropertySchema)

// Pending user submissions are intentionally stored outside the Property
// collection so that only admin-approved properties are published.
const ListingRequestSchema = new Schema({
  title: { type: String, required: true }, description: { type: String, required: true },
  type: { type: String, required: true, enum: ['FLAT', 'HOUSE', 'STUDIO', 'CONDO', 'TOWNHOUSE', 'VILLA'] },
  city: { type: String, required: true }, neighborhood: String, address: { type: String, required: true },
  latitude: Number, longitude: Number, pricePerMonth: Number, securityDeposit: Number,
  listingPurpose: { type: String, enum: ['RENT', 'BUY'], required: true }, finalPrice: Number, bookingPrice: Number,
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, ownerContact: { type: String, required: true },
  bedrooms: { type: Number, required: true }, bathrooms: { type: Number, required: true }, area: Number,
  maxGuests: { type: Number, default: 2 }, images: [String], amenities: [String],
  listingStatus: { type: String, enum: ['PENDING', 'DECLINED'], default: 'PENDING' },
  declineReason: String,
}, { timestamps: true })

export const ListingRequest: mongoose.Model<any> = (mongoose.models.ListingRequest as mongoose.Model<any>) || mongoose.model<any>('ListingRequest', ListingRequestSchema)
