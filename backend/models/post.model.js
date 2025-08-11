import mongoose from "mongoose";
const postSchema = new mongoose.Schema({
    caption: { type: String, default: '' },
    image: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],

    // GeoJSON Location Field
    location: {
        type: {
            type: String,
            enum: ['Point'],     // ✅ enforce only 'Point'
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true,      // ✅ make sure it's set (lon, lat)
        },
        name: {
            type: String,
            required: false
        }
    },

});
export const Post = mongoose.model('Post', postSchema);