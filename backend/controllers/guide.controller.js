import GuideProfile from '../models/guideProfile.model.js';
import User from '../models/user.model.js';

// Create or update guide profile
export const upsertGuideProfile = async (req, res) => {
  try {
    const { bio, languages, expertise, locations, pricing, portfolio } = req.body;
    const userId = req.user._id;
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
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all guides (with search/filter)
export const getGuides = async (req, res) => {
  try {
    const { location, language, expertise } = req.query;
    let filter = {};
    if (location) filter.locations = location;
    if (language) filter.languages = language;
    if (expertise) filter.expertise = expertise;
    const guides = await GuideProfile.find(filter).populate('user', 'username profilePicture');
    res.json({ success: true, guides });
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
