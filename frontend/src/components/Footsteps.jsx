// src/pages/Footsteps.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";
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

// Small helper to create marker icon with optional count badge.
const createThumbnailIcon = (imageUrl, count = 1) =>
  L.divIcon({
    html: `<div style="position:relative;width:44px;height:44px;">
             <div style="width:44px;height:44px;border-radius:50%;overflow:hidden;border:2px solid white;box-shadow:0 0 6px rgba(0,0,0,0.25)">
               <img src="${imageUrl}" style="width:100%;height:100%;object-fit:cover"/>
             </div>
             ${count > 1 ? `<div style="position:absolute;right:-6px;top:-6px;min-width:20px;height:20px;padding:0 5px;border-radius:999px;background:#1d4ed8;color:#fff;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;line-height:1;">${count}</div>` : ""}
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
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPublicMode, setIsPublicMode] = useState(true);
  const { user } = useSelector(store => store.auth);
  const navigate = useNavigate();
  const boundsRef = useRef([]);

  const groupedPosts = useMemo(() => {
    const groups = new Map();

    for (const post of posts) {
      if (!post?.coordinates || post.coordinates.length !== 2) continue;

      const [lon, lat] = post.coordinates;
      const coordKey = `${Number(lon).toFixed(5)}:${Number(lat).toFixed(5)}`;

      if (!groups.has(coordKey)) {
        groups.set(coordKey, {
          key: coordKey,
          coordinates: [lon, lat],
          locationName: post.locationName || post.location?.name || "Unknown place",
          posts: [],
        });
      }

      groups.get(coordKey).posts.push(post);
    }

    return Array.from(groups.values());
  }, [posts]);

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
        
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/post/footsteps?mode=${mode}`, {
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
  boundsRef.current = groupedPosts
    .map((g) => g.coordinates)
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
      {/* Mode selector - Bottom-left, explicit state selection */}
      <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-white/95 dark:bg-gray-800/95 p-2 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
          <Button
            onClick={() => setIsPublicMode(true)}
            size="sm"
            className={`flex items-center gap-2 font-semibold transition-all duration-200 ${
              isPublicMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-600'
                : 'bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 dark:bg-gray-900 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-900/20'
            }`}
          >
            <Globe size={16} />
            Public
          </Button>

          <Button
            onClick={() => setIsPublicMode(false)}
            size="sm"
            className={`flex items-center gap-2 font-semibold transition-all duration-200 ${
              !isPublicMode
                ? 'bg-red-600 hover:bg-red-700 text-white border border-red-600'
                : 'bg-white hover:bg-red-50 text-red-700 border border-red-200 dark:bg-gray-900 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900/20'
            }`}
          >
            <Lock size={16} />
            Private
          </Button>
        </div>
        
        {/* Posts Counter - Above toggle button */}
        <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 order-first">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {posts.length} {posts.length === 1 ? 'footstep' : 'footsteps'} 
            {isPublicMode ? ' (Following + you)' : ' (Your posts)'}
          </span>
        </div>
      </div>

      <MapContainer center={[20, 0]} zoom={2} style={{ width: "100%", height: "100%" }} scrollWheelZoom>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

        <MarkerClusterGroup
          chunkedLoading
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          maxClusterRadius={35}
          disableClusteringAtZoom={4}
        >
          {groupedPosts.map((group) => {
            const [lon, lat] = group.coordinates;
            const primaryPost = group.posts[0];
            const primaryImg = primaryPost?.imageUrl || primaryPost?.image || primaryPost?.video || "";

            return (
              <Marker
                key={group.key}
                position={[lat, lon]}
                icon={createThumbnailIcon(primaryImg, group.posts.length)}
              >
                <Popup minWidth={group.posts.length > 1 ? 320 : 260}>
                  {group.posts.length === 1 ? (
                    <div style={{ width: 260 }} className="bg-white dark:bg-gray-800 rounded-lg p-2">
                      <div
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/post/${primaryPost._id}`);
                        }}
                      >
                        <img
                          src={primaryImg}
                          alt={primaryPost.caption || "post"}
                          style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 8 }}
                          className="hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }} className="text-gray-900 dark:text-white">
                          {group.locationName}
                        </div>
                        {primaryPost.caption && (
                          <div style={{ fontSize: 13, marginTop: 6 }} className="text-gray-700 dark:text-gray-300 line-clamp-2">
                            {primaryPost.caption}
                          </div>
                        )}
                        {primaryPost.author && (
                          <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #e5e7eb" }} className="flex items-center justify-between dark:border-gray-600">
                            <div className="flex items-center gap-2">
                              <img
                                src={primaryPost.author.profilePicture || "/default-avatar.png"}
                                alt={primaryPost.author.username}
                                style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }}
                                className="border border-gray-200 dark:border-gray-600 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all duration-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/profile/${primaryPost.author._id}`);
                                }}
                              />
                              <span
                                style={{ fontSize: 12, fontWeight: 600 }}
                                className="text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/profile/${primaryPost.author._id}`);
                                }}
                              >
                                {primaryPost.author.username}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/post/${primaryPost._id}`);
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
                  ) : (
                    <div style={{ width: 320 }} className="bg-white dark:bg-gray-800 rounded-lg p-2">
                      <div className="mb-2">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {group.locationName}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">
                          {group.posts.length} posts at this location
                        </div>
                      </div>

                      <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                        {group.posts.map((post) => {
                          const img = post.imageUrl || post.image || post.video || "";
                          return (
                            <div
                              key={post._id}
                              className="flex items-center gap-2 p-2 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/post/${post._id}`);
                              }}
                            >
                              <img
                                src={img}
                                alt={post.caption || "post"}
                                className="w-12 h-12 rounded-md object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                                  {post.author?.username || "Unknown user"}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                  {post.caption || "No caption"}
                                </div>
                              </div>
                              <ExternalLink size={12} className="text-gray-500" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
