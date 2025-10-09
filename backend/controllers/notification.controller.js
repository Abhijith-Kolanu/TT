import { Notification } from "../models/notification.model.js";

export const getAllNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const notifications = await Notification.find({ recipient: userId })
            .populate('sender', 'username profilePicture')
            .populate('post', 'caption')
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 notifications
        
        return res.status(200).json({
            success: true,
            notifications
        });
    } catch (error) {
        console.log("Error in getAllNotifications:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const markNotificationAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        const notificationId = req.params.id;
        
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: userId },
            { read: true },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }
        
        return res.status(200).json({
            success: true,
            message: "Notification marked as read"
        });
    } catch (error) {
        console.log("Error in markNotificationAsRead:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        
        await Notification.updateMany(
            { recipient: userId, read: false },
            { read: true }
        );
        
        return res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });
    } catch (error) {
        console.log("Error in markAllNotificationsAsRead:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
