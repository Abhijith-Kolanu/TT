import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, X, User, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getUserInitials } from '@/lib/utils';

const SearchComponent = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        // Handle click outside to close dropdown
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // Use a timeout to "debounce" the search, preventing API calls on every keystroke
        const timerId = setTimeout(() => {
            if (query.trim()) {
                setIsLoading(true);
                const fetchResults = async () => {
                    try {
                        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/user/search/${query}`, { withCredentials: true });
                        setResults(res.data);
                        setIsOpen(true);
                    } catch (error) {
                        console.log("Search error:", error);
                        setResults([]);
                    } finally {
                        setIsLoading(false);
                    }
                };
                fetchResults();
            } else {
                setResults([]);
                setIsOpen(false);
                setIsLoading(false);
            }
        }, 300); // Wait 300ms after user stops typing

        // Cleanup function to clear the timer
        return () => {
            clearTimeout(timerId);
        };
    }, [query]);

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const handleResultClick = () => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
    };

    return (
        <div className="relative flex-1" ref={searchRef}>
            {/* Search Input */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search users..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        if (results.length > 0) setIsOpen(true);
                    }}
                    className="w-full pl-10 pr-10 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {(query || isLoading) && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                        ) : (
                            <button
                                onClick={clearSearch}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Search Results Dropdown */}
            {isOpen && (results.length > 0 || (query && !isLoading)) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {results.length > 0 ? (
                        <>
                            <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
                                Users
                            </div>
                            {results.map((user) => (
                                <Link
                                    to={`/profile/${user._id}`}
                                    key={user._id}
                                    className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                    onClick={handleResultClick}
                                >
                                    <Avatar className="h-10 w-10 mr-3">
                                        <AvatarImage src={user.profilePicture} alt={user.username} />
                                        <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold">
                                            {getUserInitials(user.username)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {user.username}
                                        </p>
                                        {user.bio && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {user.bio}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </>
                    ) : (
                        <div className="p-4 text-center">
                            <User className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                No users found for "{query}"
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchComponent;