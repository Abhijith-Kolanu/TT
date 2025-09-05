import mongoose from "mongoose";

const journalSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 200
    },
    content: {
        type: String,
        required: true,
        maxLength: 5000
    },
    images: [{
        type: String // URLs to images stored in cloudinary
    }],
    location: {
        type: String,
        trim: true,
        maxLength: 200
    },
    mood: {
        type: String,
        enum: ['excited', 'peaceful', 'curious', 'grateful', 'reflective', 'adventurous'],
        default: 'peaceful'
    },
    tags: [{
        type: String,
        trim: true,
        maxLength: 50
    }],
    isPrivate: {
        type: Boolean,
        default: true // Private journal entries are always private
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Index for better query performance
journalSchema.index({ author: 1, createdAt: -1 });
journalSchema.index({ author: 1, mood: 1 });
journalSchema.index({ author: 1, location: 1 });
journalSchema.index({ author: 1, tags: 1 });

// Text index for search functionality
journalSchema.index({
    title: 'text',
    content: 'text',
    location: 'text',
    tags: 'text'
});

export default mongoose.model("Journal", journalSchema);