import mongoose from 'mongoose';

const GuideProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio: { type: String, default: '' },
  languages: [{ type: String }],
  expertise: [{ type: String }],
  locations: [{ type: String }],
  pricing: {
    type: String, // e.g. 'Hourly', 'Per Day', 'Package', or a price string
    default: ''
  },
  portfolio: [{ type: String }], // URLs to images
  rating: { type: Number, default: 0 },
  reviews: [{
    traveller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now }
  }],
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const GuideProfile = mongoose.model('GuideProfile', GuideProfileSchema);
export default GuideProfile;
