import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearNotifications } from '../redux/notificationSlice';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const NotificationPage = () => {
    const dispatch = useDispatch();
    const notifications = useSelector((state) => state.notification.notifications);

    const handleClear = () => {
        dispatch(clearNotifications());
    };

    const sortedNotifications = [...notifications].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );


    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Notifications</h1>
                {notifications.length > 0 && (
                    <button
                        className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
                        onClick={handleClear}
                    >
                        Clear All
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <p className="text-gray-500 text-center">No notifications yet.</p>
            ) : (
                <ul className="space-y-4">
                    {sortedNotifications.map((notif, index) => {
                        const sender = notif.sender;
                        const senderId = sender?._id || `unknown-${index}`;
                        const avatarUrl = sender?.profilePicture || '';
                        const username = sender?.username || 'Unknown User';
                        const createdAt = notif.createdAt || new Date().toISOString();
                        const type = notif.type || 'like';
                        console.log("Sender:", sender);
                        let message = '';
                        let icon = '';
                        if (type === 'like') {
                            message = 'liked your post';
                            icon = '❤️';
                        } else if (type === 'follow') {
                            message = 'started following you';
                            icon = '👤';
                        } else if (type === 'comment') {
                            message = 'commented on your post';
                            icon = '💬';
                        } else {
                            message = 'did something';
                            icon = '🔔';
                        }

                        return (
                            <li
                                key={notif._id || index}
                                className="flex items-center justify-between p-3 bg-white shadow rounded-md hover:bg-gray-50 transition"
                            >
                                <div className="flex items-center space-x-3">
                                    <Avatar>
                                        <AvatarImage src={avatarUrl} />
                                        <AvatarFallback>{username[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm">
                                            <span className="mr-1">{icon}</span>
                                            <span className="font-semibold hover:underline cursor-pointer">
                                                {username}
                                            </span>{' '}
                                            {message}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(createdAt))} ago
                                        </p>
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
