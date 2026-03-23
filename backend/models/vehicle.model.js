import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    type: {
        type: String,
        enum: ['bike', 'car', 'suv', 'bicycle', 'scooter', 'atv', 'jeep'],
        required: true
    },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    description: { type: String, default: '' },
    location: { type: String, required: true, trim: true },
    pricePerDay: { type: Number, required: true },
    images: [{ type: String }],
    features: [{ type: String }],
    seats: { type: Number, default: 4 },
    fuelType: {
        type: String,
        enum: ['petrol', 'diesel', 'electric', 'cng', 'hybrid'],
        default: 'petrol'
    },
    transmission: {
        type: String,
        enum: ['manual', 'automatic'],
        default: 'manual'
    },
    isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
