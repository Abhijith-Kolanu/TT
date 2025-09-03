import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { Notification } from "../models/notification.model.js";

export const addNewPost = async (req, res) => {
    try {
        const { caption, coordinates, locationName } = req.body;
        const image = req.file;
        const authorId = req.id;

        if (!image) return res.status(400).json({ message: 'Image required' });

        if (!coordinates) return res.status(400).json({ message: 'Location required' });

        // Parse coordinates safely
        let parsedCoords;
        try {
            parsedCoords = JSON.parse(coordinates);
            if (
                !Array.isArray(parsedCoords) ||
                parsedCoords.length !== 2 ||
                typeof parsedCoords[0] !== 'number' ||
                typeof parsedCoords[1] !== 'number'
            ) {
                throw new Error("Invalid coordinates");
            }
        } catch (e) {
            return res.status(400).json({ message: "Invalid coordinates format", success: false });
        }

        // Resize + upload image
        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri);

        // Create the post with location
        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId,
            location: {
                type: "Point",
                coordinates: parsedCoords,
                name: locationName || "Unknown"
            }
        });

        // Link post to user
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
        const userId = req.id; // the user who liked
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found', success: false });
        }

        // Add like to post
        await post.updateOne({ $addToSet: { likes: userId } });

        const postOwnerId = post.author.toString();

        // Avoid self-notifications
        if (postOwnerId !== userId) {
            // Get sender info
            const senderUser = await User.findById(userId).select("username profilePicture");

            // Create a DB notification
            const notification = await Notification.create({
                sender: userId,
                recipient: postOwnerId,
                type: 'like',
                post: postId
            });

            const unifiedNotification = {
                _id: notification._id,
                type: "like",
                message: `${senderUser.username} liked your post`,
                sender: {
                    _id: senderUser._id,
                    username: senderUser.username,
                    profilePicture: senderUser.profilePicture || ""
                },
                recipientId: postOwnerId,
                post: postId,
                read: false,
                createdAt: notification.createdAt
            };

            const receiverSocketId = getReceiverSocketId(postOwnerId);
            if (receiverSocketId) {
                console.log("Emitting to socket:", receiverSocketId);
                io.to(receiverSocketId).emit('newNotification', unifiedNotification);
            }
        }

        return res.status(200).json({ message: 'Post liked', success: true });

    } catch (error) {
        console.error("Error in likePost:", error);
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


// export const getFootstepsPosts = async (req, res) => {
//     try {
//         const posts = await Post.find({
//             "location.coordinates": { $exists: true, $ne: [] }
//         }).select("caption image location");

//         // Transform to match frontend expectations
//         const formatted = posts.map(post => ({
//             _id: post._id,
//             caption: post.caption,
//             imageUrl: post.image, // your model uses 'image'
//             coordinates: post.location.coordinates, // [lon, lat]
//             locationName: post.location.name || null
//         }));

//         res.json({ posts: formatted });
//     } catch (err) {
//         console.error("Error fetching footsteps posts:", err);
//         res.status(500).json({ error: "Server error" });
//     }
// }





export const getFootstepsPosts = async (req, res) => {
    try {
        const posts = await Post.find({
            "location.coordinates": {
                $exists: true,
                $type: "array",
                $size: 2
            }
        }).select("caption image location");

        const formatted = posts.map(post => ({
            _id: post._id,
            caption: post.caption,
            imageUrl: post.image?.startsWith("http")
                ? post.image
                : `${process.env.BASE_URL || ""}/${post.image}`,
            coordinates: post.location.coordinates, // [lon, lat]
            locationName: post.location.name || null
        }));

        res.status(200).json({ posts: formatted });
    } catch (err) {
        console.error("Error fetching footsteps posts:", err);
        res.status(500).json({ error: "Server error" });
    }
};

export const getPostById = async (req, res) => {
    try {
        const postId = req.params.id;
        
        const post = await Post.findById(postId)
            .populate({
                path: 'author',
                select: 'username profilePicture'
            })
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        return res.status(200).json({
            success: true,
            post
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
