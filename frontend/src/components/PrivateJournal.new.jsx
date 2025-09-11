import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
    Calendar, 
    Plus, 
    Image, 
    Search, 
    Filter, 
    MapPin, 
    Eye, 
    EyeOff, 
    Clock, 
    Tag, 
    Lock,
    Heart,
    Smile,
    BookOpen,
    Star,
    Edit3,
    Trash2,
    Download,
    Share2,
    Grid3X3,
    List,
    SortDesc,
    X,
    ImageIcon,
    MapPinIcon,
    TagIcon
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardHeader, CardFooter } from './ui/card';
import { Separator } from './ui/separator';
import { getUserInitials } from '@/lib/utils';
import { format } from 'date-fns';
import axios from 'axios';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';

const PrivateJournal = () => {
    const { user } = useSelector(store => store.auth);
    const { theme } = useTheme();
    
    // Journal state management
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Fetch journals function
    const fetchJournals = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/journal`, {
                withCredentials: true
            });
            
            if (res.data.success) {
                setJournals(res.data.journals || []);
            } else {
                setError(res.data.message || 'Failed to fetch journals');
            }
        } catch (error) {
            console.error('Error fetching journals:', error);
            setError(error.response?.data?.message || 'Failed to fetch journals');
            if (error.response?.status !== 404) {
                toast.error(error.response?.data?.message || 'Failed to fetch journals');
            }
        } finally {
            setLoading(false);
        }
    };
    
    // Load journals on component mount
    useEffect(() => {
        fetchJournals();
    }, []);
    
    const [filteredJournals, setFilteredJournals] = useState([]);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedMood, setSelectedMood] = useState('all');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('newest');
    const [creating, setCreating] = useState(false);
    const [selectedJournal, setSelectedJournal] = useState(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    
    // Form state for creating new journal
    const [newJournal, setNewJournal] = useState({
        title: '',
        content: '',
        images: [],
        location: '',
        mood: '',
        tags: [],
        isPrivate: true
    });

    // Enhanced mood configurations with better styling
    const moods = [
        { 
            value: 'excited', 
            label: 'Excited', 
            emoji: '😄', 
            color: 'from-yellow-400 to-orange-500',
            bgColor: 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30',
            textColor: 'text-yellow-700 dark:text-yellow-300'
        },
        { 
            value: 'peaceful', 
            label: 'Peaceful', 
            emoji: '😌', 
            color: 'from-blue-400 to-green-500',
            bgColor: 'bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30',
            textColor: 'text-blue-700 dark:text-blue-300'
        },
        { 
            value: 'curious', 
            label: 'Curious', 
            emoji: '🤔', 
            color: 'from-purple-400 to-pink-500',
            bgColor: 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30',
            textColor: 'text-purple-700 dark:text-purple-300'
        },
        { 
            value: 'grateful', 
            label: 'Grateful', 
            emoji: '🙏', 
            color: 'from-green-400 to-blue-500',
            bgColor: 'bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30',
            textColor: 'text-green-700 dark:text-green-300'
        },
        { 
            value: 'reflective', 
            label: 'Reflective', 
            emoji: '🤲', 
            color: 'from-indigo-400 to-purple-500',
            bgColor: 'bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30',
            textColor: 'text-indigo-700 dark:text-indigo-300'
        },
        { 
            value: 'adventurous', 
            label: 'Adventurous', 
            emoji: '🌟', 
            color: 'from-red-400 to-yellow-500',
            bgColor: 'bg-gradient-to-r from-red-100 to-yellow-100 dark:from-red-900/30 dark:to-yellow-900/30',
            textColor: 'text-red-700 dark:text-red-300'
        }
    ];

    // Get mood config by value
    const getMoodConfig = (moodValue) => {
        return moods.find(mood => mood.value === moodValue) || moods[0];
    };

    // Update filtered journals when journals or filters change
    useEffect(() => {
        setFilteredJournals(journals);
    }, [journals]);

    // Filter and sort journals
    useEffect(() => {
        let filtered = [...journals];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(journal => 
                journal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                journal.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                journal.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                journal.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Date range filter
        if (dateRange.start || dateRange.end) {
            filtered = filtered.filter(journal => {
                const journalDate = new Date(journal.createdAt);
                const startDate = dateRange.start ? new Date(dateRange.start) : null;
                const endDate = dateRange.end ? new Date(dateRange.end) : null;
                
                if (startDate && endDate) {
                    return journalDate >= startDate && journalDate <= endDate;
                } else if (startDate) {
                    return journalDate >= startDate;
                } else if (endDate) {
                    return journalDate <= endDate;
                }
                return true;
            });
        }

        // Mood filter
        if (selectedMood && selectedMood !== 'all') {
            filtered = filtered.filter(journal => journal.mood === selectedMood);
        }

        // Location filter
        if (selectedLocation) {
            filtered = filtered.filter(journal => 
                journal.location?.toLowerCase().includes(selectedLocation.toLowerCase())
            );
        }

        // Sort journals
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'mood':
                    return (a.mood || '').localeCompare(b.mood || '');
                default:
                    return 0;
            }
        });

        setFilteredJournals(filtered);
    }, [journals, searchQuery, dateRange, selectedMood, selectedLocation, sortBy]);

    const handleCreateJournal = async () => {
        if (!newJournal.title || !newJournal.content) {
            toast.error('Title and content are required');
            return;
        }

        try {
            setCreating(true);
            const formData = new FormData();
            
            formData.append('title', newJournal.title);
            formData.append('content', newJournal.content);
            formData.append('location', newJournal.location);
            formData.append('mood', newJournal.mood);
            formData.append('tags', JSON.stringify(newJournal.tags));
            formData.append('isPrivate', 'true');

            // Append images
            newJournal.images.forEach((image) => {
                if (image instanceof File) {
                    formData.append('images', image);
                }
            });

            const res = await axios.post('http://localhost:8000/api/v1/journal/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            });

            if (res.data.success) {
                setJournals([res.data.journal, ...journals]);
                setNewJournal({
                    title: '',
                    content: '',
                    images: [],
                    location: '',
                    mood: '',
                    tags: [],
                    isPrivate: true
                });
                setIsCreateDialogOpen(false);
                toast.success('Journal entry created successfully! ✨');
            }
        } catch (error) {
            console.error('Error creating journal:', error);
            toast.error(error.response?.data?.message || 'Failed to create journal entry');
        } finally {
            setCreating(false);
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + newJournal.images.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }
        setNewJournal(prev => ({
            ...prev,
            images: [...prev.images, ...files]
        }));
    };

    const removeImage = (index) => {
        setNewJournal(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleTagAdd = (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            const tag = e.target.value.trim();
            if (!newJournal.tags.includes(tag) && newJournal.tags.length < 10) {
                setNewJournal(prev => ({
                    ...prev,
                    tags: [...prev.tags, tag]
                }));
                e.target.value = '';
            } else if (newJournal.tags.length >= 10) {
                toast.error('Maximum 10 tags allowed');
            }
        }
    };

    const removeTag = (tagToRemove) => {
        setNewJournal(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const viewJournalDetail = (journal) => {
        setSelectedJournal(journal);
        setIsDetailDialogOpen(true);
    };

    const getWordCount = (text) => {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    };

    const getReadingTime = (text) => {
        const wordsPerMinute = 200;
        const words = getWordCount(text);
        return Math.ceil(words / wordsPerMinute);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-blue-950 dark:to-green-950">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <p className="text-gray-600 dark:text-gray-400">Loading your journals...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-blue-950 dark:to-green-950 transition-all duration-300">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Private Journal
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 flex items-center mt-1">
                                    <Lock className="h-4 w-4 mr-1" />
                                    Your personal space for reflection and memories
                                </p>
                            </div>
                        </div>
                        
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button 
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                    size="lg"
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    New Entry
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-900 border-0 shadow-2xl">
                                <DialogHeader className="pb-6 border-b border-gray-200 dark:border-gray-700">
                                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                                        <Edit3 className="h-6 w-6 mr-3 text-blue-600" />
                                        Create New Journal Entry
                                    </DialogTitle>
                                </DialogHeader>
                                
                                <div className="space-y-6 py-6">
                                    {/* Title Input */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Title *
                                        </label>
                                        <Input
                                            value={newJournal.title}
                                            onChange={(e) => setNewJournal(prev => ({...prev, title: e.target.value}))}
                                            placeholder="What's on your mind today?"
                                            className="text-lg font-medium border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl py-3 transition-colors"
                                        />
                                    </div>

                                    {/* Content Textarea */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Content *
                                        </label>
                                        <Textarea
                                            value={newJournal.content}
                                            onChange={(e) => setNewJournal(prev => ({...prev, content: e.target.value}))}
                                            placeholder="Write your thoughts, experiences, and reflections..."
                                            className="min-h-[200px] border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl resize-none transition-colors"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                            <span>{getWordCount(newJournal.content)} words</span>
                                            <span>~{getReadingTime(newJournal.content)} min read</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Location Input */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                                                <MapPinIcon className="h-4 w-4 mr-1" />
                                                Location
                                            </label>
                                            <Input
                                                value={newJournal.location}
                                                onChange={(e) => setNewJournal(prev => ({...prev, location: e.target.value}))}
                                                placeholder="Where are you writing from?"
                                                className="border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-colors"
                                            />
                                        </div>

                                        {/* Mood Select */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                                                <Smile className="h-4 w-4 mr-1" />
                                                Mood
                                            </label>
                                            <Select
                                                value={newJournal.mood}
                                                onValueChange={(value) => setNewJournal(prev => ({...prev, mood: value}))}
                                            >
                                                <SelectTrigger className="border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-colors">
                                                    <SelectValue placeholder="How are you feeling?" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {moods.map((mood) => (
                                                        <SelectItem key={mood.value} value={mood.value}>
                                                            <span className="flex items-center">
                                                                <span className="mr-2 text-lg">{mood.emoji}</span>
                                                                {mood.label}
                                                            </span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Tags Input */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                                            <TagIcon className="h-4 w-4 mr-1" />
                                            Tags
                                        </label>
                                        <Input
                                            onKeyPress={handleTagAdd}
                                            placeholder="Press Enter to add tags (e.g., travel, food, reflection)"
                                            className="border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-colors"
                                        />
                                        {newJournal.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {newJournal.tags.map((tag, index) => (
                                                    <Badge 
                                                        key={index} 
                                                        variant="secondary" 
                                                        className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 cursor-pointer transition-colors"
                                                        onClick={() => removeTag(tag)}
                                                    >
                                                        {tag}
                                                        <X className="h-3 w-3 ml-1" />
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Image Upload */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                                            <ImageIcon className="h-4 w-4 mr-1" />
                                            Images (Max 5)
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                id="image-upload"
                                            />
                                            <label htmlFor="image-upload" className="cursor-pointer">
                                                <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    Click to upload images or drag and drop
                                                </p>
                                            </label>
                                        </div>
                                        
                                        {newJournal.images.length > 0 && (
                                            <div className="grid grid-cols-3 gap-4 mt-4">
                                                {newJournal.images.map((image, index) => (
                                                    <div key={index} className="relative group">
                                                        <img
                                                            src={URL.createObjectURL(image)}
                                                            alt={`Upload ${index + 1}`}
                                                            className="w-full h-24 object-cover rounded-lg shadow-md"
                                                        />
                                                        <button
                                                            onClick={() => removeImage(index)}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setIsCreateDialogOpen(false)}
                                        className="px-6 py-2 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        onClick={handleCreateJournal} 
                                        disabled={creating || !newJournal.title || !newJournal.content}
                                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transition-all duration-300"
                                    >
                                        {creating ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Heart className="h-4 w-4 mr-2" />
                                                Create Entry
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm font-medium">Total Entries</p>
                                        <p className="text-2xl font-bold">{journals.length}</p>
                                    </div>
                                    <BookOpen className="h-8 w-8 text-blue-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm font-medium">This Month</p>
                                        <p className="text-2xl font-bold">
                                            {journals.filter(j => new Date(j.createdAt).getMonth() === new Date().getMonth()).length}
                                        </p>
                                    </div>
                                    <Calendar className="h-8 w-8 text-green-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100 text-sm font-medium">Total Words</p>
                                        <p className="text-2xl font-bold">
                                            {journals.reduce((total, j) => total + getWordCount(j.content), 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <Edit3 className="h-8 w-8 text-purple-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-100 text-sm font-medium">Avg. Words</p>
                                        <p className="text-2xl font-bold">
                                            {journals.length > 0 ? Math.round(journals.reduce((total, j) => total + getWordCount(j.content), 0) / journals.length) : 0}
                                        </p>
                                    </div>
                                    <Star className="h-8 w-8 text-orange-200" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters and Controls */}
                    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg mb-8">
                        <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                                    {/* Search */}
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search journals..."
                                            className="pl-10 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl"
                                        />
                                    </div>

                                    {/* Mood Filter */}
                                    <Select value={selectedMood} onValueChange={setSelectedMood}>
                                        <SelectTrigger className="w-full sm:w-[180px] border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl">
                                            <SelectValue placeholder="Filter by mood" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Moods</SelectItem>
                                            {moods.map((mood) => (
                                                <SelectItem key={mood.value} value={mood.value}>
                                                    <span className="flex items-center">
                                                        <span className="mr-2 text-lg">{mood.emoji}</span>
                                                        {mood.label}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Sort */}
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-full sm:w-[140px] border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="newest">Newest</SelectItem>
                                            <SelectItem value="oldest">Oldest</SelectItem>
                                            <SelectItem value="title">Title A-Z</SelectItem>
                                            <SelectItem value="mood">By Mood</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className="p-2"
                                    >
                                        <Grid3X3 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className="p-2"
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Date Range Filters */}
                            <div className="flex flex-col sm:flex-row gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">From</label>
                                    <Input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))}
                                        className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">To</label>
                                    <Input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))}
                                        className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Location</label>
                                    <Input
                                        value={selectedLocation}
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                        placeholder="Filter by location..."
                                        className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl"
                                    />
                                </div>
                            </div>

                            {/* Active Filters Display */}
                            {(selectedMood !== 'all' || searchQuery || dateRange.start || dateRange.end || selectedLocation) && (
                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active filters:</span>
                                    {selectedMood !== 'all' && (
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                            {getMoodConfig(selectedMood).emoji} {getMoodConfig(selectedMood).label}
                                        </Badge>
                                    )}
                                    {searchQuery && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                            Search: {searchQuery}
                                        </Badge>
                                    )}
                                    {selectedLocation && (
                                        <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                            Location: {selectedLocation}
                                        </Badge>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedMood('all');
                                            setSearchQuery('');
                                            setDateRange({ start: '', end: '' });
                                            setSelectedLocation('');
                                        }}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        Clear all
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Journal Entries */}
                {filteredJournals.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-6">
                            <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {journals.length === 0 ? 'Start Your Journey' : 'No entries found'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                            {journals.length === 0 
                                ? 'Create your first journal entry to begin documenting your thoughts and experiences.'
                                : 'Try adjusting your filters or search terms to find the entries you\'re looking for.'
                            }
                        </p>
                        {journals.length === 0 && (
                            <Button 
                                onClick={() => setIsCreateDialogOpen(true)}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Your First Entry
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className={
                        viewMode === 'grid' 
                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                            : 'space-y-6'
                    }>
                        {filteredJournals.map((journal) => (
                            <JournalCard 
                                key={journal._id} 
                                journal={journal} 
                                viewMode={viewMode}
                                onView={() => viewJournalDetail(journal)}
                                getMoodConfig={getMoodConfig}
                                getWordCount={getWordCount}
                                getReadingTime={getReadingTime}
                            />
                        ))}
                    </div>
                )}

                {/* Journal Detail Dialog */}
                <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-0 shadow-2xl">
                        {selectedJournal && (
                            <JournalDetail 
                                journal={selectedJournal} 
                                onClose={() => setIsDetailDialogOpen(false)}
                                getMoodConfig={getMoodConfig}
                                getWordCount={getWordCount}
                                getReadingTime={getReadingTime}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

// Journal Card Component
const JournalCard = ({ journal, viewMode, onView, getMoodConfig, getWordCount, getReadingTime }) => {
    const moodConfig = getMoodConfig(journal.mood);
    
    if (viewMode === 'list') {
        return (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group" onClick={onView}>
                <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                        {journal.images && journal.images.length > 0 && (
                            <div className="flex-shrink-0">
                                <img
                                    src={journal.images[0]}
                                    alt="Journal"
                                    className="w-24 h-24 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-shadow"
                                />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {journal.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <Clock className="h-4 w-4" />
                                    {format(new Date(journal.createdAt), 'MMM dd, yyyy')}
                                </div>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                                {journal.content}
                            </p>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {journal.mood && (
                                        <div className={`px-3 py-1 rounded-full ${moodConfig.bgColor} ${moodConfig.textColor} text-sm font-medium flex items-center gap-1`}>
                                            <span>{moodConfig.emoji}</span>
                                            {moodConfig.label}
                                        </div>
                                    )}
                                    {journal.location && (
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <MapPin className="h-4 w-4 mr-1" />
                                            {journal.location}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span>{getWordCount(journal.content)} words</span>
                                    <span>{getReadingTime(journal.content)} min read</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group" onClick={onView}>
            {journal.images && journal.images.length > 0 && (
                <div className="relative overflow-hidden rounded-t-xl">
                    <img
                        src={journal.images[0]}
                        alt="Journal"
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
            )}
            
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {journal.title}
                    </h3>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                    {journal.content}
                </p>
                
                <div className="space-y-3">
                    {journal.mood && (
                        <div className={`px-3 py-1 rounded-full ${moodConfig.bgColor} ${moodConfig.textColor} text-sm font-medium flex items-center gap-1 w-fit`}>
                            <span>{moodConfig.emoji}</span>
                            {moodConfig.label}
                        </div>
                    )}
                    
                    {journal.location && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="h-4 w-4 mr-1" />
                            {journal.location}
                        </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {format(new Date(journal.createdAt), 'MMM dd')}
                        </div>
                        <span>{getWordCount(journal.content)} words</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Journal Detail Component
const JournalDetail = ({ journal, onClose, getMoodConfig, getWordCount, getReadingTime }) => {
    const moodConfig = getMoodConfig(journal.mood);
    
    return (
        <div className="space-y-6">
            <DialogHeader className="pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {journal.title}
                        </DialogTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {format(new Date(journal.createdAt), 'MMMM dd, yyyy • h:mm a')}
                            </div>
                            <div>{getWordCount(journal.content)} words</div>
                            <div>{getReadingTime(journal.content)} min read</div>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </DialogHeader>

            <div className="space-y-6">
                {journal.images && journal.images.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {journal.images.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`Journal image ${index + 1}`}
                                className="w-full h-64 object-cover rounded-xl shadow-lg"
                            />
                        ))}
                    </div>
                )}

                <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {journal.content}
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    {journal.mood && (
                        <div className={`px-4 py-2 rounded-full ${moodConfig.bgColor} ${moodConfig.textColor} font-medium flex items-center gap-2`}>
                            <span className="text-lg">{moodConfig.emoji}</span>
                            {moodConfig.label}
                        </div>
                    )}
                    
                    {journal.location && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full">
                            <MapPin className="h-4 w-4 mr-2" />
                            {journal.location}
                        </div>
                    )}
                </div>

                {journal.tags && journal.tags.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                            <Tag className="h-4 w-4 mr-1" />
                            Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {journal.tags.map((tag, index) => (
                                <Badge 
                                    key={index} 
                                    variant="secondary" 
                                    className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrivateJournal;
