import Booking from '../models/booking.model.js';
import User from '../models/user.model.js';
import GuideProfile from '../models/guideProfile.model.js';

const toDate = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizeToDayStart = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const isValidTime = (value) => TIME_REGEX.test(String(value || ''));

const toDateTime = (dateValue, timeValue) => {
  const date = new Date(dateValue);
  const [hours, minutes] = String(timeValue || '00:00').split(':').map(Number);
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
};

const getInclusiveDayCount = (startDate, endDate) => {
  const start = normalizeToDayStart(startDate);
  const end = normalizeToDayStart(endDate);
  return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
};

const intervalsOverlap = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

const parseDailyCost = (value) => {
  if (value === null || value === undefined) return 0;

  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) return numeric;

  const normalized = String(value)
    .replace(/,/g, '')
    .replace(/[^0-9.]/g, '')
    .trim();

  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const canCancelAcceptedBooking = (startDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const cutoff = new Date(start);
  cutoff.setDate(cutoff.getDate() - 2);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return now <= cutoff;
};

const enrichBookingCost = (booking, resolvedCostPerDay) => {
  const bookingObj = booking?.toObject ? booking.toObject() : { ...booking };
  const fallbackCost = parseDailyCost(bookingObj?.costPerDay);
  const costPerDay = resolvedCostPerDay > 0 ? resolvedCostPerDay : fallbackCost;
  const dayCount = getInclusiveDayCount(bookingObj.startDate, bookingObj.endDate);

  return {
    ...bookingObj,
    costPerDay,
    totalCost: Number((costPerDay * dayCount).toFixed(2)),
    currency: bookingObj?.currency || 'INR'
  };
};

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const { guideId, startDate, endDate, startTime, endTime, message } = req.body;
    const travellerId = req.user._id;
    if (!guideId || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (!startTime || !endTime || !isValidTime(startTime) || !isValidTime(endTime)) {
      return res.status(400).json({ success: false, message: 'Valid start and end time are required (HH:MM).' });
    }

    if (travellerId.toString() === String(guideId)) {
      return res.status(400).json({ success: false, message: 'You cannot book yourself as a guide.' });
    }

    const start = toDate(startDate);
    const end = toDate(endDate);
    if (!start || !end) {
      return res.status(400).json({ success: false, message: 'Invalid booking dates.' });
    }

    const startDay = normalizeToDayStart(start);
    const endDay = normalizeToDayStart(end);
    const today = normalizeToDayStart(new Date());

    if (startDay < today) {
      return res.status(400).json({ success: false, message: 'Start date cannot be in the past.' });
    }

    if (endDay < startDay) {
      return res.status(400).json({ success: false, message: 'End date must be on or after start date.' });
    }

    if (endDay.getTime() === startDay.getTime() && startTime >= endTime) {
      return res.status(400).json({ success: false, message: 'For same-day bookings, end time must be after start time.' });
    }

    const guideProfile = await GuideProfile.findOne({ user: guideId });
    if (!guideProfile) {
      return res.status(404).json({ success: false, message: 'Guide profile not found.' });
    }

    const startDateTime = toDateTime(startDay, startTime);
    const endDateTime = toDateTime(endDay, endTime);

    if (endDateTime <= startDateTime) {
      return res.status(400).json({ success: false, message: 'End date/time must be after start date/time.' });
    }

    // Prevent duplicate pending bookings
    const existing = await Booking.findOne({
      traveller: travellerId,
      guide: guideId,
      status: { $in: ['pending', 'accepted'] },
      startDate: { $lte: endDay },
      endDate: { $gte: startDay }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have an active booking request for overlapping dates with this guide.' });
    }

    const dayCount = getInclusiveDayCount(startDay, endDay);
    const costPerDay = parseDailyCost(guideProfile?.pricing);
    const totalCost = Number((costPerDay * dayCount).toFixed(2));

    const booking = await Booking.create({
      traveller: travellerId,
      guide: guideId,
      startDate: startDay,
      endDate: endDay,
      startTime,
      endTime,
      costPerDay,
      totalCost,
      currency: 'INR',
      message: String(message || '').trim().slice(0, 1000)
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('guide', 'username profilePicture')
      .populate('traveller', 'username profilePicture');

    res.json({ success: true, booking: populatedBooking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get bookings for a traveller or guide
export const getBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const asTravellerRaw = await Booking.find({ traveller: userId })
      .populate('guide', 'username profilePicture')
      .sort({ createdAt: -1 });

    const asGuideRaw = await Booking.find({ guide: userId })
      .populate('traveller', 'username profilePicture')
      .sort({ createdAt: -1 });

    const requestedGuideIds = [...new Set(
      asTravellerRaw
        .map((booking) => String(booking?.guide?._id || booking?.guide || ''))
        .filter(Boolean)
    )];

    const requestedGuideProfiles = requestedGuideIds.length
      ? await GuideProfile.find({ user: { $in: requestedGuideIds } }).select('user pricing')
      : [];

    const guideCostMap = new Map(
      requestedGuideProfiles.map((profile) => [String(profile.user), parseDailyCost(profile.pricing)])
    );

    const ownGuideProfile = await GuideProfile.findOne({ user: userId }).select('pricing');
    const ownGuideCostPerDay = parseDailyCost(ownGuideProfile?.pricing);

    const asTraveller = asTravellerRaw.map((booking) => {
      const guideId = String(booking?.guide?._id || booking?.guide || '');
      const requestedGuideCost = guideCostMap.get(guideId) || 0;
      return enrichBookingCost(booking, requestedGuideCost);
    });

    const asGuide = asGuideRaw.map((booking) => enrichBookingCost(booking, ownGuideCostPerDay));

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
      const canTravellerCancel = isTraveller && ['pending', 'accepted'].includes(booking.status);
      const canGuideCancelAccepted = isGuide && booking.status === 'accepted';

      if (!canTravellerCancel && !canGuideCancelAccepted) {
        return res.status(403).json({ success: false, message: 'Only the traveller (pending/accepted) or guide (accepted) can cancel this booking.' });
      }

      if (isTraveller && !['pending', 'accepted'].includes(booking.status)) {
        return res.status(400).json({ success: false, message: `Booking cannot be cancelled from ${booking.status} state.` });
      }

      if (isGuide && booking.status !== 'accepted') {
        return res.status(400).json({ success: false, message: 'Guide can cancel only accepted bookings.' });
      }

      if (booking.status === 'accepted' && !canCancelAcceptedBooking(booking.startDate)) {
        return res.status(400).json({
          success: false,
          message: 'Accepted booking can only be cancelled until 2 days before the start date.'
        });
      }
    } else {
      if (!isGuide) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }

      if (booking.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Only pending bookings can be accepted or rejected.' });
      }

      if (status === 'accepted') {
        const overlappingAccepted = await Booking.find({
          _id: { $ne: booking._id },
          guide: booking.guide,
          status: 'accepted',
          startDate: { $lte: booking.endDate },
          endDate: { $gte: booking.startDate }
        }).populate('traveller', 'username');

        const bookingStart = toDateTime(booking.startDate, booking.startTime || '09:00');
        const bookingEnd = toDateTime(booking.endDate, booking.endTime || '18:00');

        const conflictItems = overlappingAccepted.filter(item => {
          const itemStart = toDateTime(item.startDate, item.startTime || '09:00');
          const itemEnd = toDateTime(item.endDate, item.endTime || '18:00');
          return intervalsOverlap(bookingStart, bookingEnd, itemStart, itemEnd);
        });

        if (conflictItems.length > 0) {
          const guideProfile = await GuideProfile.findOne({ user: booking.guide }).select('pricing');
          const guideCostPerDay = parseDailyCost(guideProfile?.pricing);
          const currentDays = getInclusiveDayCount(booking.startDate, booking.endDate);
          const currentCostPerDay = guideCostPerDay > 0 ? guideCostPerDay : parseDailyCost(booking.costPerDay);

          return res.status(409).json({
            success: false,
            message: 'You already accepted another booking in the same time window. Cancel that accepted booking first if you want to accept this one.',
            conflict: {
              currentRequest: {
                bookingId: booking._id,
                travellerId: booking.traveller,
                startDate: booking.startDate,
                endDate: booking.endDate,
                startTime: booking.startTime || '09:00',
                endTime: booking.endTime || '18:00',
                costPerDay: currentCostPerDay,
                totalCost: Number((currentCostPerDay * currentDays).toFixed(2)),
                currency: booking.currency || 'INR'
              },
              conflictingAccepted: conflictItems.map(item => {
                const days = getInclusiveDayCount(item.startDate, item.endDate);
                const costPerDay = guideCostPerDay > 0 ? guideCostPerDay : parseDailyCost(item.costPerDay);
                return {
                  bookingId: item._id,
                  travellerId: item.traveller?._id || item.traveller,
                  travellerName: item.traveller?.username || 'Traveller',
                  startDate: item.startDate,
                  endDate: item.endDate,
                  startTime: item.startTime || '09:00',
                  endTime: item.endTime || '18:00',
                  costPerDay,
                  totalCost: Number((costPerDay * days).toFixed(2)),
                  currency: item.currency || 'INR'
                };
              })
            }
          });
        }
      }
    }

    booking.status = status;
    await booking.save();

    if (status === 'accepted') {
      await Booking.updateMany(
        {
          _id: { $ne: booking._id },
          traveller: booking.traveller,
          status: 'pending'
        },
        {
          $set: { status: 'withdrawn' }
        }
      );
    }

    const updatedBooking = await Booking.findById(booking._id)
      .populate('guide', 'username profilePicture')
      .populate('traveller', 'username profilePicture');

    res.json({ success: true, booking: updatedBooking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get booking status between traveller and guide
export const getBookingStatus = async (req, res) => {
  try {
    const { guideId } = req.params;
    const travellerId = req.user._id;

    const booking = await Booking.findOne({
      traveller: travellerId,
      guide: guideId,
      status: { $in: ['pending', 'accepted', 'rejected', 'withdrawn'] }
    }).sort({ createdAt: -1 });

    if (!booking) {
      return res.json({ success: true, booking: null });
    }

    const requestedGuideProfile = await GuideProfile.findOne({ user: guideId }).select('pricing');
    const requestedGuideCost = parseDailyCost(requestedGuideProfile?.pricing);
    const enrichedBooking = enrichBookingCost(booking, requestedGuideCost);

    res.json({ success: true, booking: enrichedBooking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
