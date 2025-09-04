import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  BookOpen, 
  Plus, 
  Download, 
  Upload, 
  Camera, 
  Type, 
  Map, 
  Heart,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Trash2,
  Edit3,
  Check,
  X,
  Smile,
  Star,
  Sparkles,
  Palette,
  Layout,
  Sticker,
  Shapes,
  MoreHorizontal,
  Menu
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Predefined stickers and decorative elements
const STICKERS = {
  travel: ['✈️', '🗺️', '📍', '🧳', '🏖️', '🏔️', '🏛️', '🗽', '🎪', '🎡'],
  emotions: ['😊', '😍', '🤩', '😎', '🥰', '😂', '🤗', '😋', '🤔', '😴'],
  nature: ['🌸', '🌺', '🌻', '🌷', '🌹', '🌿', '🍃', '🌳', '🌲', '🌴'],
  food: ['🍕', '🍔', '🍟', '🍦', '🧁', '🍰', '☕', '🥐', '🍜', '🍱'],
  activities: ['📸', '🎨', '🎭', '🎪', '🎢', '🎠', '⛵', '🚗', '🚲', '🛥️'],
  symbols: ['⭐', '💫', '✨', '💖', '💕', '🌟', '🔆', '💎', '🌈', '☀️']
};

// Default sample images for inspiration
const DEFAULT_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
    title: 'Mountain Lake',
    category: 'nature'
  },
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    title: 'City Skyline',
    category: 'urban'
  },
  {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    title: 'Beach Paradise',
    category: 'beach'
  },
  {
    url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop',
    title: 'Desert Adventure',
    category: 'desert'
  },
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    title: 'Forest Trail',
    category: 'forest'
  },
  {
    url: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400&h=300&fit=crop',
    title: 'Ancient Temple',
    category: 'culture'
  }
];

const TEMPLATES = [
  {
    id: 'sunset',
    name: 'Sunset Journey',
    background: 'travel-gradient-sunset',
    accent: 'border-pink-300',
    description: 'Perfect for romantic destinations'
  },
  {
    id: 'ocean',
    name: 'Ocean Adventure',
    background: 'travel-gradient-ocean',
    accent: 'border-blue-300',
    description: 'For beach and coastal trips'
  },
  {
    id: 'forest',
    name: 'Forest Escape',
    background: 'travel-gradient-forest',
    accent: 'border-green-300',
    description: 'Nature and wildlife journeys'
  },
  {
    id: 'mountain',
    name: 'Mountain Peak',
    background: 'travel-gradient-mountain',
    accent: 'border-cyan-300',
    description: 'High altitude adventures'
  },
  {
    id: 'vintage',
    name: 'Vintage Explorer',
    background: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50',
    accent: 'border-amber-300',
    description: 'Classic travel memories'
  }
];

const Scrapbook = () => {
  const [pages, setPages] = useState([
    {
      id: 1,
      title: 'My Travel Journey',
      template: 'sunset',
      items: []
    }
  ]);
  
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showDefaultImages, setShowDefaultImages] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedStickerCategory, setSelectedStickerCategory] = useState('travel');
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState('');
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState('');
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef(null);
  const scrapbookRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const pageRefs = useRef({});

  // Auto-save functionality (silent)
  useEffect(() => {
    const autoSave = setTimeout(() => {
      localStorage.setItem('scrapbookData', JSON.stringify(pages));
    }, 3000);

    return () => clearTimeout(autoSave);
  }, [pages]);

  // Load saved data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('scrapbookData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Only load if it's valid data with proper structure
        if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].id) {
          setPages(parsedData);
        }
      } catch (error) {
        console.log('Invalid saved data, starting fresh');
        // Clear invalid data
        localStorage.removeItem('scrapbookData');
      }
    }
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileMenu]);

  const currentPage = pages[currentPageIndex];

  // Navigation functions with page flip effect
  const nextPage = () => {
    if (currentPageIndex < pages.length - 1 && !isFlipping) {
      setIsFlipping(true);
      setFlipDirection('next');
      
      setTimeout(() => {
        setCurrentPageIndex(currentPageIndex + 1);
      }, 400); // Half of animation duration
      
      setTimeout(() => {
        setIsFlipping(false);
        setFlipDirection('');
      }, 800); // Full animation duration
    }
  };

  const prevPage = () => {
    if (currentPageIndex > 0 && !isFlipping) {
      setIsFlipping(true);
      setFlipDirection('prev');
      
      setTimeout(() => {
        setCurrentPageIndex(currentPageIndex - 1);
      }, 400);
      
      setTimeout(() => {
        setIsFlipping(false);
        setFlipDirection('');
      }, 800);
    }
  };

  const addNewPage = () => {
    const newPage = {
      id: Date.now(),
      title: `Page ${pages.length + 1}`,
      template: 'sunset',
      items: []
    };
    setPages([...pages, newPage]);
    setCurrentPageIndex(pages.length);
  };

  // Item management functions
  const addTextItem = () => {
    const newItem = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'Click to edit this text...',
      position: { x: 100, y: 150 + (currentPage.items.length * 50) },
      style: { 
        fontSize: '16px', 
        color: '#2d3748', 
        fontFamily: 'sans-serif',
        width: '200px',
        minHeight: '40px'
      }
    };
    
    updateCurrentPage({
      ...currentPage,
      items: [...currentPage.items, newItem]
    });
    
    // Automatically start editing the new text item
    setTimeout(() => {
      setEditingItemId(newItem.id);
      setEditingText(''); // Start with empty text for new items
    }, 100);
  };

  const addStickerItem = (sticker) => {
    const newItem = {
      id: `sticker-${Date.now()}`,
      type: 'sticker',
      content: sticker,
      position: { x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 },
      style: { 
        width: '40px',
        height: '40px'
      }
    };
    
    updateCurrentPage({
      ...currentPage,
      items: [...currentPage.items, newItem]
    });
    setShowStickers(false);
  };

  const addDefaultImage = (imageData) => {
    const newItem = {
      id: `image-${Date.now()}`,
      type: 'image',
      content: imageData.url,
      position: { x: 100 + Math.random() * 100, y: 150 + Math.random() * 100 },
      style: { width: '250px', height: '180px', borderRadius: '12px', objectFit: 'cover' }
    };
    
    updateCurrentPage({
      ...currentPage,
      items: [...currentPage.items, newItem]
    });
    setShowDefaultImages(false);
  };

  const changeTemplate = (templateId) => {
    updateCurrentPage({
      ...currentPage,
      template: templateId
    });
    setShowTemplates(false);
  };

  const addImageItem = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newItem = {
        id: `image-${Date.now()}`,
        type: 'image',
        content: e.target.result,
        position: { x: 50, y: 100 + (currentPage.items.length * 200) },
        style: { width: '200px', height: 'auto', borderRadius: '8px' }
      };
      
      updateCurrentPage({
        ...currentPage,
        items: [...currentPage.items, newItem]
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        addImageItem(file);
      }
    });
    event.target.value = '';
  };

  const updateCurrentPage = (updatedPage) => {
    const newPages = [...pages];
    newPages[currentPageIndex] = updatedPage;
    setPages(newPages);
  };

  const deleteItem = (itemId) => {
    const updatedItems = currentPage.items.filter(item => item.id !== itemId);
    updateCurrentPage({
      ...currentPage,
      items: updatedItems
    });
    setSelectedItemId(null);
  };

  // Improved drag and drop functions
  const handleMouseDown = (e, item) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDraggedItem(item);
    setDragOffset({ x: offsetX, y: offsetY });
    setSelectedItemId(item.id);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setIsDragging(false);
    
    // Add smooth transition class
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e) => {
    if (isResizing && draggedItem) {
      const deltaX = e.clientX - resizeStartPos.x;
      const deltaY = e.clientY - resizeStartPos.y;
      
      let newWidth = resizeStartSize.width;
      let newHeight = resizeStartSize.height;
      
      if (resizeDirection.includes('right')) {
        newWidth = Math.max(50, resizeStartSize.width + deltaX);
      }
      if (resizeDirection.includes('left')) {
        newWidth = Math.max(50, resizeStartSize.width - deltaX);
      }
      if (resizeDirection.includes('bottom')) {
        newHeight = Math.max(30, resizeStartSize.height + deltaY);
      }
      if (resizeDirection.includes('top')) {
        newHeight = Math.max(30, resizeStartSize.height - deltaY);
      }
      
      const updatedItems = currentPage.items.map(item => 
        item.id === draggedItem.id 
          ? { 
              ...item, 
              style: { 
                ...item.style, 
                width: `${newWidth}px`, 
                height: draggedItem.type === 'text' ? 'auto' : `${newHeight}px`,
                fontSize: draggedItem.type === 'text' ? `${Math.max(12, newWidth / 10)}px` : 
                         draggedItem.type === 'sticker' ? undefined : item.style.fontSize
              } 
            }
          : item
      );
      
      updateCurrentPage({
        ...currentPage,
        items: updatedItems
      });
      return;
    }
    
    if (!draggedItem || isResizing) return;
    
    // Only start dragging after minimum movement to prevent accidental drags
    if (!isDragging) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - dragStartPos.x, 2) + 
        Math.pow(e.clientY - dragStartPos.y, 2)
      );
      if (distance > 5) {
        setIsDragging(true);
      } else {
        return;
      }
    }
    
    const pageRect = scrapbookRef.current.getBoundingClientRect();
    const newX = e.clientX - pageRect.left - dragOffset.x;
    const newY = e.clientY - pageRect.top - dragOffset.y;
    
    // Constrain to page boundaries with padding
    const constrainedX = Math.max(10, Math.min(newX, pageRect.width - 100));
    const constrainedY = Math.max(10, Math.min(newY, pageRect.height - 50));
    
    const updatedItems = currentPage.items.map(item => 
      item.id === draggedItem.id 
        ? { ...item, position: { x: constrainedX, y: constrainedY } }
        : item
    );
    
    updateCurrentPage({
      ...currentPage,
      items: updatedItems
    });
  };

  const handleMouseUp = () => {
    if (draggedItem) {
      setDraggedItem(null);
      setDragOffset({ x: 0, y: 0 });
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection('');
      
      // Reset body styles
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
  };

  // Resize handlers
  const handleResizeStart = (e, item, direction) => {
    e.stopPropagation();
    setDraggedItem(item);
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    
    // Get current size
    const currentWidth = item.style?.width ? parseInt(item.style.width) : 
                        (item.type === 'sticker' ? 40 : item.type === 'image' ? 200 : 200);
    const currentHeight = item.style?.height ? parseInt(item.style.height) : 
                         (item.type === 'sticker' ? 40 : item.type === 'image' ? 150 : 150);
    
    setResizeStartSize({ width: currentWidth, height: currentHeight });
    
    // Prevent text selection during resize
    document.body.style.userSelect = 'none';
    document.body.style.cursor = direction.includes('right') || direction.includes('left') ? 'ew-resize' : 'ns-resize';
    if (direction.includes('right') && direction.includes('bottom')) document.body.style.cursor = 'nw-resize';
    if (direction.includes('left') && direction.includes('bottom')) document.body.style.cursor = 'ne-resize';
    if (direction.includes('right') && direction.includes('top')) document.body.style.cursor = 'ne-resize';
    if (direction.includes('left') && direction.includes('top')) document.body.style.cursor = 'nw-resize';
  };

  // Handle page click to deselect items
  const handlePageClick = (e) => {
    // Don't deselect when clicking on input fields or buttons
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'TEXTAREA') {
      return;
    }
    
    // Only deselect if clicking directly on the page content area (not on an item)
    if (e.target === e.currentTarget || 
        (e.target.closest('.scrapbook-item') === null && 
         e.target.closest('button') === null &&
         e.target.closest('input') === null &&
         e.target.closest('textarea') === null)) {
      setSelectedItemId(null);
    }
  };

  // Text editing functions
  const startEditing = (item) => {
    setEditingItemId(item.id);
    // Clear default text when editing starts
    const textToEdit = item.content === 'Click to edit this text...' ? '' : item.content;
    setEditingText(textToEdit);
  };

  const saveEdit = () => {
    const updatedItems = currentPage.items.map(item => 
      item.id === editingItemId 
        ? { ...item, content: editingText }
        : item
    );
    
    updateCurrentPage({
      ...currentPage,
      items: updatedItems
    });
    
    setEditingItemId(null);
    setEditingText('');
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setEditingText('');
  };

  // Export functions
  const exportToPDF = async () => {
    setIsExporting(true);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    
    try {
      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage();
        
        // Set current page for rendering
        setCurrentPageIndex(i);
        
        // Wait for page to render
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const pageElement = pageRefs.current[pages[i].id];
        if (pageElement) {
          const canvas = await html2canvas(pageElement, {
            scale: 2,
            useCORS: true,
            logging: false
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 20;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, pageHeight - 20));
        }
      }
      
      pdf.save(`travel-scrapbook-${new Date().toISOString().split('T')[0]}.pdf`);
      setSaveStatus('PDF exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      setSaveStatus('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const resetScrapbook = () => {
    if (confirm('Are you sure you want to reset the scrapbook? This will delete all pages and content.')) {
      const freshPages = [
        {
          id: Date.now(),
          title: 'My Travel Journey',
          template: 'sunset',
          items: []
        }
      ];
      setPages(freshPages);
      setCurrentPageIndex(0);
      localStorage.removeItem('scrapbookData');
      setSaveStatus('Scrapbook reset successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-blue-200/30 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex-shrink-0">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent truncate">
                Travel Scrapbook
              </h1>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <Button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  variant="outline"
                  size="sm"
                  className="hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </div>

              {/* Primary Actions Group */}
              <div className="hidden lg:flex items-center gap-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
                
                <Button
                  onClick={() => setShowDefaultImages(true)}
                  variant="outline"
                  size="sm"
                  className="hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Gallery
                </Button>
                
                <Button
                  onClick={addTextItem}
                  variant="outline"
                  size="sm"
                  className="hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                >
                  <Type className="w-4 h-4 mr-2" />
                  Text
                </Button>
              </div>

              {/* Secondary Actions Group */}
              <div className="hidden md:flex items-center gap-2 border-l border-gray-200 dark:border-gray-600 pl-2">
                <Button
                  onClick={() => setShowStickers(true)}
                  variant="outline"
                  size="sm"
                  className="hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-200"
                >
                  <Smile className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Stickers</span>
                </Button>
                
                <Button
                  onClick={() => setShowTemplates(true)}
                  variant="outline"
                  size="sm"
                  className="hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                >
                  <Palette className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Templates</span>
                </Button>
              </div>
              
              {/* File Actions Group */}
              <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-600 pl-2">
                <Button
                  onClick={exportToPDF}
                  disabled={isExporting}
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 hover:from-blue-600 hover:via-purple-600 hover:to-green-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300"
                  size="sm"
                >
                  <Download className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export PDF'}</span>
                </Button>
                
                {/* Reset Button - Only show when there's content or multiple pages */}
                {(pages.length > 1 || pages[0].items.length > 0) && (
                  <Button
                    onClick={resetScrapbook}
                    variant="outline"
                    size="sm"
                    className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden lg:inline ml-2">Reset</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div 
            ref={mobileMenuRef}
            className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3"
          >
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowMobileMenu(false);
                }}
                variant="outline"
                size="sm"
                className="justify-start hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Photos
              </Button>
              
              <Button
                onClick={() => {
                  setShowDefaultImages(true);
                  setShowMobileMenu(false);
                }}
                variant="outline"
                size="sm"
                className="justify-start hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Gallery
              </Button>
              
              <Button
                onClick={() => {
                  addTextItem();
                  setShowMobileMenu(false);
                }}
                variant="outline"
                size="sm"
                className="justify-start hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
              >
                <Type className="w-4 h-4 mr-2" />
                Add Text
              </Button>
              
              <Button
                onClick={() => {
                  setShowStickers(true);
                  setShowMobileMenu(false);
                }}
                variant="outline"
                size="sm"
                className="justify-start hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-200"
              >
                <Smile className="w-4 h-4 mr-2" />
                Stickers
              </Button>
              
              <Button
                onClick={() => {
                  setShowTemplates(true);
                  setShowMobileMenu(false);
                }}
                variant="outline"
                size="sm"
                className="justify-start hover:bg-green-50 hover:border-green-300 transition-all duration-200"
              >
                <Palette className="w-4 h-4 mr-2" />
                Templates
              </Button>
              
              {(pages.length > 1 || pages[0].items.length > 0) && (
                <Button
                  onClick={() => {
                    resetScrapbook();
                    setShowMobileMenu(false);
                  }}
                  variant="outline"
                  size="sm"
                  className="justify-start hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Page Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={prevPage}
              disabled={currentPageIndex === 0 || isFlipping}
              variant="outline"
              size="sm"
              className="group hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform duration-200" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Page {currentPageIndex + 1} of {pages.length}
              </span>
              {isFlipping && (
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
            </div>
            
            <Button
              onClick={nextPage}
              disabled={currentPageIndex === pages.length - 1 || isFlipping}
              variant="outline"
              size="sm"
              className="group hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            >
              Next
              <ChevronRight className="w-4 h-4 group-hover:translate-x-[2px] transition-transform duration-200" />
            </Button>
            
            <Button
              onClick={addNewPage}
              variant="outline"
              size="sm"
              className="ml-4 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Page
            </Button>
          </div>
        </div>

        {/* Scrapbook Page */}
        <div className="scrapbook-container relative max-w-5xl mx-auto">
          {/* Book Binding Effect */}
          <div className="absolute left-0 top-0 w-8 h-full scrapbook-binding rounded-l-lg z-10"></div>
          
          <Card 
            ref={scrapbookRef}
            className={`scrapbook-page relative w-full aspect-[4/3] max-h-[600px] ml-4 shadow-2xl border-4 dark:bg-gray-800 transition-all duration-500 transform-gpu ${
              TEMPLATES.find(t => t.id === currentPage.template)?.background || 'bg-white'
            } ${
              TEMPLATES.find(t => t.id === currentPage.template)?.accent || 'border-blue-200'
            } dark:border-gray-600 ${
              isFlipping ? (flipDirection === 'next' ? 'page-flip-next' : 'page-flip-prev') : ''
            }`}
            style={{ transformStyle: 'preserve-3d' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handlePageClick}
          >
            <CardContent 
              ref={el => pageRefs.current[currentPage.id] = el}
              className="p-8 h-full overflow-hidden relative"
            >
              {/* Page Title */}
              <div className="mb-6">
                <Input
                  value={currentPage.title}
                  onChange={(e) => updateCurrentPage({ ...currentPage, title: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="text-2xl font-bold text-center border-none bg-transparent text-gray-900 dark:text-white focus:ring-0"
                />
              </div>

              {/* Page Items */}
              {currentPage.items.map(item => (
                <div
                  key={item.id}
                  className={`scrapbook-item absolute transition-all duration-200 ease-out ${
                    selectedItemId === item.id ? 'ring-2 ring-blue-400 ring-opacity-60' : ''
                  } ${
                    draggedItem?.id === item.id ? 'z-50 scale-105 shadow-2xl cursor-grabbing' : 'z-10 cursor-grab hover:shadow-lg'
                  } ${
                    isDragging && draggedItem?.id === item.id ? 'transform rotate-2' : ''
                  }`}
                  style={{
                    left: item.position.x,
                    top: item.position.y,
                    ...item.style
                  }}
                  onMouseDown={(e) => handleMouseDown(e, item)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItemId(item.id);
                  }}
                >
                  {item.type === 'text' ? (
                    editingItemId === item.id ? (
                      <div className="flex items-center gap-2">
                        <Textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onFocus={(e) => e.target.select()}
                          className="min-w-[200px] resize-none"
                          autoFocus
                          placeholder="Enter your text here..."
                        />
                        <div className="flex flex-col gap-1">
                          <Button
                            onClick={saveEdit}
                            size="sm"
                            variant="outline"
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={cancelEdit}
                            size="sm"
                            variant="outline"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-blue-200/50 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-purple-300/50 min-h-[40px] flex items-center"
                        style={{ 
                          width: item.style?.width || '200px',
                          minHeight: item.style?.minHeight || '40px'
                        }}
                        onDoubleClick={() => startEditing(item)}
                      >
                        <p 
                          style={{
                            fontSize: item.style?.fontSize || '16px',
                            color: item.style?.color || '#2d3748',
                            fontFamily: item.style?.fontFamily || 'sans-serif',
                            wordWrap: 'break-word',
                            width: '100%'
                          }}
                        >
                          {item.content}
                        </p>
                      </div>
                    )
                  ) : item.type === 'sticker' ? (
                    <div
                      className="select-none hover:scale-110 transition-all duration-300 cursor-move drop-shadow-lg hover:drop-shadow-xl flex items-center justify-center overflow-hidden"
                      style={{ 
                        width: item.style?.width || '40px',
                        height: item.style?.height || '40px'
                      }}
                    >
                      <span style={{ 
                        fontSize: item.style?.width ? `${parseInt(item.style.width) * 0.8}px` : '32px',
                        lineHeight: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%'
                      }}>
                        {item.content}
                      </span>
                    </div>
                  ) : item.type === 'image' ? (
                    <div className="relative" style={{ width: item.style?.width || '200px', height: item.style?.height || 'auto' }}>
                      <img
                        src={item.content}
                        alt="Scrapbook item"
                        className="rounded-lg shadow-lg border-4 border-white dark:border-gray-700 w-full h-full object-cover"
                        style={{ 
                          borderRadius: item.style?.borderRadius || '8px',
                          objectFit: item.style?.objectFit || 'cover'
                        }}
                        draggable={false}
                      />
                    </div>
                  ) : null}

                  {/* Item Controls */}
                  {selectedItemId === item.id && (
                    <>
                      {/* Action Buttons */}
                      <div className="absolute -top-8 right-0 flex gap-1">
                        {item.type === 'text' && (
                          <Button
                            onClick={() => startEditing(item)}
                            size="sm"
                            variant="outline"
                            className="w-6 h-6 p-0"
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          onClick={() => deleteItem(item.id)}
                          size="sm"
                          variant="outline"
                          className="w-6 h-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Resize Handles */}
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Corner Handles */}
                        <div 
                          className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize pointer-events-auto hover:bg-blue-600 transition-colors"
                          onMouseDown={(e) => handleResizeStart(e, item, 'top-left')}
                        />
                        <div 
                          className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ne-resize pointer-events-auto hover:bg-blue-600 transition-colors"
                          onMouseDown={(e) => handleResizeStart(e, item, 'top-right')}
                        />
                        <div 
                          className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ne-resize pointer-events-auto hover:bg-blue-600 transition-colors"
                          onMouseDown={(e) => handleResizeStart(e, item, 'bottom-left')}
                        />
                        <div 
                          className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize pointer-events-auto hover:bg-blue-600 transition-colors"
                          onMouseDown={(e) => handleResizeStart(e, item, 'bottom-right')}
                        />
                        
                        {/* Edge Handles */}
                        <div 
                          className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ns-resize pointer-events-auto hover:bg-blue-600 transition-colors"
                          onMouseDown={(e) => handleResizeStart(e, item, 'top')}
                        />
                        <div 
                          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ns-resize pointer-events-auto hover:bg-blue-600 transition-colors"
                          onMouseDown={(e) => handleResizeStart(e, item, 'bottom')}
                        />
                        <div 
                          className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ew-resize pointer-events-auto hover:bg-blue-600 transition-colors"
                          onMouseDown={(e) => handleResizeStart(e, item, 'left')}
                        />
                        <div 
                          className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ew-resize pointer-events-auto hover:bg-blue-600 transition-colors"
                          onMouseDown={(e) => handleResizeStart(e, item, 'right')}
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Enhanced Empty state */}
              {currentPage.items.length === 0 && (
                <div className="flex items-center justify-center h-full p-8">
                  <div className="text-center max-w-2xl">
                    {/* Hero Section */}
                    <div className="mb-8">
                      <div className="relative mb-6">
                        <div className="p-6 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center shadow-xl">
                          <BookOpen className="w-12 h-12 text-white" />
                        </div>
                        <div className="absolute top-2 right-1/2 transform translate-x-16">
                          <span className="text-2xl animate-bounce">✈️</span>
                        </div>
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-16">
                          <span className="text-2xl animate-pulse">📸</span>
                        </div>
                      </div>
                      
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent mb-3">
                        Create Your Travel Story
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                        Transform your travel memories into a beautiful digital scrapbook. Add photos, stickers, and personal notes to create something truly special.
                      </p>
                    </div>

                    {/* Quick Start Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="h-20 flex-col gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 hover:scale-105"
                      >
                        <Upload className="w-6 h-6 text-blue-500" />
                        <span className="text-xs font-medium">Upload Photos</span>
                      </Button>
                      
                      <Button
                        onClick={() => setShowDefaultImages(true)}
                        variant="outline"
                        className="h-20 flex-col gap-2 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300 hover:scale-105"
                      >
                        <ImageIcon className="w-6 h-6 text-emerald-500" />
                        <span className="text-xs font-medium">Browse Gallery</span>
                      </Button>
                      
                      <Button
                        onClick={addTextItem}
                        variant="outline"
                        className="h-20 flex-col gap-2 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 hover:scale-105"
                      >
                        <Type className="w-6 h-6 text-purple-500" />
                        <span className="text-xs font-medium">Add Text</span>
                      </Button>
                      
                      <Button
                        onClick={() => setShowStickers(true)}
                        variant="outline"
                        className="h-20 flex-col gap-2 hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-300 hover:scale-105"
                      >
                        <Smile className="w-6 h-6 text-yellow-500" />
                        <span className="text-xs font-medium">Add Stickers</span>
                      </Button>
                    </div>

                    {/* Tips Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50 mt-4">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2 text-sm">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        Pro Tips
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-start gap-2 p-2 rounded-md hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                          <span className="text-blue-500 text-sm leading-none">•</span>
                          <span className="flex-1">Drag and drop elements anywhere</span>
                        </div>
                        <div className="flex items-start gap-2 p-2 rounded-md hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                          <span className="text-purple-500 text-sm leading-none">•</span>
                          <span className="flex-1">Double-click text to edit</span>
                        </div>
                        <div className="flex items-start gap-2 p-2 rounded-md hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                          <span className="text-green-500 text-sm leading-none">•</span>
                          <span className="flex-1">Try different templates</span>
                        </div>
                        <div className="flex items-start gap-2 p-2 rounded-md hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                          <span className="text-yellow-500 text-sm leading-none">•</span>
                          <span className="flex-1">Export as PDF</span>
                        </div>
                        <div className="flex items-start gap-2 p-2 rounded-md hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                          <span className="text-red-500 text-sm leading-none">•</span>
                          <span className="flex-1">Drag handles to resize</span>
                        </div>
                        <div className="flex items-start gap-2 p-2 rounded-md hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                          <span className="text-indigo-500 text-sm leading-none">•</span>
                          <span className="flex-1">Click empty space to deselect</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mobile Toolbar */}
        <div className="sm:hidden fixed bottom-4 left-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-blue-200/30 dark:border-gray-700/50 p-3">
          <div className="flex justify-center gap-1 overflow-x-auto">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
              className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shrink-0"
            >
              <Upload className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setShowDefaultImages(true)}
              variant="outline"
              size="sm"
              className="hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 shrink-0"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
            <Button
              onClick={addTextItem}
              variant="outline"
              size="sm"
              className="hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 shrink-0"
            >
              <Type className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setShowStickers(true)}
              variant="outline"
              size="sm"
              className="hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-200 shrink-0"
            >
              <Smile className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setShowTemplates(true)}
              variant="outline"
              size="sm"
              className="hover:bg-green-50 hover:border-green-300 transition-all duration-200 shrink-0"
            >
              <Palette className="w-4 h-4" />
            </Button>
            <Button
              onClick={exportToPDF}
              disabled={isExporting}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg shrink-0"
              size="sm"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Default Images Panel */}
      {showDefaultImages && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Travel Image Gallery</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Choose from beautiful travel photos to inspire your scrapbook</p>
              </div>
              <Button
                onClick={() => setShowDefaultImages(false)}
                variant="outline"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Images Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {DEFAULT_IMAGES.map((image, index) => (
                <div
                  key={index}
                  onClick={() => addDefaultImage(image)}
                  className="group cursor-pointer rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <div className="relative">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-2 left-2 right-2">
                        <h4 className="text-white text-sm font-semibold truncate">{image.title}</h4>
                        <span className="text-white/80 text-xs capitalize">{image.category}</span>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Plus className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Click on any image to add it to your scrapbook page. You can resize and move it after adding.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stickers Panel */}
      {showStickers && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Choose Stickers</h3>
              <Button
                onClick={() => setShowStickers(false)}
                variant="outline"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Sticker Categories */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(STICKERS).map(category => (
                <Button
                  key={category}
                  onClick={() => setSelectedStickerCategory(category)}
                  variant={selectedStickerCategory === category ? "default" : "outline"}
                  size="sm"
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
            
            {/* Stickers Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
              {STICKERS[selectedStickerCategory].map((sticker, index) => (
                <button
                  key={index}
                  onClick={() => addStickerItem(sticker)}
                  className="w-12 h-12 text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  {sticker}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Templates Panel */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Choose Template</h3>
              <Button
                onClick={() => setShowTemplates(false)}
                variant="outline"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Templates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TEMPLATES.map(template => (
                <div
                  key={template.id}
                  onClick={() => changeTemplate(template.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${template.background} ${template.accent} ${
                    currentPage.template === template.id ? 'ring-2 ring-orange-500' : ''
                  }`}
                >
                  <div className="h-20 rounded mb-2 border border-gray-200 dark:border-gray-600"></div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{template.name}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{template.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default Scrapbook;
