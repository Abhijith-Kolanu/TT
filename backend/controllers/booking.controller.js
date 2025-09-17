import Booking from '../models/booking.model.js';
import User from '../models/user.model.js';

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const { guideId, startDate, endDate, message } = req.body;
    const travellerId = req.user._id;
    if (!guideId || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    // Prevent duplicate pending bookings
    const existing = await Booking.findOne({ traveller: travellerId, guide: guideId, status: 'pending' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have a pending booking with this guide.' });
    }
    const booking = await Booking.create({
      traveller: travellerId,
      guide: guideId,
      startDate,
      endDate,
      message
    });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get bookings for a traveller or guide
export const getBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const asTraveller = await Booking.find({ traveller: userId }).populate('guide', 'username profilePicture');
    const asGuide = await Booking.find({ guide: userId }).populate('traveller', 'username profilePicture');
    res.json({ success: true, asTraveller, asGuide });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Accept or reject a booking (guide only)
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    // Only guide can accept/reject, but traveller can cancel their own booking
    const isGuide = booking.guide.toString() === userId.toString();
    const isTraveller = booking.traveller.toString() === userId.toString();
    if (status === 'cancelled') {
      if (!isTraveller) {
        return res.status(403).json({ success: false, message: 'Only the traveller can cancel this booking.' });
      }
    } else {
      if (!isGuide) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }
    }
    booking.status = status;
    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get booking status between traveller and guide
export const getBookingStatus = async (req, res) => {
  try {
    const { guideId } = req.params;
    const travellerId = req.user._id;
    const booking = await Booking.findOne({ traveller: travellerId, guide: guideId, status: { $in: ['pending', 'accepted'] } });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
