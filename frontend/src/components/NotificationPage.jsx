import React from 'react';
import { useSelector } from 'react-redux';

const NotificationPage = () => {
    const { likeNotifications } = useSelector((store) => store.rtn);

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Notifications</h1>
            {likeNotifications?.length === 0 ? (
                <p>No notifications yet.</p>
            ) : (
                <ul className="space-y-2">
                    {likeNotifications.map((note, index) => (
                        <li key={index} className="bg-gray-100 p-2 rounded">
                            {note.message || 'Someone liked your post.'}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default NotificationPage;
