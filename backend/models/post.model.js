import mongoose from "mongoose";
const postSchema = new mongoose.Schema({
    caption:{type:String, default:''},
    image:{type:String, default:null},
    video:{type:String, default:null},
    mediaType:{type:String, enum:['image', 'video'], default:'image'},
    author:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    likes:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
    comments:[{type:mongoose.Schema.Types.ObjectId, ref:'Comment'}],
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        name: {
            type: String,
            default: 'Unknown'
        }
    }
}, {
    timestamps: true
});
export const Post = mongoose.model('Post', postSchema);