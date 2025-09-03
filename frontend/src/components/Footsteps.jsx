// src/pages/Footsteps.jsx
import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { Loader2 } from "lucide-react";
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
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const boundsRef = useRef([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/post/footsteps", {
          withCredentials: true,
        });
        // Expect res.data.posts to be an array of objects like:
        // { _id, caption, imageUrl, coordinates: [lon, lat], locationName }
        const data = res.data?.posts || [];
        setPosts(data);
      } catch (err) {
        console.error("Failed to load footsteps posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

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

  return (
    <div style={{ width: "100vw", height: "100vh" }} className="bg-white dark:bg-gray-900 transition-colors duration-200">
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
                <Popup minWidth={220}>
                  <div style={{ width: 220 }} className="bg-white dark:bg-gray-800 rounded-lg p-2">
                    <img src={img} alt={post.caption || "post"} style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 8 }} />
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }} className="text-gray-900 dark:text-white">{post.locationName || post.location?.name || "Unknown place"}</div>
                      {post.caption && <div style={{ fontSize: 13, marginTop: 6 }} className="text-gray-700 dark:text-gray-300">{post.caption}</div>}
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
