import GuideProfile from '../models/guideProfile.model.js';
import User from '../models/user.model.js';

const normalizeArray = (value) => {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(item => String(item || '').trim()).filter(Boolean))];
};

const normalizePricing = (value) => {
  if (value === null || value === undefined) return '';
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric >= 0) return String(Math.round(numeric));
  return String(value).trim();
};

const normalizeGuidePayload = (payload = {}) => ({
  bio: String(payload.bio || '').trim(),
  languages: normalizeArray(payload.languages),
  expertise: normalizeArray(payload.expertise),
  locations: normalizeArray(payload.locations),
  pricing: normalizePricing(payload.pricing),
  portfolio: normalizeArray(payload.portfolio)
});

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Create or update guide profile
export const upsertGuideProfile = async (req, res) => {
  try {
    const { bio, languages, expertise, locations, pricing, portfolio } = normalizeGuidePayload(req.body);
    const userId = req.user._id;

    if (!bio || languages.length === 0 || expertise.length === 0 || locations.length === 0 || !pricing) {
      return res.status(400).json({
        success: false,
        message: 'Bio, languages, expertise, locations, and pricing are required.'
      });
    }

    let profile = await GuideProfile.findOne({ user: userId });
    if (profile) {
      profile.bio = bio;
      profile.languages = languages;
      profile.expertise = expertise;
      profile.locations = locations;
      profile.pricing = pricing;
      profile.portfolio = portfolio;
      await profile.save();
    } else {
      profile = await GuideProfile.create({
        user: userId, bio, languages, expertise, locations, pricing, portfolio
      });
    }
    const populatedProfile = await GuideProfile.findById(profile._id).populate('user', 'username profilePicture');
    res.json({ success: true, profile: populatedProfile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all guides (with search/filter)
export const getGuides = async (req, res) => {
  try {
    const { location, language, expertise } = req.query;
    const filter = {};
    if (location) filter.locations = { $regex: escapeRegex(location), $options: 'i' };
    if (language) filter.languages = { $regex: `^${escapeRegex(language)}$`, $options: 'i' };
    if (expertise) filter.expertise = { $regex: `^${escapeRegex(expertise)}$`, $options: 'i' };

    const guides = await GuideProfile.find(filter)
      .populate('user', 'username profilePicture')
      .sort({ isVerified: -1, rating: -1, createdAt: -1 });

    res.json({ success: true, guides });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyGuideProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await GuideProfile.findOne({ user: userId }).populate('user', 'username profilePicture');
    if (!profile) return res.status(404).json({ success: false, message: 'Guide profile not found' });
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get a single guide profile
export const getGuideProfile = async (req, res) => {


  try {
    const { id } = req.params;
    const profile = await GuideProfile.findOne({ user: id }).populate('user', 'username profilePicture');
    if (!profile) return res.status(404).json({ success: false, message: 'Guide not found' });
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
