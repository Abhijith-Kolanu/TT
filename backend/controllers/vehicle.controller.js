import Vehicle from '../models/vehicle.model.js';
import VehicleRental from '../models/vehicleRental.model.js';
import cloudinary from '../utils/cloudinary.js';
import getDataUri from '../utils/datauri.js';

// ─── Vehicle CRUD ───────────────────────────────────────────────────────────

// List a new vehicle
export const createVehicle = async (req, res) => {
    try {
        const { title, type, brand, model, year, description, location, pricePerDay, features, seats, fuelType, transmission } = req.body;

        if (!title || !type || !brand || !model || !year || !location || !pricePerDay) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Upload images to cloudinary
        const imageUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const dataUri = getDataUri(file);
                const result = await cloudinary.uploader.upload(dataUri, { folder: 'vehicles' });
                imageUrls.push(result.secure_url);
            }
        }

        const vehicle = await Vehicle.create({
            owner: req.user._id,
            title,
            type,
            brand,
            model,
            year: Number(year),
            description,
            location,
            pricePerDay: Number(pricePerDay),
            features: features ? (Array.isArray(features) ? features : features.split(',').map(f => f.trim())) : [],
            seats: seats ? Number(seats) : 4,
            fuelType: fuelType || 'petrol',
            transmission: transmission || 'manual',
            images: imageUrls,
        });

        await vehicle.populate('owner', 'username profilePicture');
        res.status(201).json({ success: true, vehicle });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get all available vehicles (with optional filters)
export const getAllVehicles = async (req, res) => {
    try {
        const { type, location, minPrice, maxPrice, search } = req.query;
        const filter = { isAvailable: true, owner: { $ne: req.user._id } };

        if (type) filter.type = type;
        if (location) filter.location = { $regex: location, $options: 'i' };
        if (minPrice || maxPrice) {
            filter.pricePerDay = {};
            if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
            if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { model: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
            ];
        }

        const vehicles = await Vehicle.find(filter)
            .populate('owner', 'username profilePicture')
            .sort({ createdAt: -1 });

        res.json({ success: true, vehicles });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get single vehicle by ID
export const getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id).populate('owner', 'username profilePicture');
        if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
        res.json({ success: true, vehicle });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get vehicles listed by the logged-in user
export const getMyVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ owner: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, vehicles });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update vehicle listing
export const updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
        if (vehicle.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updates = req.body;
        if (updates.year) updates.year = Number(updates.year);
        if (updates.pricePerDay) updates.pricePerDay = Number(updates.pricePerDay);
        if (updates.seats) updates.seats = Number(updates.seats);
        if (updates.features && !Array.isArray(updates.features)) {
            updates.features = updates.features.split(',').map(f => f.trim());
        }

        Object.assign(vehicle, updates);
        await vehicle.save();
        res.json({ success: true, vehicle });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete vehicle listing
export const deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
        if (vehicle.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        await vehicle.deleteOne();
        res.json({ success: true, message: 'Vehicle listing deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Rental Bookings ─────────────────────────────────────────────────────────

// Book a vehicle
export const createRental = async (req, res) => {
    try {
        const { vehicleId, startDate, endDate, message } = req.body;
        if (!vehicleId || !startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
        if (!vehicle.isAvailable) return res.status(400).json({ success: false, message: 'Vehicle is not available' });
        if (vehicle.owner.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot rent your own vehicle' });
        }

        // Prevent overlapping bookings
        const overlap = await VehicleRental.findOne({
            vehicle: vehicleId,
            status: { $in: ['pending', 'confirmed'] },
            $or: [
                { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
            ]
        });
        if (overlap) {
            return res.status(400).json({ success: false, message: 'Vehicle is already booked for selected dates' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        const totalAmount = totalDays * vehicle.pricePerDay;

        const rental = await VehicleRental.create({
            vehicle: vehicleId,
            renter: req.user._id,
            owner: vehicle.owner,
            startDate: start,
            endDate: end,
            totalDays,
            totalAmount,
            message: message || '',
        });

        await rental.populate([
            { path: 'vehicle', select: 'title brand model images pricePerDay location' },
            { path: 'renter', select: 'username profilePicture' },
            { path: 'owner', select: 'username profilePicture' },
        ]);

        res.status(201).json({ success: true, rental });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get rental history for logged-in user (as renter and as owner)
export const getMyRentals = async (req, res) => {
    try {
        const asRenter = await VehicleRental.find({ renter: req.user._id })
            .populate('vehicle', 'title brand model images location pricePerDay')
            .populate('owner', 'username profilePicture')
            .sort({ createdAt: -1 });

        const asOwner = await VehicleRental.find({ owner: req.user._id })
            .populate('vehicle', 'title brand model images location pricePerDay')
            .populate('renter', 'username profilePicture')
            .sort({ createdAt: -1 });

        res.json({ success: true, asRenter, asOwner });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update rental status (owner confirms/rejects, renter cancels)
export const updateRentalStatus = async (req, res) => {
    try {
        const { rentalId } = req.params;
        const { status } = req.body;
        const userId = req.user._id.toString();

        const rental = await VehicleRental.findById(rentalId);
        if (!rental) return res.status(404).json({ success: false, message: 'Rental not found' });

        const isOwner = rental.owner.toString() === userId;
        const isRenter = rental.renter.toString() === userId;

        if (status === 'cancelled') {
            if (!isRenter && !isOwner) return res.status(403).json({ success: false, message: 'Not authorized' });
        } else if (status === 'confirmed' || status === 'completed') {
            if (!isOwner) return res.status(403).json({ success: false, message: 'Only the vehicle owner can confirm/complete this rental' });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        rental.status = status;
        await rental.save();
        res.json({ success: true, rental });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
