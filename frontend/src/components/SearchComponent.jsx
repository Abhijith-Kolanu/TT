import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const SearchComponent = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    useEffect(() => {
        // Use a timeout to "debounce" the search, preventing API calls on every keystroke
        const timerId = setTimeout(() => {
            if (query) {
                const fetchResults = async () => {
                    try {
                        const res = await axios.get(`http://localhost:8000/api/v1/user/search/${query}`, { withCredentials: true });
                        setResults(res.data);
                    } catch (error) {
                        console.log("Search error:", error);
                        setResults([]);
                    }
                };
                fetchResults();
            } else {
                setResults([]); // Clear results when query is empty
            }
        }, 300); // Wait 300ms after user stops typing

        // Cleanup function to clear the timer
        return () => {
            clearTimeout(timerId);
        };
    }, [query]);

    return (
        <div className="relative">
            <input
                type="text"
                placeholder="Search users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full p-2 border rounded"
            />
            {results.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white border mt-1 rounded shadow-lg z-10">
                    {results.map((user) => (
                        <Link to={`/profile/${user._id}`} key={user._id} className="flex items-center p-2 hover:bg-gray-100" onClick={() => setQuery('')}>
                            <img src={user.profilePicture} alt={user.username} className="w-8 h-8 rounded-full mr-2" />
                            <span>{user.username}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchComponent;