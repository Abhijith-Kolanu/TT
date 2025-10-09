import Journal from "../models/journal.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import mongoose from "mongoose";

export const createJournal = async (req, res) => {
    try {
        console.log('Journal creation request received');
        console.log('Request body:', req.body);
        console.log('Request files:', req.files);
        console.log('User ID:', req.user._id);
        
        const { title, content, location, mood, tags, isPrivate = true } = req.body;
        const authorId = req.user._id;

        if (!title || !content) {
            return res.status(400).json({
                message: 'Title and content are required',
                success: false
            });
        }

        if (!authorId) {
            return res.status(401).json({
                message: 'User not authenticated',
                success: false
            });
        }

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(authorId)) {
            return res.status(400).json({
                message: 'Invalid user ID format',
                success: false
            });
        }

        // Handle image uploads
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const fileUri = getDataUri(file);
                console.log('FileUri type:', typeof fileUri);
                console.log('FileUri length:', fileUri.length);
                console.log('FileUri starts with:', fileUri.substring(0, 50));
                
                const cloudResponse = await cloudinary.uploader.upload(fileUri, {
                    folder: 'journal_images'
                });
                imageUrls.push(cloudResponse.secure_url);
            }
        }

        // Parse tags if they come as string
        let parsedTags = [];
        if (tags) {
            try {
                parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
            } catch (e) {
                console.log('Error parsing tags:', e);
                parsedTags = [];
            }
        }

        const journal = await Journal.create({
            title,
            content,
            images: imageUrls,
            location,
            mood,
            tags: parsedTags,
            isPrivate,
            author: authorId
        });

        // Populate author details
        const populatedJournal = await Journal.findById(journal._id).populate({
            path: 'author',
            select: '-password'
        });

        return res.status(201).json({
            message: 'Journal entry created successfully',
            journal: populatedJournal,
            success: true
        });

    } catch (error) {
        console.log('Error creating journal:');
        console.log('Error message:', error.message);
        console.log('Error stack:', error.stack);
        return res.status(500).json({
            message: 'Internal server error',
            success: false,
            error: error.message
        });
    }
};

export const getUserJournals = async (req, res) => {
    try {
        const authorId = req.user._id;
        const { 
            page = 1, 
            limit = 10, 
            search, 
            mood, 
            location, 
            startDate, 
            endDate,
            tags 
        } = req.query;

        // Build query
        let query = { author: authorId, isPrivate: true };

        // Add search filters
        if (search) {
            query.$text = { $search: search };
        }

        if (mood && mood !== 'all') {
            query.mood = mood;
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        if (tags) {
            const tagArray = Array.isArray(tags) ? tags : tags.split(',');
            query.tags = { $in: tagArray };
        }

        // Date range filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const journals = await Journal.find(query)
            .populate({
                path: 'author',
                select: '-password'
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Journal.countDocuments(query);

        return res.status(200).json({
            journals,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalJournals: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            },
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

export const getJournalById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const journal = await Journal.findById(id).populate({
            path: 'author',
            select: '-password'
        });

        if (!journal) {
            return res.status(404).json({
                message: 'Journal not found',
                success: false
            });
        }

        // Check if user is authorized to view this journal
        if (journal.author._id.toString() !== userId) {
            return res.status(403).json({
                message: 'Not authorized to view this journal',
                success: false
            });
        }

        return res.status(200).json({
            journal,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

export const updateJournal = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { title, content, location, mood, tags } = req.body;

        const journal = await Journal.findById(id);

        if (!journal) {
            return res.status(404).json({
                message: 'Journal not found',
                success: false
            });
        }

        // Check if user is authorized to update this journal
        if (journal.author.toString() !== userId) {
            return res.status(403).json({
                message: 'Not authorized to update this journal',
                success: false
            });
        }

        // Handle image uploads if new images are provided
        let imageUrls = journal.images || [];
        if (req.files && req.files.length > 0) {
            imageUrls = []; // Replace all images
            for (const file of req.files) {
                const fileUri = getDataUri(file);
                const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                    folder: 'journal_images'
                });
                imageUrls.push(cloudResponse.secure_url);
            }
        }

        // Parse tags if they come as string
        let parsedTags = journal.tags;
        if (tags !== undefined) {
            parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        }

        const updatedJournal = await Journal.findByIdAndUpdate(
            id,
            {
                title: title || journal.title,
                content: content || journal.content,
                location: location || journal.location,
                mood: mood || journal.mood,
                tags: parsedTags,
                images: imageUrls
            },
            { new: true }
        ).populate({
            path: 'author',
            select: '-password'
        });

        return res.status(200).json({
            message: 'Journal updated successfully',
            journal: updatedJournal,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

export const deleteJournal = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const journal = await Journal.findById(id);

        if (!journal) {
            return res.status(404).json({
                message: 'Journal not found',
                success: false
            });
        }

        // Check if user is authorized to delete this journal
        if (journal.author.toString() !== userId) {
            return res.status(403).json({
                message: 'Not authorized to delete this journal',
                success: false
            });
        }

        await Journal.findByIdAndDelete(id);

        return res.status(200).json({
            message: 'Journal deleted successfully',
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

export const getJournalStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const stats = await Journal.aggregate([
            { $match: { author: userId, isPrivate: true } },
            {
                $group: {
                    _id: null,
                    totalJournals: { $sum: 1 },
                    moodCounts: {
                        $push: "$mood"
                    },
                    avgWordsPerEntry: {
                        $avg: { $size: { $split: ["$content", " "] } }
                    }
                }
            },
            {
                $project: {
                    totalJournals: 1,
                    avgWordsPerEntry: { $round: ["$avgWordsPerEntry", 0] },
                    moodBreakdown: {
                        $arrayToObject: {
                            $map: {
                                input: {
                                    $setUnion: ["$moodCounts"]
                                },
                                as: "mood",
                                in: {
                                    k: "$$mood",
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$moodCounts",
                                                cond: { $eq: ["$$this", "$$mood"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ]);

        return res.status(200).json({
            stats: stats[0] || {
                totalJournals: 0,
                avgWordsPerEntry: 0,
                moodBreakdown: {}
            },
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};
