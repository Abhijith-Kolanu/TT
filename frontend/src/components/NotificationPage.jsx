import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { clearNotifications } from '../redux/notificationSlice';

const NotificationPage = () => {
    const dispatch = useDispatch();
    const notifications = useSelector(state => state.notification.notifications);

    const likeNotifications = notifications.filter(n => n.type === "like");

    const handleClear = () => {
        dispatch(clearNotifications());
    };

    return (
        <div className="p-6 max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Notifications</h2>
                {likeNotifications.length > 0 && (
                    <button
                        onClick={handleClear}
                        className="text-sm text-red-500 hover:underline"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {likeNotifications.length === 0 ? (
                <div className="text-center text-gray-500">
                    No like notifications.
                </div>
            ) : (
                <div className="space-y-4">
                    {likeNotifications.map(notification => (
                        <Link
                            to={`/post/${notification.post}`}
                            key={notification._id}
                            className="flex items-center gap-4 p-3 border rounded hover:bg-gray-50 transition"
                        >
                            <img
                                src={notification.sender.profilePicture}
                                alt={notification.sender.username}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                                <p className="text-sm">
                                    <span className="font-semibold">{notification.sender.username}</span> liked your post.
                                </p>
                                <p className="text-xs text-gray-400">
                                    {new Date(notification.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationPage;
