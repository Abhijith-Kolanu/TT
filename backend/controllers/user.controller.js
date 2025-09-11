import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { io, getReceiverSocketId } from "../socket/socket.js";
import { Post } from "../models/post.model.js";
import { Notification } from "../models/notification.model.js";
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(401).json({
                message: "Try different email",
                success: false,
            });
        };
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        });

        // Automatically log in the user after successful registration
        const token = await jwt.sign({ userId: newUser._id }, process.env.SECRET_KEY, { expiresIn: '1d' });

        // Prepare user data (same format as login)
        const user = {
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            profilePicture: newUser.profilePicture,
            bio: newUser.bio,
            followers: newUser.followers,
            following: newUser.following,
            posts: newUser.posts,
            bookmarks: newUser.bookmarks
        };

        return res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 1 * 24 * 60 * 60 * 1000 }).json({
            message: `Welcome to TrekTales, ${user.username}!`,
            success: true,
            user
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
}
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        };

        const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });

        // populate each post if in the posts array
        const populatedPosts = await Promise.all(
            user.posts.map(async (postId) => {
                const post = await Post.findById(postId);
                if (post.author.equals(user._id)) {
                    return post;
                }
                return null;
            })
        )
        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: populatedPosts,
            bookmarks: user.bookmarks
        }
        return res.cookie('token', token, {
            httpOnly: true,
            secure: true, // required for HTTPS
            sameSite: 'none', // required for cross-site cookies
            maxAge: 1 * 24 * 60 * 60 * 1000
        }).json({
            message: `Welcome back ${user.username}`,
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
    }
};
export const logout = async (_, res) => {
    try {
        return res.cookie("token", "", { maxAge: 0 }).json({
            message: 'Logged out successfully.',
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};
export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        let user = await User.findById(userId).populate({ path: 'posts', createdAt: -1 }).populate('bookmarks');
        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.id; // from authentication middleware
        const user = await User.findById(userId).select("-password");
        
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }
        
        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Server error',
            success: false
        });
    }
};

export const editProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { bio, gender } = req.body;
        const profilePicture = req.file;
        let cloudResponse;

        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
                success: false
            });
        };
        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (profilePicture) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            message: 'Profile updated.',
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
    }
};
export const getSuggestedUsers = async (req, res) => {
    try {
        const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password");
        if (!suggestedUsers) {
            return res.status(400).json({
                message: 'Currently do not have any users',
            })
        };
        return res.status(200).json({
            success: true,
            users: suggestedUsers
        })
    } catch (error) {
        console.log(error);
    }
};

// make sure these are correctly imported

export const followOrUnfollow = async (req, res) => {
    try {
        const followKrneWala = req.id;
        const jiskoFollowKrunga = req.params.id;

        if (followKrneWala === jiskoFollowKrunga) {
            return res.status(400).json({ message: 'You cannot follow/unfollow yourself', success: false });
        }

        const user = await User.findById(followKrneWala);
        const targetUser = await User.findById(jiskoFollowKrunga);

        if (!user || !targetUser) {
            return res.status(400).json({ message: 'User not found', success: false });
        }

        const isFollowing = user.following.includes(jiskoFollowKrunga);

        if (isFollowing) {
            await Promise.all([
                User.updateOne({ _id: followKrneWala }, { $pull: { following: jiskoFollowKrunga } }),
                User.updateOne({ _id: jiskoFollowKrunga }, { $pull: { followers: followKrneWala } }),
            ]);
            return res.status(200).json({ message: 'Unfollowed successfully', success: true });
        } else {
            await Promise.all([
                User.updateOne({ _id: followKrneWala }, { $push: { following: jiskoFollowKrunga } }),
                User.updateOne({ _id: jiskoFollowKrunga }, { $push: { followers: followKrneWala } }),
            ]);

            // ✅ Create notification in DB
            const notification = await Notification.create({
                sender: followKrneWala,
                recipient: jiskoFollowKrunga,
                type: "follow"
            });

            // ✅ Get sender info
            const senderUser = await User.findById(followKrneWala).select("username profilePicture");

            const unifiedNotification = {
                _id: notification._id,
                type: "follow",
                message: `${senderUser.username} started following you`,
                sender: {
                    _id: senderUser._id,
                    username: senderUser.username,
                    profilePicture: senderUser.profilePicture || ""
                },
                recipientId: jiskoFollowKrunga,
                read: false,
                createdAt: notification.createdAt
            };

            // ✅ Emit to socket if recipient is online
            const receiverSocketId = getReceiverSocketId(jiskoFollowKrunga);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newNotification", unifiedNotification);
            }

            return res.status(200).json({ message: 'Followed successfully', success: true });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong", success: false });
    }
};


export const searchUsers = async (req, res) => {
    try {
        const { query } = req.params;
        if (!query) {
            return res.status(200).json([]); // Return empty if query is empty
        }

        // Use a case-insensitive regular expression to find users
        const users = await User.find({
            username: { $regex: `^${query}`, $options: 'i' }
        }).select("username profilePicture"); // Only send necessary data

        return res.status(200).json(users);

    } catch (error) {
        console.log("Error in searchUsers:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getFollowersFollowing = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const user = await User.findById(userId)
            .populate({
                path: 'followers',
                select: 'username profilePicture bio'
            })
            .populate({
                path: 'following',
                select: 'username profilePicture bio'
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            followers: user.followers,
            following: user.following
        });
    } catch (error) {
        console.log("Error in getFollowersFollowing:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};