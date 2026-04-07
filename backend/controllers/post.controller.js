import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import User from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { Notification } from "../models/notification.model.js";

export const addNewPost = async (req, res) => {
    try {
        const { caption, coordinates, locationName } = req.body;
        const mediaFiles = Array.isArray(req.files)
            ? req.files
            : [...(req.files?.media || []), ...(req.files?.image || [])];
        const authorId = req.user._id;

        if (!mediaFiles.length) return res.status(400).json({ message: 'Image or video required' });
        if (mediaFiles.length > 10) {
            return res.status(400).json({ message: 'Maximum 10 files allowed per post creation.' });
        }

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
                locationData = null;
            }
        }

        const uploadedMedias = [];

        for (const file of mediaFiles) {
            const maxFileSize = 50 * 1024 * 1024;
            if (file.size > maxFileSize) {
                return res.status(400).json({ message: 'File size too large. Maximum 50MB allowed.' });
            }

            const isVideo = file.mimetype.startsWith('video/');
            const isImage = file.mimetype.startsWith('image/');

            if (!isVideo && !isImage) {
                return res.status(400).json({ message: 'Only image and video files are allowed' });
            }

            if (isImage) {
                const optimizedImageBuffer = await sharp(file.buffer)
                    .resize({ width: 800, height: 800, fit: 'inside' })
                    .toFormat('jpeg', { quality: 80 })
                    .toBuffer();

                const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
                const cloudResponse = await cloudinary.uploader.upload(fileUri);
                uploadedMedias.push({ url: cloudResponse.secure_url, mediaType: 'image' });
            } else {
                const fileUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
                const cloudResponse = await cloudinary.uploader.upload(fileUri, {
                    resource_type: 'video',
                    folder: 'travel_app/videos',
                    timeout: 600000
                });
                const playableVideoUrl = cloudinary.url(cloudResponse.public_id, {
                    resource_type: 'video',
                    secure: true,
                    format: 'mp4'
                });
                uploadedMedias.push({
                    url: playableVideoUrl || cloudResponse.secure_url,
                    mediaType: 'video'
                });
            }
        }

        const firstMedia = uploadedMedias[0];
        const postData = {
            caption,
            author: authorId,
            medias: uploadedMedias,
            mediaType: firstMedia?.mediaType || 'image',
            image: firstMedia?.mediaType === 'image' ? firstMedia.url : null,
            video: firstMedia?.mediaType === 'video' ? firstMedia.url : null,
        };

        if (locationData) {
            postData.location = locationData;
        }

        const post = await Post.create(postData);
        await post.populate({ path: 'author', select: '-password' });

        await User.findByIdAndUpdate(authorId, {
            $push: { posts: post._id }
        });

        return res.status(201).json({
            message: 'New post added',
            post,
            success: true,
        });
    } catch (error) {
        console.error("Error in addNewPost:", error.message);
        return res.status(500).json({ 
            message: "Internal server error", 
            success: false 
        });
    }
};


export const getAllPost = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const loggedInUser = await User.findById(loggedInUserId);

        const populateOptions = [
            { path: 'author', select: 'username profilePicture' },
            {
                path: 'comments',
                options: { sort: { createdAt: -1 } },
                populate: { path: 'author', select: 'username profilePicture' }
            }
        ];

        // Posts from followed users first
        const followingIds = loggedInUser?.following || [];
        const followedPosts = await Post.find({ author: { $in: followingIds } })
            .sort({ createdAt: -1 })
            .populate(populateOptions[0])
            .populate(populateOptions[1]);

        // Discover: posts NOT from followed users and NOT own posts
        const discoverPosts = await Post.find({ author: { $nin: [...followingIds, loggedInUserId] } })
            .sort({ createdAt: -1 })
            .populate(populateOptions[0])
            .populate(populateOptions[1]);

        const posts = [...followedPosts, ...discoverPosts];

        return res.status(200).json({
            posts,
            followingEndIndex: followedPosts.length,
            success: true
        });
    } catch (error) {
        console.log("Error in getAllPost:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const getExplorePosts = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
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
        const authorId = req.user._id;
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
    const userId = req.user?._id; // the user who liked
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
    const likeKrneWalaUserKiId = req.user?._id;
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
        const commentKrneWalaUserKiId = req.user._id;
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
        const userId = req.user._id;

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

export const editPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.user._id;
        const { caption } = req.body;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });
        if (post.author.toString() !== authorId.toString())
            return res.status(403).json({ message: 'Unauthorized', success: false });

        post.caption = caption ?? post.caption;
        await post.save();
        await post.populate({ path: 'author', select: '-password' });

        return res.status(200).json({ success: true, message: 'Post updated', post });
    } catch (error) {
        console.log("Error in editPost:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.user._id;
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
        const authorId = req.user._id;
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
        const userId = req.user._id; // from authentication middleware

        const currentUser = await User.findById(userId).select('following');
        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const baseQuery = {
            "location.coordinates": {
                $exists: true,
                $type: "array",
                $size: 2
            }
        };

        const followingIds = currentUser.following || [];
        const authorAllowList = Array.from(
            new Set([...followingIds.map((id) => String(id)), String(userId)])
        );

        let filter = { ...baseQuery };
        if (mode === 'private') {
            filter.author = userId;
        } else {
            filter.author = { $in: authorAllowList };
        }

        let posts = await Post.find(filter)
            .populate({ path: 'author', select: 'username profilePicture' })
            .select("caption image video medias mediaType location author createdAt")
            .sort({ createdAt: -1 });

        // Hard safeguard: if public mode misses own posts for any reason, append them.
        if (mode !== 'private') {
            const hasOwnPost = posts.some((post) => String(post.author?._id || post.author) === String(userId));
            if (!hasOwnPost) {
                const ownPosts = await Post.find({ ...baseQuery, author: userId })
                    .populate({ path: 'author', select: 'username profilePicture' })
                    .select("caption image video medias mediaType location author createdAt")
                    .sort({ createdAt: -1 });

                if (ownPosts.length > 0) {
                    const merged = new Map();
                    [...ownPosts, ...posts].forEach((post) => merged.set(String(post._id), post));
                    posts = Array.from(merged.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                }
            }
        }

        const formatted = posts
            .filter((post) => {
                const coords = post?.location?.coordinates;
                return (
                    Array.isArray(coords) &&
                    coords.length === 2 &&
                    Number.isFinite(coords[0]) &&
                    Number.isFinite(coords[1])
                );
            })
            .map(post => ({
            _id: post._id,
            caption: post.caption,
            imageUrl: post.image
                ? (post.image.startsWith("http") ? post.image : `${process.env.BASE_URL || ""}/${post.image}`)
                : (post.video || post.medias?.[0]?.url || null),
            videoUrl: post.video || null,
            mediaType: post.mediaType || (post.video ? 'video' : 'image'),
            medias: post.medias || [],
            coordinates: post.location.coordinates, // [lon, lat]
            locationName: post.location.name || null,
            author: post.author,
            createdAt: post.createdAt
        }));

        res.status(200).json({ 
            posts: formatted,
            mode: mode || 'public',
            totalPosts: formatted.length
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
        const currentUserId = req.user._id;
        
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
