// import React, { useRef, useState, useEffect } from 'react';
// import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
// import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
// import { Textarea } from './ui/textarea';
// import { Button } from './ui/button';
// import { readFileAsDataURL } from '@/lib/utils';
// import { Loader2 } from 'lucide-react';
// import { toast } from 'sonner';
// import axios from 'axios';
// import { useDispatch, useSelector } from 'react-redux';
// import { setPosts } from '@/redux/postSlice';

// import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// import markerIcon from 'leaflet/dist/images/marker-icon.png';
// import markerShadow from 'leaflet/dist/images/marker-shadow.png';


// // Leaflet
// import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';
// import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
// import { useMap } from 'react-leaflet';


// // Leaflet marker icon fix
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: markerIcon2x,
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
// });


// const SearchControl = ({ onSelect }) => {
//   const map = useMap();

//   useEffect(() => {
//     const provider = new OpenStreetMapProvider();

//     const searchControl = new GeoSearchControl({
//       provider,
//       style: 'bar',
//       autoComplete: true,
//       autoCompleteDelay: 250,
//       showMarker: false,
//       showPopup: false,
//       retainZoomLevel: false,
//       animateZoom: true,
//       keepResult: true,
//     });

//     map.addControl(searchControl);

//     map.on('geosearch/showlocation', (result) => {
//       const lat = result.location.y;
//       const lng = result.location.x;
//       onSelect([lat, lng]); // Update marker + reverse geocode
//     });

//     return () => map.removeControl(searchControl);
//   }, [map, onSelect]);

//   return null;
// };



// const LocationPicker = ({ setCoordinates }) => {
//   useMapEvents({
//     click(e) {
//       setCoordinates([e.latlng.lat, e.latlng.lng]);
//     }
//   });
//   return null;
// };

// const CreatePost = ({ open, setOpen }) => {
//   const imageRef = useRef();
//   const [file, setFile] = useState("");
//   const [caption, setCaption] = useState("");
//   const [imagePreview, setImagePreview] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [coordinates, setCoordinates] = useState(null);
//   const [placeName, setPlaceName] = useState('');
//   const { user } = useSelector(store => store.auth);
//   const { posts } = useSelector(store => store.post);
//   const dispatch = useDispatch();

//   const fileChangeHandler = async (e) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setFile(file);
//       const dataUrl = await readFileAsDataURL(file);
//       setImagePreview(dataUrl);
//     }
//   };

//   // Reverse geocode coordinates
//   const reverseGeocode = async ([lat, lng]) => {
//     try {
//       const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
//       const data = await res.json();
//       setPlaceName(data.display_name || '');
//     } catch (err) {
//       console.error('Reverse geocoding failed:', err);
//     }
//   };

//   const handleCoordinatePick = (coords) => {
//     setCoordinates(coords);
//     reverseGeocode(coords);
//   };

//   const createPostHandler = async () => {
//     if (!imagePreview || !coordinates) {
//       toast.error("Please select image and location");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("caption", caption);
//     formData.append("image", file);
//     formData.append("coordinates", JSON.stringify([coordinates[1], coordinates[0]])); // [lng, lat]
//     formData.append("locationName", placeName);

//     try {
//       setLoading(true);
//       const res = await axios.post('http://localhost:8000/api/v1/post/addpost', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//         withCredentials: true
//       });

//       if (res.data.success) {
//         dispatch(setPosts([res.data.post, ...posts]));
//         toast.success(res.data.message);
//         setOpen(false);
//         // Clear form
//         setCaption("");
//         setFile("");
//         setImagePreview("");
//         setCoordinates(null);
//         setPlaceName("");
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to create post.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open}>
//       <DialogContent onInteractOutside={() => setOpen(false)}>
//         <DialogHeader className='text-center font-semibold'>Create New Post</DialogHeader>

//         <div className='flex gap-3 items-center'>
//           <Avatar>
//             <AvatarImage src={user?.profilePicture} alt="img" />
//             <AvatarFallback>CN</AvatarFallback>
//           </Avatar>
//           <div>
//             <h1 className='font-semibold text-xs'>{user?.username}</h1>
//             <span className='text-gray-600 text-xs'>Bio here...</span>
//           </div>
//         </div>

//         <Textarea
//           value={caption}
//           onChange={(e) => setCaption(e.target.value)}
//           className="focus-visible:ring-transparent border-none"
//           placeholder="Write a caption..."
//         />

//         {imagePreview && (
//           <div className='w-full h-64 flex items-center justify-center'>
//             <img src={imagePreview} alt="preview_img" className='object-cover h-full w-full rounded-md' />
//           </div>
//         )}

//         <input ref={imageRef} type='file' className='hidden' onChange={fileChangeHandler} />
//         <Button onClick={() => imageRef.current.click()} className='w-fit mx-auto bg-[#0095F6] hover:bg-[#258bcf]'>Select from computer</Button>

//         {imagePreview && (
//           <>
//             <div className='mt-4'>
//               <h3 className='font-semibold text-sm mb-2'>Click on map to set location:</h3>
//               <div className='h-64 rounded overflow-hidden'>
//                 <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%' }}>
//                   <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//                   {coordinates && <Marker position={coordinates} />}
//                   <LocationPicker setCoordinates={handleCoordinatePick} />
//                   <SearchControl onSelect={handleCoordinatePick} />
//                 </MapContainer>
//               </div>

//               {coordinates && (
//                 <div className="text-xs mt-2 text-gray-700">
//                   <p><strong>Latitude:</strong> {coordinates[0].toFixed(4)}</p>
//                   <p><strong>Longitude:</strong> {coordinates[1].toFixed(4)}</p>
//                   <p><strong>Place:</strong> {placeName || 'Fetching...'}</p>
//                 </div>
//               )}
//             </div>

//             {loading ? (
//               <Button>
//                 <Loader2 className='mr-2 h-4 w-4 animate-spin' />
//                 Please wait
//               </Button>
//             ) : (
//               <Button onClick={createPostHandler} type="submit" className="w-full mt-4">Post</Button>
//             )}
//           </>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default CreatePost;
































// import React, { useRef, useState, useEffect } from 'react';
// import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
// import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
// import { Textarea } from './ui/textarea';
// import { Button } from './ui/button';
// import { readFileAsDataURL } from '@/lib/utils';
// import { Loader2 } from 'lucide-react';
// import { toast } from 'sonner';
// import axios from 'axios';
// import { useDispatch, useSelector } from 'react-redux';
// import { setPosts } from '@/redux/postSlice';

// // Leaflet
// import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';
// import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
// import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// import markerIcon from 'leaflet/dist/images/marker-icon.png';
// import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// // Fix marker icons
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: markerIcon2x,
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
// });

// // Search Control Component
// const SearchControl = ({ onSelect }) => {
//   const map = useMap();
//   useEffect(() => {
//     const provider = new OpenStreetMapProvider();
//     const searchControl = new GeoSearchControl({
//       provider,
//       style: 'bar',
//       autoComplete: true,
//       autoCompleteDelay: 250,
//       showMarker: false,
//       showPopup: false,
//       retainZoomLevel: false,
//       animateZoom: true,
//       keepResult: true,
//     });
//     map.addControl(searchControl);
//     map.on('geosearch/showlocation', (result) => {
//       const lat = result.location.y;
//       const lng = result.location.x;
//       onSelect([lat, lng]);
//     });
//     return () => map.removeControl(searchControl);
//   }, [map, onSelect]);
//   return null;
// };

// // Location Picker
// const LocationPicker = ({ setCoordinates }) => {
//   useMapEvents({
//     click(e) {
//       setCoordinates([e.latlng.lat, e.latlng.lng]);
//     }
//   });
//   return null;
// };

// const CreatePost = ({ open, setOpen }) => {
//   const imageRef = useRef();
//   const [file, setFile] = useState("");
//   const [caption, setCaption] = useState("");
//   const [imagePreview, setImagePreview] = useState("");
//   const [loading, setLoading] = useState(false);

//   const [coordinates, setCoordinates] = useState(null);
//   const [placeName, setPlaceName] = useState('');
//   const [locationModalOpen, setLocationModalOpen] = useState(false);

//   const { user } = useSelector(store => store.auth);
//   const { posts } = useSelector(store => store.post);
//   const dispatch = useDispatch();

//   const fileChangeHandler = async (e) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setFile(file);
//       const dataUrl = await readFileAsDataURL(file);
//       setImagePreview(dataUrl);
//     }
//   };

//   // Reverse geocode
//   const reverseGeocode = async ([lat, lng]) => {
//     try {
//       const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
//       const data = await res.json();
//       setPlaceName(data.display_name || '');
//     } catch (err) {
//       console.error('Reverse geocoding failed:', err);
//     }
//   };

//   const handleCoordinatePick = (coords) => {
//     setCoordinates(coords);
//     reverseGeocode(coords);
//   };

//   const createPostHandler = async () => {
//     if (!imagePreview || !coordinates) {
//       toast.error("Please select image and location");
//       return;
//     }
//     const formData = new FormData();
//     formData.append("caption", caption);
//     formData.append("image", file);
//     formData.append("coordinates", JSON.stringify([coordinates[1], coordinates[0]])); // lng, lat
//     formData.append("locationName", placeName);
//     try {
//       setLoading(true);
//       const res = await axios.post('http://localhost:8000/api/v1/post/addpost', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//         withCredentials: true
//       });
//       if (res.data.success) {
//         dispatch(setPosts([res.data.post, ...posts]));
//         toast.success(res.data.message);
//         setOpen(false);
//         setCaption("");
//         setFile("");
//         setImagePreview("");
//         setCoordinates(null);
//         setPlaceName("");
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to create post.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       {/* Main Post Dialog */}
//       <Dialog open={open}>
//         <DialogContent onInteractOutside={() => setOpen(false)}>
//           <DialogHeader className='text-center font-semibold'>Create New Post</DialogHeader>

//           <div className='flex gap-3 items-center'>
//             <Avatar>
//               <AvatarImage src={user?.profilePicture} alt="img" />
//               <AvatarFallback>CN</AvatarFallback>
//             </Avatar>
//             <div>
//               <h1 className='font-semibold text-xs'>{user?.username}</h1>
//               <span className='text-gray-600 text-xs'>Bio here...</span>
//             </div>
//           </div>

//           <Textarea
//             value={caption}
//             onChange={(e) => setCaption(e.target.value)}
//             className="focus-visible:ring-transparent border-none"
//             placeholder="Write a caption..."
//           />

//           {imagePreview && (
//             <div className='w-full h-64 flex items-center justify-center'>
//               <img src={imagePreview} alt="preview_img" className='object-cover h-full w-full rounded-md' />
//             </div>
//           )}

//           <input ref={imageRef} type='file' className='hidden' onChange={fileChangeHandler} />
//           <Button onClick={() => imageRef.current.click()} className='w-fit mx-auto bg-[#0095F6] hover:bg-[#258bcf]'>
//             Select from computer
//           </Button>

//           {imagePreview && (
//             <>
//               {/* Location Selector */}
//               <div className="mt-4">
//                 <p className="text-xs text-gray-700 mb-1">
//                   {placeName ? `Location: ${placeName}` : 'No location selected'}
//                 </p>
//                 <Button variant="outline" onClick={() => setLocationModalOpen(true)}>
//                   Pick Location
//                 </Button>
//               </div>

//               {loading ? (
//                 <Button className="w-full mt-4">
//                   <Loader2 className='mr-2 h-4 w-4 animate-spin' />
//                   Please wait
//                 </Button>
//               ) : (
//                 <Button onClick={createPostHandler} type="submit" className="w-full mt-4">
//                   Post
//                 </Button>
//               )}
//             </>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Location Picker Modal */}
//       <Dialog open={locationModalOpen} onOpenChange={setLocationModalOpen}>
//         <DialogContent className="max-w-3xl">
//           <DialogHeader className="text-center font-semibold">Select Location</DialogHeader>
//           <div className="h-[500px]">
//             <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%' }}>
//               <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//               {coordinates && <Marker position={coordinates} />}
//               <LocationPicker setCoordinates={handleCoordinatePick} />
//               <SearchControl onSelect={handleCoordinatePick} />
//             </MapContainer>
//           </div>
//           <div className="flex justify-end mt-3">
//             <Button onClick={() => setLocationModalOpen(false)}>Confirm</Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// };

// export default CreatePost;








































import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { readFileAsDataURL, getUserInitials } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '@/redux/postSlice';

// Leaflet
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
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
  const imageRef = useRef();
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  const [coordinates, setCoordinates] = useState(null);
  const [placeName, setPlaceName] = useState('');
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const { user } = useSelector(store => store.auth);
  const { posts } = useSelector(store => store.post);
  const dispatch = useDispatch();

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const dataUrl = await readFileAsDataURL(file);
      setImagePreview(dataUrl);
    }
  };

  // Reverse geocode
  const reverseGeocode = async ([lat, lng]) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      setPlaceName(data.display_name || '');
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
    }
  };

  const handleCoordinatePick = (coords) => {
    setCoordinates(coords);
    reverseGeocode(coords);
  };

  const createPostHandler = async () => {
    if (!imagePreview || !coordinates) {
      toast.error("Please select image and location");
      return;
    }
    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("image", file);
    formData.append("coordinates", JSON.stringify([coordinates[1], coordinates[0]])); // lng, lat
    formData.append("locationName", placeName);
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:8000/api/v1/post/addpost', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]));
        toast.success(res.data.message);
        setOpen(false);
        setCaption("");
        setFile("");
        setImagePreview("");
        setCoordinates(null);
        setPlaceName("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Main Post Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader className='text-center font-semibold text-gray-900 dark:text-white'>Create New Post</DialogHeader>

          <div className='flex gap-3 items-center'>
            <Avatar>
              <AvatarImage src={user?.profilePicture} alt="img" />
              <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold">
                {getUserInitials(user?.username)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className='font-semibold text-xs text-gray-900 dark:text-white'>{user?.username}</h1>
              <span className='text-gray-600 dark:text-gray-400 text-xs'>Bio here...</span>
            </div>
          </div>

          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="focus-visible:ring-transparent border-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Write a caption..."
          />

          {imagePreview && (
            <div className='w-full h-64 flex items-center justify-center'>
              <img src={imagePreview} alt="preview_img" className='object-cover h-full w-full rounded-md' />
            </div>
          )}

          <input ref={imageRef} type='file' className='hidden' onChange={fileChangeHandler} />
          <Button onClick={() => imageRef.current.click()} className='w-fit mx-auto bg-[#0095F6] hover:bg-[#258bcf]'>
            Select from computer
          </Button>

          {imagePreview && (
            <>
              {/* Location Selector */}
              <div className="mt-4">
                <p className="text-xs text-gray-700 dark:text-gray-300 mb-1">
                  {placeName ? `Location: ${placeName}` : 'No location selected'}
                </p>
                <Button variant="outline" onClick={() => setLocationModalOpen(true)} className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                  Pick Location
                </Button>
              </div>

              {loading ? (
                <Button className="w-full mt-4">
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Please wait
                </Button>
              ) : (
                <Button onClick={createPostHandler} type="submit" className="w-full mt-4">
                  Post
                </Button>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Location Picker Modal */}
      <Dialog open={locationModalOpen} onOpenChange={setLocationModalOpen}>
        <DialogContent className="max-w-3xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader className="text-center font-semibold text-gray-900 dark:text-white">Select Location</DialogHeader>
          <div className="h-[500px]">
            <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {coordinates && <Marker position={coordinates} />}
              <LocationPicker setCoordinates={handleCoordinatePick} />
              <SearchControl onSelect={handleCoordinatePick} />
            </MapContainer>
          </div>
          {placeName && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 text-center px-2">
              Selected: {placeName}
            </p>
          )}
          <div className="flex justify-end mt-3">
            <Button
              onClick={() => {
                if (!coordinates) {
                  toast.error("Please select a location first");
                  return;
                }
                setLocationModalOpen(false);
              }}
              className="bg-[#0095F6] hover:bg-[#258bcf] text-white"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreatePost;
