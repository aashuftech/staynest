import mongoose, { Schema, Document } from 'mongoose'

export interface IBooking extends Document {
  userId: string
  propertyId: mongoose.Types.ObjectId
  checkIn: Date
  checkOut: Date
  totalAmount: number
  serviceTax: number
  cleaningFee: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED'
  paymentMethod?: string
  stripePaymentId?: string
  bookingType: 'RENT' | 'PURCHASE_RESERVATION'
  reservationDeadline?: Date
  createdAt: Date
}

const BookingSchema = new Schema<IBooking>({
  userId: { type: String, required: true },
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  totalAmount: { type: Number, required: true },
  serviceTax: { type: Number, default: 0 },
  cleaningFee: { type: Number, default: 0 },
  status: { type: String, enum: ['PENDING','CONFIRMED','CANCELLED','COMPLETED'], default: 'PENDING' },
  paymentStatus: { type: String, enum: ['PENDING','PAID','FAILED'], default: 'PENDING' },
  paymentMethod: String,
  stripePaymentId: String,
  bookingType: { type: String, enum: ['RENT', 'PURCHASE_RESERVATION'], default: 'RENT' },
  reservationDeadline: Date,
}, { timestamps: true })

export const Booking = (mongoose.models.Booking as mongoose.Model<IBooking>) || mongoose.model<IBooking>('Booking', BookingSchema)
