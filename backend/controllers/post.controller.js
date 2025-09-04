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

        // Parse coordinates safely (make it optional)
        let locationData = null;
        if (coordinates) {
            try {
                const parsedCoords = JSON.parse(coordinates);
                if (
                    Array.isArray(parsedCoords) &&
                    parsedCoords.length === 2 &&
                    typeof parsedCoords[0] === 'number' &&
                    typeof parsedCoords[1] === 'number'
                ) {
                    locationData = {
                        type: "Point",
                        coordinates: parsedCoords,
                        name: locationName || "Unknown"
                    };
                }
            } catch (e) {
                console.log("Invalid coordinates format, creating post without location");
            }
        }

        // Resize + upload image
        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri);

        // Create the post with optional location
        const postData = {
            caption,
            image: cloudResponse.secure_url,
            author: authorId,
        };
        
        if (locationData) {
            postData.location = locationData;
        }

        const post = await Post.create(postData);

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
            .select('+createdAt +updatedAt') // Explicitly include timestamps
            .populate({ path: 'author', select: 'username profilePicture' })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });
        
        // Debug log to see what we're getting
        console.log('Sample post timestamp data:', {
            hasCreatedAt: posts[0]?.createdAt ? true : false,
            createdAt: posts[0]?.createdAt,
            postId: posts[0]?._id
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

export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.id;

        // Find the comment
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found', success: false });
        }

        // Check if user is the author of the comment
        if (comment.author.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized to delete this comment', success: false });
        }

        // Remove comment from the post's comments array
        await Post.findByIdAndUpdate(comment.post, {
            $pull: { comments: commentId }
        });

        // Delete the comment
        await Comment.findByIdAndDelete(commentId);

        // Get updated post with comments
        const updatedPost = await Post.findById(comment.post).populate({
            path: 'comments',
            sort: { createdAt: -1 },
            populate: {
                path: 'author',
                select: 'username profilePicture'
            }
        });

        return res.status(200).json({
            message: 'Comment deleted successfully',
            post: updatedPost,
            success: true
        });
    } catch (error) {
        console.log("Error in deleteComment:", error);
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
        const { mode } = req.query; // 'public' or 'private'
        const userId = req.id; // from authentication middleware
        
        console.log('Footsteps API called with mode:', mode, 'by user:', userId);
        
        let query = {
            "location.coordinates": {
                $exists: true,
                $type: "array",
                $size: 2
            }
        };

        // If private mode, only show current user's posts
        if (mode === 'private') {
            query.author = userId;
            console.log('Private mode: filtering for user', userId);
        } else {
            console.log('Public mode: showing all posts');
        }

        console.log('Query:', JSON.stringify(query, null, 2));

        const posts = await Post.find(query)
            .populate({
                path: 'author',
                select: 'username profilePicture'
            })
            .select("caption image location author");

        console.log('Found', posts.length, 'footsteps posts');

        // Also check total posts with any location data for debugging
        const totalWithLocation = await Post.countDocuments({
            "location": { $exists: true }
        });
        console.log('Total posts with any location data:', totalWithLocation);

        const formatted = posts.map(post => ({
            _id: post._id,
            caption: post.caption,
            imageUrl: post.image?.startsWith("http")
                ? post.image
                : `${process.env.BASE_URL || ""}/${post.image}`,
            coordinates: post.location.coordinates, // [lon, lat]
            locationName: post.location.name || null,
            author: post.author
        }));

        res.status(200).json({ 
            posts: formatted,
            mode: mode || 'public',
            totalPosts: formatted.length,
            debug: {
                userId,
                totalWithLocation,
                query
            }
        });
    } catch (err) {
        console.error("Error fetching footsteps posts:", err);
        res.status(500).json({ error: "Server error", details: err.message });
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

export const getPostLikes = async (req, res) => {
    try {
        const postId = req.params.id;
        const currentUserId = req.id;
        
        const post = await Post.findById(postId)
            .populate({
                path: 'likes',
                select: 'username profilePicture bio followers'
            });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Add follow status for each user
        const likesWithFollowStatus = post.likes.map(user => ({
            _id: user._id,
            username: user.username,
            profilePicture: user.profilePicture,
            bio: user.bio,
            isFollowing: user.followers.includes(currentUserId)
        }));

        return res.status(200).json({
            success: true,
            likes: likesWithFollowStatus
        });
    } catch (error) {
        console.log('Error in getPostLikes:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
