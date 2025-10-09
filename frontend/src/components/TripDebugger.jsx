// Debug component to check trip data
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TripDebugger = ({ tripId }) => {
    const [tripData, setTripData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTrip = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/trip/${tripId}`, {
                withCredentials: true
            });
            
            console.log('DEBUG: Full trip response:', response.data);
            console.log('DEBUG: Trip object:', response.data.trip);
            console.log('DEBUG: Itinerary exists:', !!response.data.trip?.itinerary);
            console.log('DEBUG: Itinerary length:', response.data.trip?.itinerary?.length);
            console.log('DEBUG: Itinerary data:', response.data.trip?.itinerary);
            
            setTripData(response.data.trip);
        } catch (err) {
            console.error('DEBUG: Error fetching trip:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tripId) {
            fetchTrip();
        }
    }, [tripId]);

    return (
        <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 mb-4">
            <h3 className="text-lg font-bold mb-2">Trip Debug Info</h3>
            <button 
                onClick={fetchTrip}
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={loading}
            >
                {loading ? 'Loading...' : 'Refresh Trip Data'}
            </button>
            
            {error && (
                <div className="text-red-500 mb-4">Error: {error}</div>
            )}
            
            {tripData && (
                <div className="space-y-2">
                    <p><strong>Trip ID:</strong> {tripData._id}</p>
                    <p><strong>Title:</strong> {tripData.title}</p>
                    <p><strong>Status:</strong> {tripData.status}</p>
                    <p><strong>Has Itinerary:</strong> {tripData.itinerary ? 'Yes' : 'No'}</p>
                    <p><strong>Itinerary Length:</strong> {tripData.itinerary?.length || 0}</p>
                    
                    {tripData.itinerary && tripData.itinerary.length > 0 && (
                        <div>
                            <p><strong>Itinerary Days:</strong></p>
                            <ul className="list-disc list-inside ml-4">
                                {tripData.itinerary.map((day, index) => (
                                    <li key={index}>
                                        Day {day.day}: {day.activities?.length || 0} activities
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    <details className="mt-4">
                        <summary className="cursor-pointer font-semibold">Full Trip Data (JSON)</summary>
                        <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto max-h-96">
                            {JSON.stringify(tripData, null, 2)}
                        </pre>
                    </details>
                </div>
            )}
        </div>
    );
};

export default TripDebugger;