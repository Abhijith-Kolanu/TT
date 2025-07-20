import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { Notification } from "../models/notification.model.js";

export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;
        if (!image) return res.status(400).json({ message: 'Image required' });

        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri);
        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId
        });
        const user = await User.findById(authorId);
        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({ path: 'author', select: '-password' });

        return res.status(201).json({
            message: 'New post added',
            post,
            success: true,
        });
    } catch (error) {
        console.log("Error in addNewPost:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture' })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });
        return res.status(200).json({
            posts,
            success: true
        });
    } catch (error) {
        console.log("Error in getAllPost:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const getExplorePosts = async (req, res) => {
    try {
        const loggedInUserId = req.id;
        const loggedInUser = await User.findById(loggedInUserId);

        if (!loggedInUser) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        const posts = await Post.find({
            author: { $nin: [...loggedInUser.following, loggedInUserId] }
        })
        .sort({ createdAt: -1 })
        .populate({ path: 'author', select: 'username profilePicture' });

        return res.status(200).json({
            posts,
            success: true
        });

    } catch (error) {
        console.log("Error in getExplorePosts controller:", error.message);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 })
            .populate({
                path: 'author',
                select: 'username, profilePicture'
            }).populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username, profilePicture'
                }
            });
        return res.status(200).json({
            posts,
            success: true
        });
    } catch (error) {
        console.log("Error in getUserPost:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const likePost = async (req, res) => {
    try {
        const likeKrneWalaUserKiId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        await post.updateOne({ $addToSet: { likes: likeKrneWalaUserKiId } });
        await post.save();

        const postOwnerId = post.author.toString();
        if (postOwnerId !== likeKrneWalaUserKiId) {
            const notification = await Notification.create({
                sender: likeKrneWalaUserKiId,
                recipient: postOwnerId,
                type: 'like',
                post: postId
            });
            const populatedNotification = await Notification.findById(notification._id)
                .populate({ path: 'sender', select: 'username profilePicture' });

            // --- DEBUGGING LOGS ---
            const receiverSocketId = getReceiverSocketId(postOwnerId);
            console.log("--- LIKE NOTIFICATION ---");
            console.log("Post Owner ID:", postOwnerId);
            console.log("Receiver's Socket ID:", receiverSocketId);
            console.log("Emitting 'newNotification' with data:", populatedNotification);
            // --- END OF DEBUGGING ---

            if (receiverSocketId) {
                io.to(receiverSocketId).emit('newNotification', populatedNotification);
            }
        }
        return res.status(200).json({ message: 'Post liked', success: true });
    } catch (error) {
        console.log("Error in likePost:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const dislikePost = async (req, res) => {
    try {
        const likeKrneWalaUserKiId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        await post.updateOne({ $pull: { likes: likeKrneWalaUserKiId } });
        await post.save();

        return res.status(200).json({ message: 'Post disliked', success: true });
    } catch (error) {
        console.log("Error in dislikePost:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const addComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const commentKrneWalaUserKiId = req.id;
        const { text } = req.body;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found", success: false });
        if (!text) return res.status(400).json({ message: 'Text is required', success: false });

        const comment = await Comment.create({
            text,
            author: commentKrneWalaUserKiId,
            post: postId
        });

        await comment.populate({
            path: 'author',
            select: "username profilePicture"
        });

        post.comments.push(comment._id);
        await post.save();

        const postOwnerId = post.author.toString();
        if (postOwnerId !== commentKrneWalaUserKiId) {
            const notification = await Notification.create({
                sender: commentKrneWalaUserKiId,
                recipient: postOwnerId,
                type: 'comment',
                post: postId
            });
            const populatedNotification = await Notification.findById(notification._id)
                .populate({ path: 'sender', select: 'username profilePicture' });
            
            // --- DEBUGGING LOGS ---
            const receiverSocketId = getReceiverSocketId(postOwnerId);
            console.log("--- COMMENT NOTIFICATION ---");
            console.log("Post Owner ID:", postOwnerId);
            console.log("Receiver's Socket ID:", receiverSocketId);
            console.log("Emitting 'newNotification' with data:", populatedNotification);
            // --- END OF DEBUGGING ---

            if (receiverSocketId) {
                io.to(receiverSocketId).emit('newNotification', populatedNotification);
            }
        }
        return res.status(201).json({
            message: 'Comment Added',
            comment,
            success: true
        });
    } catch (error) {
        console.log("Error in addComment:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const getCommentsOfPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const comments = await Comment.find({ post: postId }).populate('author', 'username profilePicture');
        if (!comments) return res.status(404).json({ message: 'No comments found for this post', success: false });

        return res.status(200).json({ success: true, comments });
    } catch (error) {
        console.log("Error in getCommentsOfPost:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });
        if (post.author.toString() !== authorId) return res.status(403).json({ message: 'Unauthorized' });

        await Post.findByIdAndDelete(postId);
        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id => id.toString() !== postId);
        await user.save();
        await Comment.deleteMany({ post: postId });

        return res.status(200).json({
            success: true,
            message: 'Post deleted'
        });
    } catch (error) {
        console.log("Error in deletePost:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const bookmarkPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        const user = await User.findById(authorId);
        if (user.bookmarks.includes(post._id)) {
            await user.updateOne({ $pull: { bookmarks: post._id } });
            await user.save();
            return res.status(200).json({ type: 'unsaved', message: 'Post removed from bookmark', success: true });
        } else {
            await user.updateOne({ $addToSet: { bookmarks: post._id } });
            await user.save();
            return res.status(200).json({ type: 'saved', message: 'Post bookmarked', success: true });
        }
    } catch (error) {
        console.log("Error in bookmarkPost:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};