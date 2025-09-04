// src/pages/Footsteps.jsx
import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { Loader2, Globe, Lock, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import MarkerClusterGroup from "react-leaflet-cluster";

// Fix default marker paths (Vite-friendly)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// small helper to create thumbnail icon
const createThumbnailIcon = (imageUrl) =>
  L.divIcon({
    html: `<div style="width:44px;height:44px;border-radius:50%;overflow:hidden;border:2px solid white;box-shadow:0 0 6px rgba(0,0,0,0.25)">
             <img src="${imageUrl}" style="width:100%;height:100%;object-fit:cover"/>
           </div>`,
    className: "",
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -40],
  });

// component to auto-fit map to markers
const FitBounds = ({ bounds }) => {
  const map = useMap();
  if (!bounds || bounds.length === 0) return null;
  // run after map init
  setTimeout(() => {
    try {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    } catch (e) {
      // ignore
    }
  }, 0);
  return null;
};

const Footsteps = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-blue-950 dark:to-green-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <Globe className="mx-auto h-16 w-16 text-blue-600 dark:text-blue-400 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Footsteps - Interactive Map
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            This feature requires map dependencies to be installed. The Footsteps interactive map will show your travel locations and posts.
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <p className="text-yellow-800 dark:text-yellow-200">
              📍 Map functionality temporarily unavailable while dependencies are being resolved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const mode = isPublicMode ? 'public' : 'private';
        console.log('🔍 Fetching footsteps - Mode:', mode, 'User:', user?.username);
        
        // Check if user is authenticated
        if (!user) {
          console.warn('⚠️ User not authenticated, cannot fetch footsteps');
          setPosts([]);
          setLoading(false);
          return;
        }
        
        const res = await axios.get(`http://localhost:8000/api/v1/post/footsteps?mode=${mode}`, {
          withCredentials: true,
        });
        
        const data = res.data?.posts || [];
        console.log('📍 Received', data.length, 'footsteps posts');
        console.log('🔍 API Response:', res.data);
        setPosts(data);
      } catch (err) {
        console.error("❌ Failed to load footsteps posts:", err.response?.data || err.message);
        
        // Check if it's an authentication error
        if (err.response?.status === 401) {
          console.error("🔒 Authentication failed - user may need to log in again");
        }
        
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [isPublicMode, user]);

  // build bounds from returned coordinates
  boundsRef.current = posts
    .map((p) => p.coordinates)
    .filter(Boolean)
    .map(([lon, lat]) => [lat, lon]); // leaflet expects [lat, lon]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Show authentication message if user is not logged in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please log in to view footsteps on the map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 lg:left-64 bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Toggle Button - Bottom-left, completely safe from map controls */}
      <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-2">
        <Button
          onClick={() => {
            console.log('🔄 Toggle clicked! Switching from', isPublicMode ? 'PUBLIC' : 'PRIVATE', 'to', isPublicMode ? 'PRIVATE' : 'PUBLIC');
            setIsPublicMode(prev => !prev);
          }}
          variant={isPublicMode ? "default" : "outline"}
          size="lg"
          className={`flex items-center gap-2 transition-all duration-200 shadow-xl font-semibold ${
            isPublicMode 
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl border-2 border-blue-600' 
              : 'bg-red-600 hover:bg-red-700 text-white shadow-xl border-2 border-red-600'
          }`}
        >
          {isPublicMode ? (
            <>
              <Globe size={18} />
              Public
            </>
          ) : (
            <>
              <Lock size={18} />
              Private
            </>
          )}
        </Button>
        
        {/* Posts Counter - Above toggle button */}
        <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 order-first">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {posts.length} {posts.length === 1 ? 'footstep' : 'footsteps'} 
            {isPublicMode ? ' (Everyone)' : ' (Your posts)'}
          </span>
        </div>
      </div>

      <MapContainer center={[20, 0]} zoom={2} style={{ width: "100%", height: "100%" }} scrollWheelZoom>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

        <MarkerClusterGroup chunkedLoading spiderfyOnMaxZoom showCoverageOnHover={false} maxClusterRadius={60}>
          {posts.map((post) => {
            if (!post?.coordinates || post.coordinates.length !== 2) return null;
            const [lon, lat] = post.coordinates;
            // fallback image URL handling (in case backend returned imageUrl)
            const img = post.imageUrl || post.image || "";
            return (
              <Marker key={post._id} position={[lat, lon]} icon={createThumbnailIcon(img)}>
                <Popup minWidth={260}>
                  <div style={{ width: 260 }} className="bg-white dark:bg-gray-800 rounded-lg p-2">
                    <div 
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/post/${post._id}`);
                      }}
                    >
                      <img 
                        src={img} 
                        alt={post.caption || "post"} 
                        style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 8 }} 
                        className="hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }} className="text-gray-900 dark:text-white">
                        {post.locationName || post.location?.name || "Unknown place"}
                      </div>
                      {post.caption && (
                        <div style={{ fontSize: 13, marginTop: 6 }} className="text-gray-700 dark:text-gray-300 line-clamp-2">
                          {post.caption}
                        </div>
                      )}
                      {post.author && (
                        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #e5e7eb" }} className="flex items-center justify-between dark:border-gray-600">
                          <div className="flex items-center gap-2">
                            <img 
                              src={post.author.profilePicture || "/default-avatar.png"} 
                              alt={post.author.username}
                              style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }}
                              className="border border-gray-200 dark:border-gray-600 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/profile/${post.author._id}`);
                              }}
                            />
                            <span 
                              style={{ fontSize: 12, fontWeight: 600 }} 
                              className="text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/profile/${post.author._id}`);
                              }}
                            >
                              {post.author.username}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/post/${post._id}`);
                            }}
                            className="h-6 px-2 text-xs flex items-center gap-1 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20"
                          >
                            <ExternalLink size={10} />
                            View Post
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>

        {/* Fit map to markers if there are any */}
        <FitBounds bounds={boundsRef.current} />
      </MapContainer>
    </div>
  );
};

export default Footsteps;
