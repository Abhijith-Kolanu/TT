import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  traveller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  guide: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'cancelled', 'withdrawn'], default: 'pending' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startTime: { type: String, default: '09:00' },
  endTime: { type: String, default: '18:00' },
  costPerDay: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  message: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', BookingSchema);
export default Booking;
