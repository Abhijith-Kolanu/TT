import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { isMailConfigured, sendEmail } from "../utils/email.js";
import { io, getReceiverSocketId } from "../socket/socket.js";
import { Post } from "../models/post.model.js";
import { Notification } from "../models/notification.model.js";
import { Comment } from "../models/comment.model.js";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import Journal from "../models/journal.model.js";
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const normalizedEmail = email?.toLowerCase().trim();
        if (!username || !email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(401).json({
                message: "Try different email",
                success: false,
            });
        };
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            email: normalizedEmail,
            password: hashedPassword
        });

        try {
            await sendEmail({
                to: normalizedEmail,
                subject: "Welcome to TrekTales!",
                text: `Hi ${username}, welcome to TrekTales. Your account has been created successfully.`,
                html: `<p>Hi <strong>${username}</strong>,</p><p>Welcome to <strong>TrekTales</strong>! Your account has been created successfully.</p>`,
            });
        } catch (mailError) {
            console.log("Signup email failed:", mailError.message);
        }

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
        const normalizedEmail = email?.toLowerCase().trim();
        if (!email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        let user = await User.findOne({ email: normalizedEmail });
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

        try {
            await sendEmail({
                to: normalizedEmail,
                subject: "New sign-in to your TrekTales account",
                text: `Hi ${user.username}, we detected a sign-in to your TrekTales account. If this wasn't you, please reset your password immediately.`,
                html: `<p>Hi <strong>${user.username}</strong>,</p><p>We detected a sign-in to your TrekTales account.</p><p>If this wasn’t you, please reset your password immediately.</p>`,
            });
        } catch (mailError) {
            console.log("Signin alert email failed:", mailError.message);
        }

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

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required",
                success: false,
            });
        }

        if (!isMailConfigured()) {
            return res.status(503).json({
                message: "Password reset email service is not configured.",
                success: false,
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (user) {
            const resetToken = crypto.randomBytes(32).toString("hex");
            const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

            user.resetPasswordToken = hashedResetToken;
            user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
            await user.save();

            const frontendUrl = req.get("origin") || process.env.FRONTEND_URL || process.env.URL || "http://localhost:5173";
            const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

            try {
                const mailResult = await sendEmail({
                    to: user.email,
                    subject: "Reset your TrekTales password",
                    text: `We received a request to reset your TrekTales password. Use this link within 15 minutes: ${resetUrl}`,
                    html: `<p>We received a request to reset your TrekTales password.</p><p><a href="${resetUrl}">Click here to reset your password</a> (valid for 15 minutes).</p>`,
                });

                if (!mailResult?.success) {
                    user.resetPasswordToken = null;
                    user.resetPasswordExpires = null;
                    await user.save();

                    return res.status(503).json({
                        message: "Password reset email service is unavailable. Please try again later.",
                        success: false,
                    });
                }
            } catch (mailError) {
                console.log("Reset password email failed:", mailError.message);
                user.resetPasswordToken = null;
                user.resetPasswordExpires = null;
                await user.save();

                return res.status(500).json({
                    message: "Unable to send reset email right now. Please try again later.",
                    success: false,
                });
            }
        }

        return res.status(200).json({
            message: "If an account exists with this email, a reset link has been generated.",
            success: true,
        });
    } catch (error) {
        console.log("Error in forgotPassword:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                message: "Token and new password are required",
                success: false,
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters",
                success: false,
            });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired reset link",
                success: false,
            });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        return res.status(200).json({
            message: "Password reset successful. Please sign in.",
            success: true,
        });
    } catch (error) {
        console.log("Error in resetPassword:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
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
        const userId = req.user._id; // from authentication middleware
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
        const userId = req.user._id;
        const { bio, gender, username } = req.body;
        const profilePicture = req.file;
        
        // Start user fetch and username check in parallel with image upload
        const userPromise = User.findById(userId).select('-password');
        
        // Check username availability in parallel if username is provided
        const usernameCheckPromise = username ? 
            User.findOne({ username: username.toLowerCase(), _id: { $ne: userId } }) : 
            Promise.resolve(null);
        
        // Upload image with optimization settings if provided
        let cloudResponse = null;
        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri, {
                folder: 'profile_pictures',
                transformation: [
                    { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                    { quality: 'auto:good' },
                    { fetch_format: 'auto' }
                ],
                resource_type: 'image'
            });
        }

        // Wait for user and username check
        const [user, existingUser] = await Promise.all([userPromise, usernameCheckPromise]);
        
        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
                success: false
            });
        }
        
        // Check if username is being changed and if it's already taken
        if (username && username !== user.username) {
            if (existingUser) {
                return res.status(400).json({
                    message: 'Username is already taken.',
                    success: false
                });
            }
            user.username = username;
        }
        
        if (bio !== undefined) user.bio = bio;
        if (gender && gender !== 'undefined') user.gender = gender;
        if (cloudResponse) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            message: 'Profile updated.',
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Failed to update profile.',
            success: false
        });
    }
};

export const removeProfilePicture = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
                success: false
            });
        }
        
        // Remove the profile picture URL
        user.profilePicture = '';
        await user.save();

        return res.status(200).json({
            message: 'Profile picture removed.',
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Server error',
            success: false
        });
    }
};

export const getSuggestedUsers = async (req, res) => {
    try {
        // Get current user to check deletedChats
        const currentUser = await User.findById(req.user._id);
        const deletedChatIds = currentUser?.deletedChats || [];
        
        // Exclude current user and users with deleted chats
        const suggestedUsers = await User.find({ 
            _id: { 
                $ne: req.user._id,
                $nin: deletedChatIds 
            } 
        }).select("-password");
        
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
        const followKrneWala = req.user._id;
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

export const deleteAccount = async (req, res) => {
    try {
        const userId = req.user._id;
        const { password } = req.body;

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        // Verify password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Incorrect password",
                success: false
            });
        }

        // Delete user's posts and their comments
        const userPosts = await Post.find({ author: userId });
        for (const post of userPosts) {
            // Delete comments on this post
            await Comment.deleteMany({ post: post._id });
            // Delete the post
            await Post.findByIdAndDelete(post._id);
        }

        // Delete user's comments on other posts
        await Comment.deleteMany({ author: userId });

        // Delete user's journals
        await Journal.deleteMany({ user: userId });

        // Delete user's notifications (sent and received)
        await Notification.deleteMany({
            $or: [{ senderId: userId }, { recipientId: userId }]
        });

        // Delete conversations and messages
        const conversations = await Conversation.find({ participants: userId });
        for (const conv of conversations) {
            await Message.deleteMany({ _id: { $in: conv.messages } });
            await Conversation.findByIdAndDelete(conv._id);
        }

        // Remove user from other users' followers/following lists
        await User.updateMany(
            { followers: userId },
            { $pull: { followers: userId } }
        );
        await User.updateMany(
            { following: userId },
            { $pull: { following: userId } }
        );

        // Remove user from other users' deletedChats
        await User.updateMany(
            { deletedChats: userId },
            { $pull: { deletedChats: userId } }
        );

        // Remove user's likes from all posts
        await Post.updateMany(
            { likes: userId },
            { $pull: { likes: userId } }
        );

        // Delete the user
        await User.findByIdAndDelete(userId);

        // Clear cookie
        return res.cookie('token', '', { maxAge: 0 }).json({
            message: "Account deleted successfully",
            success: true
        });

    } catch (error) {
        console.log("Error in deleteAccount:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
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