import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { readFileAsDataURL } from '@/lib/utils';
import { getUserInitials } from '@/lib/utils';
import { Loader2, Image, MapPin, X } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '@/redux/postSlice';
import { prependUserProfilePost } from '@/redux/authSlice';

// Leaflet
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Search Control Component
const SearchControl = ({ onSelect }) => {
  const map = useMap();
  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      autoComplete: true,
      autoCompleteDelay: 250,
      showMarker: false,
      showPopup: false,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
    });
    map.addControl(searchControl);
    map.on('geosearch/showlocation', (result) => {
      const lat = result.location.y;
      const lng = result.location.x;
      onSelect([lat, lng]);
    });
    return () => map.removeControl(searchControl);
  }, [map, onSelect]);
  return null;
};

// Location Picker
const LocationPicker = ({ setCoordinates }) => {
  useMapEvents({
    click(e) {
      setCoordinates([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
};

const RecenterMap = ({ coordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (coordinates && coordinates.length === 2) {
      map.setView(coordinates, 12, { animate: true });
    }
  }, [coordinates, map]);

  return null;
};

const CreatePost = ({ open, setOpen }) => {
  const fileRef = useRef();
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [placeName, setPlaceName] = useState('');
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Start each create session with no pre-selected location.
    setSelectedMedia([]);
    setCoordinates(null);
    setPlaceName('');
    setLocationInput('');
  }, [open]);

  const formatLatLng = ([lat, lng]) => `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

  const { user } = useSelector(store => store.auth);
  const { posts } = useSelector(store => store.post);
  const dispatch = useDispatch();

  const fileChangeHandler = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const maxSize = 50 * 1024 * 1024;
    const maxFiles = 10;
    const remainingSlots = Math.max(0, maxFiles - selectedMedia.length);
    if (remainingSlots === 0) {
      toast.error('Maximum 10 files allowed per upload.');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      toast.error(`Only ${remainingSlots} more file(s) can be added (max 10).`);
    }

    const preparedMedia = [];
    for (const mediaFile of filesToProcess) {
      if (mediaFile.size > maxSize) {
        toast.error(`${mediaFile.name}: File size too large. Maximum 50MB allowed.`);
        continue;
      }

      let type = '';
      if (mediaFile.type.startsWith('image/')) {
        type = 'image';
      } else if (mediaFile.type.startsWith('video/')) {
        type = 'video';
      } else {
        toast.error(`${mediaFile.name}: Only image or video files are allowed.`);
        continue;
      }

      const preview = await readFileAsDataURL(mediaFile);
      preparedMedia.push({
        id: `${Date.now()}-${Math.random()}`,
        file: mediaFile,
        preview,
        mediaType: type,
      });
    }

    if (preparedMedia.length) {
      setSelectedMedia((prev) => [...prev, ...preparedMedia]);
    }

    if (fileRef.current) fileRef.current.value = '';
  };

  const reverseGeocode = async ([lat, lng]) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const resolvedName = data.display_name || formatLatLng([lat, lng]);
      setPlaceName(resolvedName);
      setLocationInput(resolvedName);
      return resolvedName;
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
      const fallback = formatLatLng([lat, lng]);
      setPlaceName(fallback);
      return fallback;
    }
  };

  const handleCoordinatePick = async (coords) => {
    setCoordinates(coords);
    await reverseGeocode(coords);
  };

  const searchLocation = async () => {
    if (!locationInput.trim()) return null;
    
    try {
      const provider = new OpenStreetMapProvider();
      const results = await provider.search({ query: locationInput });
      
      if (results && results.length > 0) {
        const { x: lng, y: lat } = results[0];
        const pickedCoords = [lat, lng];
        setCoordinates(pickedCoords);
        setPlaceName(results[0].label || locationInput.trim());
        setLocationInput(results[0].label || locationInput.trim());
        await reverseGeocode(pickedCoords);
        return pickedCoords;
      } else {
        toast.error('Location not found');
        return null;
      }
    } catch (err) {
      console.error('Location search failed:', err);
      toast.error('Failed to search location');
      return null;
    }
  };

  const handleConfirmLocation = async () => {
    let activeCoordinates = coordinates;

    if (!activeCoordinates && locationInput.trim()) {
      activeCoordinates = await searchLocation();
      if (!activeCoordinates) return;
    }

    if (!activeCoordinates) {
      toast.error('Please enter a location or pick one from the map');
      return;
    }

    if (!placeName) {
      setPlaceName(locationInput.trim() || formatLatLng(activeCoordinates));
    }

    setLocationModalOpen(false);
  };

  const clearLocation = () => {
    setCoordinates(null);
    setPlaceName('');
    setLocationInput('');
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported in this browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const pickedCoords = [lat, lng];

        setCoordinates(pickedCoords);
        await reverseGeocode(pickedCoords);
        toast.success('Current location selected.');
        setLocating(false);
      },
      (error) => {
        let message = 'Unable to fetch current location.';
        if (error.code === 1) message = 'Location permission denied. Please allow access and try again.';
        if (error.code === 2) message = 'Location unavailable. Please try again.';
        if (error.code === 3) message = 'Location request timed out. Please try again.';
        toast.error(message);
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const clearSelectedMedia = () => {
    setSelectedMedia([]);
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeSelectedMediaItem = (mediaId) => {
    setSelectedMedia((prev) => prev.filter((item) => item.id !== mediaId));
  };

  const createPostHandler = async () => {
    if (!selectedMedia.length) {
      toast.error("Please select an image or video");
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);
    selectedMedia.forEach((item) => {
      formData.append('media', item.file);
    });
    
    // Location is now optional
    if (coordinates) {
      formData.append("coordinates", JSON.stringify([coordinates[1], coordinates[0]]));
      formData.append("locationName", placeName || locationInput.trim() || formatLatLng(coordinates));
    }

    try {
      setLoading(true);
      const hasVideo = selectedMedia.some((item) => item.mediaType === 'video');
      const timeout = hasVideo ? 15 * 60 * 1000 : 2 * 60 * 1000;
      
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/post/addpost`, formData, {
        withCredentials: true,
        timeout: timeout
      });

      if (res.data.success) {
        if (res.data.post) {
          dispatch(setPosts([res.data.post, ...posts]));
          dispatch(prependUserProfilePost(res.data.post));
        }
        toast.success(res.data.message);
        setOpen(false);
        setCaption("");
        setSelectedMedia([]);
        setCoordinates(null);
        setPlaceName("");
        setLocationInput("");
        if (fileRef.current) fileRef.current.value = '';
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (locationModalOpen || mapPickerOpen) return;
          setOpen(nextOpen);
        }}
      >
        <DialogContent 
          onInteractOutside={(e) => {
            if (locationModalOpen || mapPickerOpen) {
              e.preventDefault();
            }
          }}
          onEscapeKeyDown={(e) => {
            if (locationModalOpen || mapPickerOpen) {
              e.preventDefault();
            }
          }}
          className="max-h-[90vh] flex flex-col p-0 border border-blue-100 dark:border-gray-700 bg-gradient-to-br from-white via-blue-50/70 to-green-50/60 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 shadow-2xl"
        >
          <DialogHeader className='text-center font-bold text-base p-4 border-b border-blue-100/80 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm'>Create New Post</DialogHeader>

          {/* Scrollable Content */}
          <div className='flex-1 overflow-y-auto px-4 py-4' style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            <style>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            <div className='flex gap-3 items-center mb-4 p-3 rounded-xl bg-white/80 dark:bg-gray-800/70 border border-blue-100 dark:border-gray-700'>
              <Avatar className='ring-2 ring-blue-100 dark:ring-gray-600'>
                <AvatarImage src={user?.profilePicture} alt="img" />
                <AvatarFallback>{getUserInitials(user?.username)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className='font-bold text-sm text-gray-900 dark:text-gray-100'>{user?.username}</h1>
                {user?.bio ? <span className='text-gray-600 dark:text-gray-400 text-xs'>{user.bio}</span> : null}
              </div>
            </div>

            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="min-h-[104px] mb-4 px-3 py-2 leading-relaxed focus-visible:ring-blue-300 dark:focus-visible:ring-blue-700 border border-blue-100 dark:border-gray-700 bg-white/85 dark:bg-gray-800/80 resize-none rounded-xl"
              placeholder="Write a caption..."
            />

            {selectedMedia.length > 0 && (
              <div className='my-4 space-y-2'>
                <div className='grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1'>
                  {selectedMedia.map((item) => (
                    <div key={item.id} className='relative h-36 bg-gray-100 rounded-md overflow-hidden'>
                      {item.mediaType === 'image' ? (
                        <img src={item.preview} alt="preview_img" className='object-cover h-full w-full' />
                      ) : (
                        <video src={item.preview} controls className='object-cover h-full w-full' />
                      )}

                      <button
                        type='button'
                        onClick={() => removeSelectedMediaItem(item.id)}
                        className='absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600'
                        aria-label='Remove selected media'
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className='flex justify-end'>
                  <Button
                    type='button'
                    size='sm'
                    variant='destructive'
                    onClick={clearSelectedMedia}
                    className='h-8 px-2'
                  >
                    <X size={14} className='mr-1' />
                    Remove All
                  </Button>
                </div>
              </div>
            )}

            <input ref={fileRef} type='file' className='hidden' onChange={fileChangeHandler} accept="image/*,video/*" multiple />
            
            <Button 
              type='button'
              onClick={() => fileRef.current?.click()} 
              className='w-full mt-1 bg-blue-500 hover:bg-blue-600 gap-2 mb-4'
            >
              <Image size={16} />
              Add Photos or Videos
            </Button>

            {selectedMedia.length > 0 && (
              <>
                {/* Location Selector - Optional */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className='flex items-center justify-between mb-2'>
                    <label className='text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2'>
                      <MapPin size={14} />
                      Location (Optional)
                    </label>
                    {placeName && (
                      <button 
                        onClick={clearLocation}
                        className='text-xs text-red-500 hover:text-red-700'
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {placeName ? `📍 ${placeName}` : 'Click button below to add location'}
                  </p>
                  
                  <Button 
                    variant="outline" 
                    type='button'
                    onClick={() => setLocationModalOpen(true)} 
                    className="w-full text-xs"
                  >
                    {placeName ? 'Change Location' : 'Pick from Map'}
                  </Button>
                </div>

                {loading ? (
                  <Button disabled className="w-full mt-4">
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Uploading {selectedMedia.length} file{selectedMedia.length > 1 ? 's' : ''}...
                  </Button>
                ) : (
                  <Button 
                    onClick={createPostHandler} 
                    type="button" 
                    className="w-full mt-4 bg-blue-500 hover:bg-blue-600"
                  >
                    Post
                  </Button>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Location Picker Modal */}
      <Dialog open={locationModalOpen} onOpenChange={setLocationModalOpen}>
        <DialogContent className="max-w-2xl flex flex-col max-h-[90vh]">
          <DialogHeader className="text-center font-semibold">Select Location</DialogHeader>
          
          {/* Location Search Bar */}
          <div className='flex gap-2 px-4 pb-3'>
            <input
              type='text'
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
              placeholder='Search location...'
              className='flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            <Button 
              type='button'
              onClick={searchLocation}
              className='bg-blue-500 hover:bg-blue-600'
              size='sm'
            >
              Search
            </Button>
          </div>

          <div className='px-4 pb-3'>
            <Button
              type='button'
              variant='outline'
              onClick={handleUseCurrentLocation}
              disabled={locating}
              className='w-full text-xs'
            >
              {locating ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Detecting current location...
                </>
              ) : (
                'Use Current Location'
              )}
            </Button>
          </div>

          <div className='px-4 pb-3'>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                setLocationModalOpen(false);
                setMapPickerOpen(true);
              }}
              className='w-full text-xs'
            >
              Select on Map
            </Button>
          </div>

          {coordinates && (
            <p className='text-xs text-green-700 px-4 pb-2'>
              Selected: {placeName || formatLatLng(coordinates)}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-3 px-4 pb-4">
            <Button 
              variant="outline" 
              type='button'
              onClick={() => setLocationModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type='button'
              onClick={handleConfirmLocation}
              className='bg-blue-500 hover:bg-blue-600 disabled:opacity-50'
            >
              Confirm Location
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Map Picker Modal */}
      <Dialog open={mapPickerOpen} onOpenChange={setMapPickerOpen}>
        <DialogContent className="max-w-6xl w-[95vw] flex flex-col max-h-[92vh]">
          <DialogHeader className="text-center font-semibold">Pick Location on Map</DialogHeader>

          <p className='text-xs text-gray-500 px-1 pb-2'>Click anywhere on the map to select a location.</p>

          <div className="rounded-lg overflow-hidden border h-[65vh] md:h-[72vh]">
            <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {coordinates && <Marker position={coordinates} />}
              <LocationPicker setCoordinates={handleCoordinatePick} />
              <SearchControl onSelect={handleCoordinatePick} />
              <RecenterMap coordinates={coordinates} />
            </MapContainer>
          </div>

          {coordinates && (
            <p className='text-xs text-green-700 pt-2'>
              Selected: {placeName || formatLatLng(coordinates)}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type='button' variant='outline' onClick={() => setMapPickerOpen(false)}>
              Cancel
            </Button>
            <Button
              type='button'
              onClick={() => {
                setMapPickerOpen(false);
              }}
              disabled={!coordinates}
              className='bg-blue-500 hover:bg-blue-600 disabled:opacity-50'
            >
              Use This Location
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreatePost;
