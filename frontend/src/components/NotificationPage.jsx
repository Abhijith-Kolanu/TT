import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { markAllNotificationsAsRead, markNotificationAsRead } from '../redux/notificationSlice';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getUserInitials } from '@/lib/utils';
import useGetAllNotifications from '@/hooks/useGetAllNotifications';
import axios from 'axios';

const NotificationPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { notifications, unreadCount } = useSelector((state) => state.notification);
    
    // Fetch all notifications when component mounts
    useGetAllNotifications();

    // Mark all notifications as read when page opens
    useEffect(() => {
        if (unreadCount > 0) {
            handleMarkAllAsRead();
        }
    }, []);

    const handleMarkAllAsRead = async () => {
        try {
            const res = await axios.post('http://localhost:8000/api/v1/notification/read-all', {}, {
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(markAllNotificationsAsRead());
            }
        } catch (error) {
            console.log('Error marking all notifications as read:', error);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification._id) return;
        
        try {
            // Mark notification as read
            const res = await axios.post(`http://localhost:8000/api/v1/notification/read/${notification._id}`, {}, {
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(markNotificationAsRead(notification._id));
            }
        } catch (error) {
            console.log('Error marking notification as read:', error);
        }

        // Navigate based on notification type
        if (notification.type === 'like' || notification.type === 'comment') {
            // Navigate to the post if post exists
            if (notification.post?._id) {
                navigate(`/post/${notification.post._id}`);
            }
        } else if (notification.type === 'follow') {
            // Navigate to the sender's profile
            if (notification.sender?._id) {
                navigate(`/profile/${notification.sender._id}`);
            }
        }
    };

    const sortedNotifications = [...notifications].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );


    return (
        <div className="p-6 max-w-2xl mx-auto bg-white dark:bg-gray-900 min-h-screen transition-colors duration-200">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Notifications {unreadCount > 0 && <span className="text-blue-500">({unreadCount} new)</span>}
                </h1>
                {notifications.length > 0 && (
                    <button
                        className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={handleMarkAllAsRead}
                    >
                        Mark All Read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center">No notifications yet.</p>
            ) : (
                <ul className="space-y-4">
                    {sortedNotifications.map((notif, index) => {
                        const sender = notif.sender;
                        const senderId = sender?._id || `unknown-${index}`;
                        const avatarUrl = sender?.profilePicture || '';
                        const username = sender?.username || 'Unknown User';
                        const createdAt = notif.createdAt || new Date().toISOString();
                        const type = notif.type || 'like';
                        const isUnread = !notif.read;
                        
                        let message = '';
                        let icon = '';
                        let actionText = '';
                        if (type === 'like') {
                            message = 'liked your post';
                            icon = '❤️';
                            actionText = 'View post';
                        } else if (type === 'follow') {
                            message = 'started following you';
                            icon = '👤';
                            actionText = 'View profile';
                        } else if (type === 'comment') {
                            message = 'commented on your post';
                            icon = '💬';
                            actionText = 'View post';
                        } else {
                            message = 'did something';
                            icon = '🔔';
                            actionText = 'View';
                        }

                        return (
                            <li
                                key={notif._id || index}
                                onClick={() => handleNotificationClick(notif)}
                                className={`flex items-center justify-between p-3 shadow rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border cursor-pointer transform hover:scale-[1.01] hover:shadow-md ${
                                    isUnread 
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                }`}
                            >
                                <div className="flex items-center space-x-3 flex-1">
                                    <Avatar>
                                        <AvatarImage src={avatarUrl} />
                                        <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold">
                                            {getUserInitials(username)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            <span className="mr-1">{icon}</span>
                                            <span className="font-semibold hover:underline cursor-pointer">
                                                {username}
                                            </span>{' '}
                                            {message}
                                            {isUnread && <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block"></span>}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatDistanceToNow(new Date(createdAt))} ago
                                            </p>
                                            <span className="text-xs text-blue-500 hover:text-blue-600 font-medium">
                                                {actionText} →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default NotificationPage;
