import React, { useState, useRef, useCallback, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
    Book, 
    ChevronLeft, 
    ChevronRight, 
    Plus,
    Save,
    Download,
    Upload,
    Image as ImageIcon,
    Sticker,
    Type,
    Palette,
    RotateCcw,
    Trash2,
    Move,
    Star,
    Heart,
    Camera,
    MapPin,
    Plane,
    Sun,
    Moon,
    Sparkles,
    Coffee,
    Mountain,
    RotateCw
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'sonner';

// Available stickers/icons
const availableStickers = [
    { id: 1, icon: Star, name: 'Star', color: '#FFD700' },
    { id: 2, icon: Heart, name: 'Heart', color: '#FF69B4' },
    { id: 3, icon: Camera, name: 'Camera', color: '#4A90E2' },
    { id: 4, icon: MapPin, name: 'Location', color: '#FF6B6B' },
    { id: 5, icon: Plane, name: 'Plane', color: '#4ECDC4' },
    { id: 6, icon: Sun, name: 'Sun', color: '#FFA500' },
    { id: 7, icon: Moon, name: 'Moon', color: '#4B0082' },
    { id: 8, icon: Sparkles, name: 'Sparkles', color: '#9370DB' },
    { id: 9, icon: Coffee, name: 'Coffee', color: '#8B4513' },
    { id: 10, icon: Mountain, name: 'Mountain', color: '#228B22' }
];

// Pre-made templates
const templates = [
    {
        id: 1,
        name: 'Travel Memory',
        background: 'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20',
        elements: [
            { type: 'text', content: 'My Adventure', x: 50, y: 20, fontSize: '2xl', color: '#4A5568' },
            { type: 'sticker', stickerId: 5, x: 20, y: 60, size: 32 },
            { type: 'sticker', stickerId: 4, x: 80, y: 60, size: 32 }
        ]
    },
    {
        id: 2,
        name: 'Romantic Getaway',
        background: 'bg-gradient-to-br from-pink-100 to-red-100 dark:from-pink-900/20 dark:to-red-900/20',
        elements: [
            { type: 'text', content: '❤️ Love Story', x: 50, y: 20, fontSize: 'xl', color: '#E53E3E' },
            { type: 'sticker', stickerId: 2, x: 30, y: 50, size: 28 },
            { type: 'sticker', stickerId: 2, x: 70, y: 50, size: 28 }
        ]
    },
    {
        id: 3,
        name: 'Nature Explorer',
        background: 'bg-gradient-to-br from-green-100 to-yellow-100 dark:from-green-900/20 dark:to-yellow-900/20',
        elements: [
            { type: 'text', content: 'Into the Wild', x: 50, y: 20, fontSize: 'xl', color: '#2D5F3F' },
            { type: 'sticker', stickerId: 10, x: 40, y: 50, size: 36 },
            { type: 'sticker', stickerId: 6, x: 20, y: 30, size: 24 }
        ]
    },
    {
        id: 4,
        name: 'City Adventure',
        background: 'bg-gradient-to-br from-gray-100 to-slate-200 dark:from-gray-800/20 dark:to-slate-900/20',
        elements: [
            { type: 'text', content: 'Urban Explorer', x: 50, y: 20, fontSize: 'xl', color: '#1A202C' },
            { type: 'sticker', stickerId: 3, x: 30, y: 60, size: 32 },
            { type: 'sticker', stickerId: 8, x: 70, y: 40, size: 28 }
        ]
    },
    {
        id: 5,
        name: 'Beach Vibes',
        background: 'bg-gradient-to-br from-cyan-100 to-blue-200 dark:from-cyan-900/20 dark:to-blue-900/20',
        elements: [
            { type: 'text', content: '🏖️ Beach Days', x: 50, y: 20, fontSize: 'xl', color: '#0987A0' },
            { type: 'sticker', stickerId: 6, x: 25, y: 50, size: 40 },
            { type: 'sticker', stickerId: 1, x: 75, y: 65, size: 24 }
        ]
    },
    {
        id: 6,
        name: 'Mountain High',
        background: 'bg-gradient-to-br from-emerald-100 to-teal-200 dark:from-emerald-900/20 dark:to-teal-900/20',
        elements: [
            { type: 'text', content: '⛰️ Peak Moments', x: 50, y: 20, fontSize: 'xl', color: '#047857' },
            { type: 'sticker', stickerId: 10, x: 50, y: 50, size: 48 },
            { type: 'sticker', stickerId: 1, x: 20, y: 30, size: 20 },
            { type: 'sticker', stickerId: 1, x: 80, y: 35, size: 20 }
        ]
    }
];

// Enhanced Sticker Component with Drag and Drop
const StickerButton = ({ sticker, onAddToPage }) => {
    const Icon = sticker.icon;

    const handleDragStart = (e) => {
        e.dataTransfer.setData('application/json', JSON.stringify({
            type: 'sticker',
            stickerId: sticker.id,
            size: 32
        }));
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleClick = () => {
        onAddToPage({
            type: 'sticker',
            stickerId: sticker.id,
            x: Math.random() * 70 + 15,
            y: Math.random() * 70 + 15,
            size: 32
        });
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            onClick={handleClick}
            className="p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-grab active:cursor-grabbing hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 hover:shadow-lg hover:scale-105"
            title={`Drag or click to add ${sticker.name}`}
        >
            <Icon size={24} color={sticker.color} />
        </div>
    );
};

// Enhanced Photo Component with Drag and Drop
const PhotoButton = ({ photo, onAddToPage }) => {
    const handleDragStart = (e) => {
        e.dataTransfer.setData('application/json', JSON.stringify({
            type: 'photo',
            src: photo.src,
            width: 150,
            height: 150
        }));
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleClick = () => {
        onAddToPage({
            type: 'photo',
            src: photo.src,
            x: Math.random() * 60 + 20,
            y: Math.random() * 60 + 20,
            width: 150,
            height: 150
        });
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            onClick={handleClick}
            className="relative w-20 h-20 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-200 hover:scale-105"
            title={`Drag or click to add ${photo.name}`}
        >
            <img 
                src={photo.src} 
                alt={photo.name}
                className="w-full h-full object-cover pointer-events-none"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center">
                <Plus className="text-white opacity-0 hover:opacity-100 transition-opacity duration-200" size={20} />
            </div>
        </div>
    );
};

// Enhanced Scrapbook Page Component with Drag and Drop
const ScrapbookPage = ({ 
    pageData, 
    pageIndex,
    isActive, 
    onAddElement, 
    onUpdateElement, 
    onDeleteElement,
    onUpdateBackground 
}) => {
    const [selectedElement, setSelectedElement] = useState(null);
    const [isDragMode, setIsDragMode] = useState(false);
    const [draggedElement, setDraggedElement] = useState(null);
    const [dragOverlay, setDragOverlay] = useState(false);

    const pageRef = useRef(null);

    const handleElementClick = (element, index) => {
        setSelectedElement({ ...element, index });
    };

    const handleElementUpdate = (updates) => {
        if (selectedElement) {
            onUpdateElement(selectedElement.index, { ...selectedElement, ...updates });
            setSelectedElement({ ...selectedElement, ...updates });
        }
    };

    const handleElementDelete = () => {
        if (selectedElement) {
            onDeleteElement(selectedElement.index);
            setSelectedElement(null);
        }
    };

    // Enhanced drag functionality for existing elements
    const handleMouseDown = (e, element, index) => {
        if (e.button === 0) {
            e.preventDefault();
            setIsDragMode(true);
            setDraggedElement({ ...element, index });
            setSelectedElement({ ...element, index });
            
            // Add global mouse events
            const handleMouseMove = (moveEvent) => {
                if (pageRef.current) {
                    const rect = pageRef.current.getBoundingClientRect();
                    const x = ((moveEvent.clientX - rect.left) / rect.width) * 100;
                    const y = ((moveEvent.clientY - rect.top) / rect.height) * 100;
                    
                    const boundedX = Math.max(5, Math.min(95, x));
                    const boundedY = Math.max(5, Math.min(95, y));
                    
                    onUpdateElement(index, { 
                        ...element, 
                        x: boundedX, 
                        y: boundedY 
                    });
                }
            };

            const handleMouseUp = () => {
                setIsDragMode(false);
                setDraggedElement(null);
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
    };

    // Drag and drop from sidebar
    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setDragOverlay(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOverlay(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOverlay(false);
        
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            if (data && pageRef.current) {
                const rect = pageRef.current.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                
                const boundedX = Math.max(5, Math.min(95, x));
                const boundedY = Math.max(5, Math.min(95, y));
                
                onAddElement({
                    ...data,
                    x: boundedX,
                    y: boundedY
                });
            }
        } catch (error) {
            console.error('Error parsing drop data:', error);
        }
    };

    return (
        <div className="relative w-full h-full">
            {/* Page Content */}
            <div
                ref={pageRef}
                data-page-index={pageIndex}
                className={`relative w-full h-full rounded-lg border-4 transition-all duration-200 overflow-hidden ${
                    dragOverlay 
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
                        : 'border-gray-300 dark:border-gray-600'
                } ${pageData.background || 'bg-white dark:bg-gray-800'}`}
                onClick={() => setSelectedElement(null)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {/* Drop overlay */}
                {dragOverlay && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-blue-100/50 dark:bg-blue-900/30 border-2 border-dashed border-blue-400 rounded-lg">
                        <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg">
                            <p className="text-blue-600 dark:text-blue-400 font-medium">
                                Drop here to add to page
                            </p>
                        </div>
                    </div>
                )}

                {/* Page Elements */}
                {pageData.elements?.map((element, index) => (
                    <div
                        key={index}
                        className={`absolute cursor-move transition-all duration-200 select-none ${
                            selectedElement?.index === index ? 'ring-2 ring-blue-500 ring-opacity-75 z-20' : 'z-10'
                        } ${isDragMode && draggedElement?.index === index ? 'z-50' : ''}`}
                        style={{
                            left: `${element.x}%`,
                            top: `${element.y}%`,
                            transform: `translate(-50%, -50%) rotate(${element.rotation || 0}deg)`
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleElementClick(element, index);
                        }}
                        onMouseDown={(e) => handleMouseDown(e, element, index)}
                    >
                        {element.type === 'sticker' && (() => {
                            const stickerData = availableStickers.find(s => s.id === element.stickerId);
                            if (!stickerData) return null;
                            const Icon = stickerData.icon;
                            return (
                                <Icon
                                    size={element.size || 32}
                                    color={element.color || stickerData.color}
                                    className="drop-shadow-sm pointer-events-none"
                                />
                            );
                        })()}

                        {element.type === 'photo' && (
                            <img
                                src={element.src}
                                alt="Scrapbook photo"
                                className="rounded-lg shadow-lg border-2 border-white dark:border-gray-700 pointer-events-none"
                                style={{
                                    width: element.width || 150,
                                    height: element.height || 150,
                                    objectFit: 'cover'
                                }}
                            />
                        )}

                        {element.type === 'text' && (
                            <div
                                className={`font-bold text-${element.fontSize || 'lg'} drop-shadow-sm whitespace-nowrap pointer-events-none`}
                                style={{ color: element.color || '#333' }}
                            >
                                {element.content}
                            </div>
                        )}

                        {/* Selection handles */}
                        {selectedElement?.index === index && (
                            <div className="absolute -inset-2 pointer-events-none">
                                <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Page Number */}
                <div className="absolute bottom-4 right-4 text-gray-400 dark:text-gray-500 text-sm font-semibold z-5">
                    Page {pageData.pageNumber}
                </div>
            </div>

            {/* Enhanced Element Editor */}
            {selectedElement && (
                <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 p-4 min-w-56 z-30">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Move size={16} />
                        Edit {selectedElement.type}
                    </h4>
                    
                    <div className="space-y-3">
                        {selectedElement.type === 'sticker' && (
                            <>
                                <div>
                                    <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">Size</label>
                                    <input
                                        type="range"
                                        min="16"
                                        max="64"
                                        value={selectedElement.size || 32}
                                        onChange={(e) => handleElementUpdate({ size: parseInt(e.target.value) })}
                                        className="w-full"
                                    />
                                    <span className="text-xs text-gray-500">{selectedElement.size || 32}px</span>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">Color</label>
                                    <input
                                        type="color"
                                        value={selectedElement.color || '#000000'}
                                        onChange={(e) => handleElementUpdate({ color: e.target.value })}
                                        className="w-full h-8 rounded border"
                                    />
                                </div>
                            </>
                        )}

                        {selectedElement.type === 'photo' && (
                            <>
                                <div>
                                    <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">Width</label>
                                    <input
                                        type="range"
                                        min="50"
                                        max="300"
                                        value={selectedElement.width || 150}
                                        onChange={(e) => handleElementUpdate({ width: parseInt(e.target.value) })}
                                        className="w-full"
                                    />
                                    <span className="text-xs text-gray-500">{selectedElement.width || 150}px</span>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">Height</label>
                                    <input
                                        type="range"
                                        min="50"
                                        max="300"
                                        value={selectedElement.height || 150}
                                        onChange={(e) => handleElementUpdate({ height: parseInt(e.target.value) })}
                                        className="w-full"
                                    />
                                    <span className="text-xs text-gray-500">{selectedElement.height || 150}px</span>
                                </div>
                            </>
                        )}

                        {selectedElement.type === 'text' && (
                            <>
                                <div>
                                    <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">Text</label>
                                    <input
                                        type="text"
                                        value={selectedElement.content || ''}
                                        onChange={(e) => handleElementUpdate({ content: e.target.value })}
                                        className="w-full px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">Font Size</label>
                                    <select
                                        value={selectedElement.fontSize || 'lg'}
                                        onChange={(e) => handleElementUpdate({ fontSize: e.target.value })}
                                        className="w-full px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                                    >
                                        <option value="sm">Small</option>
                                        <option value="base">Medium</option>
                                        <option value="lg">Large</option>
                                        <option value="xl">Extra Large</option>
                                        <option value="2xl">XXL</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">Color</label>
                                    <input
                                        type="color"
                                        value={selectedElement.color || '#000000'}
                                        onChange={(e) => handleElementUpdate({ color: e.target.value })}
                                        className="w-full h-8 rounded border"
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">Rotation</label>
                            <input
                                type="range"
                                min="-180"
                                max="180"
                                value={selectedElement.rotation || 0}
                                onChange={(e) => handleElementUpdate({ rotation: parseInt(e.target.value) })}
                                className="w-full"
                            />
                            <span className="text-xs text-gray-500">{selectedElement.rotation || 0}°</span>
                        </div>

                        <div className="flex gap-2">
                            <Button 
                                onClick={() => handleElementUpdate({ rotation: 0 })}
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                            >
                                <RotateCcw size={14} className="mr-1" />
                                Reset
                            </Button>
                            <Button 
                                onClick={handleElementDelete}
                                variant="destructive" 
                                size="sm" 
                                className="flex-1"
                            >
                                <Trash2 size={14} className="mr-1" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Enhanced Main Scrapbook Component with Page Flipping Animation
const Scrapbook = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);
    const [flipDirection, setFlipDirection] = useState('');
    const [saveStatus, setSaveStatus] = useState('');
    const [scrapbookData, setScrapbookData] = useState({
        title: 'My Travel Scrapbook',
        pages: [
            { pageNumber: 1, background: 'bg-white dark:bg-gray-800', elements: [] },
            { pageNumber: 2, background: 'bg-white dark:bg-gray-800', elements: [] }
        ]
    });
    const [activeTab, setActiveTab] = useState('stickers');
    const [userPhotos, setUserPhotos] = useState([
        // Sample travel photos - in real app, these would come from user's uploads or posts
        { id: 1, src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop', name: 'Beach Sunset' },
        { id: 2, src: 'https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?w=150&h=150&fit=crop', name: 'Mountain View' },
        { id: 3, src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=150&h=150&fit=crop', name: 'City Skyline' },
        { id: 4, src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150&h=150&fit=crop', name: 'Ocean Waves' },
        { id: 5, src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=150&h=150&fit=crop', name: 'Forest Path' },
        { id: 6, src: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=150&h=150&fit=crop', name: 'Ancient Temple' },
        { id: 7, src: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=150&h=150&fit=crop', name: 'Desert Dunes' },
        { id: 8, src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop', name: 'Tropical Paradise' }
    ]);

    const addPage = () => {
        const newPageNumber = scrapbookData.pages.length + 1;
        setScrapbookData(prev => ({
            ...prev,
            pages: [...prev.pages, {
                pageNumber: newPageNumber,
                background: 'bg-white dark:bg-gray-800',
                elements: []
            }]
        }));
        setCurrentPage(scrapbookData.pages.length);
    };

    const nextPage = () => {
        if (currentPage < scrapbookData.pages.length - 1 && !isFlipping) {
            setIsFlipping(true);
            setFlipDirection('next');
            setTimeout(() => {
                setCurrentPage(currentPage + 1);
                setIsFlipping(false);
                setFlipDirection('');
            }, 1000); // Increased to match smoother animation
        }
    };

    const previousPage = () => {
        if (currentPage > 0 && !isFlipping) {
            setIsFlipping(true);
            setFlipDirection('prev');
            setTimeout(() => {
                setCurrentPage(currentPage - 1);
                setIsFlipping(false);
                setFlipDirection('');
            }, 1000); // Increased to match smoother animation
        }
    };

    const goToPage = (pageIndex) => {
        if (pageIndex !== currentPage && !isFlipping) {
            setIsFlipping(true);
            setFlipDirection(pageIndex > currentPage ? 'next' : 'prev');
            setTimeout(() => {
                setCurrentPage(pageIndex);
                setIsFlipping(false);
                setFlipDirection('');
            }, 1000); // Increased to match smoother animation
        }
    };

    const addElementToPage = (element) => {
        setScrapbookData(prev => {
            const newPages = [...prev.pages];
            newPages[currentPage] = {
                ...newPages[currentPage],
                elements: [...newPages[currentPage].elements, { ...element, id: Date.now() }]
            };
            return { ...prev, pages: newPages };
        });
        toast.success('Added to scrapbook!');
    };

    const updateElement = (elementIndex, updatedElement) => {
        setScrapbookData(prev => {
            const newPages = [...prev.pages];
            newPages[currentPage].elements[elementIndex] = updatedElement;
            return { ...prev, pages: newPages };
        });
    };

    const deleteElement = (elementIndex) => {
        setScrapbookData(prev => {
            const newPages = [...prev.pages];
            newPages[currentPage].elements.splice(elementIndex, 1);
            return { ...prev, pages: newPages };
        });
        toast.success('Element removed');
    };

    const applyTemplate = (template) => {
        setScrapbookData(prev => {
            const newPages = [...prev.pages];
            newPages[currentPage] = {
                ...newPages[currentPage],
                background: template.background,
                elements: [...template.elements]
            };
            return { ...prev, pages: newPages };
        });
        toast.success(`Applied ${template.name} template!`);
    };

    const addTextElement = () => {
        const newText = {
            type: 'text',
            content: 'Edit me!',
            x: 50,
            y: 50,
            fontSize: 'lg',
            color: '#333333'
        };
        addElementToPage(newText);
    };

    const handlePhotoUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newPhoto = {
                    id: Date.now(),
                    src: e.target.result,
                    name: file.name
                };
                setUserPhotos(prev => [...prev, newPhoto]);
                toast.success('Photo uploaded!');
            };
            reader.readAsDataURL(file);
        }
    };

    const saveScrapbook = async () => {
        try {
            setSaveStatus('Saving...');
            // Save to localStorage
            const scrapbookWithTimestamp = {
                ...scrapbookData,
                lastSaved: new Date().toISOString(),
                version: '1.0'
            };
            
            localStorage.setItem('scrapbook', JSON.stringify(scrapbookWithTimestamp));
            
            // In a real app, this would also save to backend
            // await api.saveScrapbook(scrapbookWithTimestamp);
            
            setSaveStatus('Saved ✓');
            toast.success('Scrapbook saved successfully!');
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (error) {
            console.error('Error saving scrapbook:', error);
            setSaveStatus('Save failed ✗');
            toast.error('Failed to save scrapbook');
            setTimeout(() => setSaveStatus(''), 3000);
        }
    };

    const exportAsPDF = async () => {
        try {
            toast.info('Generating PDF... Please wait');
            
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            // Add title page
            pdf.setFontSize(24);
            pdf.setTextColor(128, 90, 213); // Purple color
            pdf.text(scrapbookData.title, pageWidth / 2, 30, { align: 'center' });
            
            pdf.setFontSize(14);
            pdf.setTextColor(100, 100, 100);
            pdf.text('Created with Digital Scrapbook', pageWidth / 2, 45, { align: 'center' });
            pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 55, { align: 'center' });

            // Process each page
            for (let i = 0; i < scrapbookData.pages.length; i++) {
                const pageElement = document.querySelector(`[data-page-index="${i}"]`);
                
                if (pageElement) {
                    // Add new page if not first page
                    if (i > 0) pdf.addPage();
                    
                    // Capture page as canvas
                    const canvas = await html2canvas(pageElement, {
                        useCORS: true,
                        allowTaint: true,
                        scale: 2,
                        width: pageElement.offsetWidth,
                        height: pageElement.offsetHeight,
                        backgroundColor: null
                    });
                    
                    const imgData = canvas.toDataURL('image/png');
                    
                    // Calculate dimensions to fit page
                    const imgWidth = pageWidth - 20;
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;
                    
                    // Center the image on the page
                    const x = 10;
                    const y = (pageHeight - imgHeight) / 2;
                    
                    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
                    
                    // Add page number
                    pdf.setFontSize(10);
                    pdf.setTextColor(150, 150, 150);
                    pdf.text(`Page ${i + 1}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
                } else {
                    // Fallback if page element not found
                    if (i > 0) pdf.addPage();
                    pdf.setFontSize(16);
                    pdf.setTextColor(100, 100, 100);
                    pdf.text(`Page ${i + 1}`, pageWidth / 2, pageHeight / 2, { align: 'center' });
                }
            }

            // Save the PDF
            const fileName = `${scrapbookData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.pdf`;
            pdf.save(fileName);
            
            toast.success('PDF exported successfully!');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            toast.error('Failed to export PDF');
        }
    };

    const loadScrapbook = () => {
        try {
            const savedData = localStorage.getItem('scrapbook');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                setScrapbookData(parsedData);
                toast.success('Scrapbook loaded!');
            } else {
                toast.info('No saved scrapbook found');
            }
        } catch (error) {
            console.error('Error loading scrapbook:', error);
            toast.error('Failed to load scrapbook');
        }
    };

    const exportAsJSON = () => {
        try {
            const dataStr = JSON.stringify(scrapbookData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `${scrapbookData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_backup.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            toast.success('Scrapbook exported as JSON!');
        } catch (error) {
            console.error('Error exporting JSON:', error);
            toast.error('Failed to export JSON');
        }
    };

    const currentPageData = scrapbookData.pages[currentPage];

    // Auto-load saved scrapbook on component mount
    useEffect(() => {
        const savedData = localStorage.getItem('scrapbook');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                setScrapbookData(parsedData);
                toast.info('Loaded your saved scrapbook');
            } catch (error) {
                console.error('Error loading saved scrapbook:', error);
            }
        }
    }, []);

    // Auto-save every 30 seconds when there are changes
    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            if (scrapbookData.pages.some(page => page.elements.length > 0)) {
                const scrapbookWithTimestamp = {
                    ...scrapbookData,
                    lastAutoSaved: new Date().toISOString(),
                    autoSave: true
                };
                localStorage.setItem('scrapbook_autosave', JSON.stringify(scrapbookWithTimestamp));
            }
        }, 30000); // Auto-save every 30 seconds

        return () => clearInterval(autoSaveInterval);
    }, [scrapbookData]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'ArrowLeft') {
                previousPage();
            } else if (e.key === 'ArrowRight') {
                nextPage();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentPage, isFlipping]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-950 dark:to-pink-950 transition-all duration-300">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="text-center mb-12 relative">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <Book className="text-purple-600 dark:text-purple-400" size={48} />
                        <div className="relative flex items-center">
                            <h1 className="text-4xl font-bold text-purple-700 dark:text-purple-300 leading-normal py-2 drop-shadow-sm">
                                Digital Scrapbook
                            </h1>
                        </div>
                        {saveStatus && (
                            <div className="absolute top-0 right-0 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium border border-green-200 dark:border-green-700">
                                {saveStatus}
                            </div>
                        )}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-lg mb-4 max-w-2xl mx-auto leading-relaxed">
                        Create beautiful memory books of your travel adventures
                    </p>
                    <div className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full px-4 py-2 border border-purple-200 dark:border-purple-700">
                        <span>💡</span>
                        <span>Drag and drop stickers/photos onto pages, use arrows to flip pages</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar - Tools and Assets */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Tools Tabs */}
                        <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-purple-200/50 dark:border-purple-700/50 shadow-lg">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Button
                                    variant={activeTab === 'stickers' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setActiveTab('stickers')}
                                >
                                    <Sticker size={16} className="mr-1" />
                                    Stickers
                                </Button>
                                <Button
                                    variant={activeTab === 'photos' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setActiveTab('photos')}
                                >
                                    <ImageIcon size={16} className="mr-1" />
                                    Photos
                                </Button>
                                <Button
                                    variant={activeTab === 'templates' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setActiveTab('templates')}
                                >
                                    <Palette size={16} className="mr-1" />
                                    Templates
                                </Button>
                            </div>

                            {/* Stickers Tab */}
                            {activeTab === 'stickers' && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                                        Drag or click stickers to add to your page
                                    </h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {availableStickers.map(sticker => (
                                            <StickerButton
                                                key={sticker.id}
                                                sticker={sticker}
                                                onAddToPage={addElementToPage}
                                            />
                                        ))}
                                    </div>
                                    <Button
                                        onClick={addTextElement}
                                        className="w-full mt-4"
                                        variant="outline"
                                    >
                                        <Type size={16} className="mr-2" />
                                        Add Text
                                    </Button>
                                </div>
                            )}

                            {/* Photos Tab */}
                            {activeTab === 'photos' && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            Your Photos
                                        </h3>
                                        <label className="cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoUpload}
                                                className="hidden"
                                            />
                                            <Button size="sm" variant="outline">
                                                <Upload size={16} className="mr-1" />
                                                Upload
                                            </Button>
                                        </label>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                        Drag or click photos to add to your page
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {userPhotos.map(photo => (
                                            <PhotoButton
                                                key={photo.id}
                                                photo={photo}
                                                onAddToPage={addElementToPage}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Templates Tab */}
                            {activeTab === 'templates' && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                                        Page Templates
                                    </h3>
                                    <div className="space-y-3">
                                        {templates.map(template => (
                                            <div
                                                key={template.id}
                                                className="p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                                                onClick={() => applyTemplate(template)}
                                            >
                                                <div className={`w-full h-16 rounded ${template.background} mb-2 border border-gray-300 dark:border-gray-600`}></div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white text-center">
                                                    {template.name}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Page Actions */}
                        <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-purple-200/50 dark:border-purple-700/50 shadow-lg">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Page Actions</h3>
                            <div className="space-y-2">
                                <Button onClick={addPage} className="w-full" variant="outline">
                                    <Plus size={16} className="mr-2" />
                                    Add New Page
                                </Button>
                            </div>

                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 mt-6">Save & Export</h3>
                            <div className="space-y-2">
                                <Button onClick={saveScrapbook} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                                    <Save size={16} className="mr-2" />
                                    Save Scrapbook
                                </Button>
                                <Button onClick={loadScrapbook} className="w-full" variant="outline">
                                    <Upload size={16} className="mr-2" />
                                    Load Saved
                                </Button>
                                <Button onClick={exportAsPDF} className="w-full bg-pink-600 hover:bg-pink-700 text-white">
                                    <Download size={16} className="mr-2" />
                                    Export as PDF
                                </Button>
                                <Button onClick={exportAsJSON} className="w-full" variant="outline">
                                    <Download size={16} className="mr-2" />
                                    Backup (JSON)
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Main Scrapbook Area */}
                    <div className="lg:col-span-3">
                        <Card className="p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-purple-200/50 dark:border-purple-700/50 shadow-lg">
                            {/* Book Header */}
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {scrapbookData.title}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={previousPage}
                                        disabled={currentPage === 0 || isFlipping}
                                        variant="outline"
                                        size="sm"
                                        className="transition-all duration-200"
                                    >
                                        <ChevronLeft size={16} />
                                        <span className="hidden sm:inline ml-1">Previous</span>
                                    </Button>
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-medium text-gray-900 dark:text-white">
                                        {currentPage + 1} / {scrapbookData.pages.length}
                                    </span>
                                    <Button
                                        onClick={nextPage}
                                        disabled={currentPage === scrapbookData.pages.length - 1 || isFlipping}
                                        variant="outline"
                                        size="sm"
                                        className="transition-all duration-200"
                                    >
                                        <span className="hidden sm:inline mr-1">Next</span>
                                        <ChevronRight size={16} />
                                    </Button>
                                </div>
                            </div>

                            {/* Enhanced Scrapbook Page with Smooth Book Flip Animation */}
                            <div className="book-container relative w-full aspect-[4/3] max-w-4xl mx-auto">
                                <div 
                                    className={`page-wrapper ${
                                        isFlipping 
                                            ? flipDirection === 'next' 
                                                ? 'flip-next' 
                                                : 'flip-prev'
                                            : ''
                                    }`}
                                >
                                    <div className="page-front">
                                        <div className="book-spine"></div>
                                        <div className="page-corner"></div>
                                        <ScrapbookPage
                                            pageData={currentPageData}
                                            pageIndex={currentPage}
                                            isActive={!isFlipping}
                                            onAddElement={addElementToPage}
                                            onUpdateElement={updateElement}
                                            onDeleteElement={deleteElement}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Page Navigation */}
                            <div className="flex justify-center mt-6">
                                <div className="flex gap-2">
                                    {scrapbookData.pages.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => goToPage(index)}
                                            disabled={isFlipping}
                                            className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                                currentPage === index 
                                                    ? 'bg-purple-600 dark:bg-purple-400 scale-125' 
                                                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                                            } ${isFlipping ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            title={`Go to page ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Flip Animation Status */}
                            {isFlipping && (
                                <div className="flex justify-center mt-6">
                                    <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-full backdrop-blur-sm">
                                        <RotateCw className="animate-spin" size={16} />
                                        <span className="font-medium">Flipping page...</span>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Scrapbook;
