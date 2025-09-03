import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    message: {
        type: String,
        required: true
    },
    sharedPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        default: null
    },
    messageType: {
        type: String,
        enum: ['text', 'post'],
        default: 'text'
    }
}, { timestamps: true });

export const Message = mongoose.model('Message', messageSchema);