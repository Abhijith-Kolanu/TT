import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { readFileAsDataURL } from '@/lib/utils';
import { Loader2, Image, MapPin, X } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '@/redux/postSlice';

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

const CreatePost = ({ open, setOpen }) => {
  const fileRef = useRef();
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [mediaPreview, setMediaPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [mediaType, setMediaType] = useState('image');
  const [coordinates, setCoordinates] = useState(null);
  const [placeName, setPlaceName] = useState('');
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationInput, setLocationInput] = useState('');

  const { user } = useSelector(store => store.auth);
  const { posts } = useSelector(store => store.post);
  const dispatch = useDispatch();

  const fileChangeHandler = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file size
      const maxSize = 50 * 1024 * 1024; // 50MB for now
      if (selectedFile.size > maxSize) {
        toast.error('File size too large. Maximum 50MB allowed.');
        return;
      }

      if (selectedFile.type.startsWith('image/')) {
        setMediaType('image');
      } else if (selectedFile.type.startsWith('video/')) {
        setMediaType('video');
      } else {
        toast.error('Please select an image or video file');
        return;
      }

      setFile(selectedFile);
      const dataUrl = await readFileAsDataURL(selectedFile);
      setMediaPreview(dataUrl);
    }
  };

  const reverseGeocode = async ([lat, lng]) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      setPlaceName(data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      setLocationInput(data.display_name || '');
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
      setPlaceName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const handleCoordinatePick = (coords) => {
    setCoordinates(coords);
    reverseGeocode(coords);
  };

  const searchLocation = async () => {
    if (!locationInput.trim()) return;
    
    try {
      const provider = new OpenStreetMapProvider();
      const results = await provider.search({ query: locationInput });
      
      if (results && results.length > 0) {
        const { x: lng, y: lat } = results[0];
        handleCoordinatePick([lat, lng]);
        setLocationModalOpen(false);
      } else {
        toast.error('Location not found');
      }
    } catch (err) {
      console.error('Location search failed:', err);
      toast.error('Failed to search location');
    }
  };

  const clearLocation = () => {
    setCoordinates(null);
    setPlaceName('');
    setLocationInput('');
  };

  const createPostHandler = async () => {
    if (!mediaPreview) {
      toast.error("Please select an image or video");
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append('image', file);
    
    // Location is now optional
    if (coordinates && placeName) {
      formData.append("coordinates", JSON.stringify([coordinates[1], coordinates[0]]));
      formData.append("locationName", placeName);
    }

    try {
      setLoading(true);
      const timeout = mediaType === 'video' ? 10 * 60 * 1000 : 30 * 1000;
      
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/post/addpost`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
        timeout: timeout
      });

      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]));
        toast.success(res.data.message);
        setOpen(false);
        setCaption("");
        setFile("");
        setMediaPreview("");
        setCoordinates(null);
        setPlaceName("");
        setLocationInput("");
        setMediaType('image');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open}>
        <DialogContent 
          onInteractOutside={() => setOpen(false)}
          className="max-h-[90vh] flex flex-col p-0"
        >
          <DialogHeader className='text-center font-semibold p-4 border-b'>Create New Post</DialogHeader>

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

            <div className='flex gap-3 items-center mb-4'>
              <Avatar>
                <AvatarImage src={user?.profilePicture} alt="img" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div>
                <h1 className='font-semibold text-xs'>{user?.username}</h1>
                <span className='text-gray-600 text-xs'>Bio here...</span>
              </div>
            </div>

            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="focus-visible:ring-transparent border-none resize-none"
              placeholder="Write a caption..."
            />

            {mediaPreview && (
              <div className='w-full h-64 flex items-center justify-center bg-gray-100 rounded-md overflow-hidden my-4'>
                {mediaType === 'image' ? (
                  <img src={mediaPreview} alt="preview_img" className='object-cover h-full w-full' />
                ) : (
                  <video src={mediaPreview} controls className='object-cover h-full w-full' />
                )}
              </div>
            )}

            <input ref={fileRef} type='file' className='hidden' onChange={fileChangeHandler} accept="image/*,video/*" />
            
            <Button 
              onClick={() => fileRef.current?.click()} 
              className='w-full bg-[#0095F6] hover:bg-[#258bcf] gap-2 mb-4'
            >
              <Image size={16} />
              Add Photo or Video
            </Button>

            {mediaPreview && (
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
                    onClick={() => setLocationModalOpen(true)} 
                    className="w-full text-xs"
                  >
                    {placeName ? 'Change Location' : 'Pick from Map'}
                  </Button>
                </div>

                {loading ? (
                  <Button disabled className="w-full mt-4">
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Uploading...
                  </Button>
                ) : (
                  <Button 
                    onClick={createPostHandler} 
                    type="submit" 
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
        <DialogContent className="max-w-3xl flex flex-col max-h-[90vh]">
          <DialogHeader className="text-center font-semibold">Select Location</DialogHeader>
          
          {/* Location Search Bar */}
          <div className='flex gap-2 px-4 pb-3'>
            <input
              type='text'
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
              placeholder='Search location...'
              className='flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            <Button 
              onClick={searchLocation}
              className='bg-blue-500 hover:bg-blue-600'
              size='sm'
            >
              Search
            </Button>
          </div>

          <p className='text-xs text-gray-500 px-4 pb-2'>Or click on the map to select a location</p>

          {/* Map */}
          <div className="flex-1 rounded-lg overflow-hidden border">
            <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {coordinates && <Marker position={coordinates} />}
              <LocationPicker setCoordinates={handleCoordinatePick} />
              <SearchControl onSelect={handleCoordinatePick} />
            </MapContainer>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-3 px-4 pb-4">
            <Button 
              variant="outline" 
              onClick={() => setLocationModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => setLocationModalOpen(false)}
              disabled={!coordinates}
              className='bg-blue-500 hover:bg-blue-600 disabled:opacity-50'
            >
              Confirm Location
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreatePost;
