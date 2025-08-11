import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import 'leaflet/dist/leaflet.css';

function LocationMarker({ onSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect(e.latlng); // Pass coords up
    }
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function LocationPickerModal({ onConfirm, onClose }) {
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <div className="modal">
      <MapContainer center={[20, 0]} zoom={2} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onSelect={setSelectedLocation} />
      </MapContainer>

      <button
        onClick={() => {
          if (selectedLocation) {
            onConfirm(selectedLocation); // Pass coords to parent
            onClose();
          }
        }}
      >
        Confirm
      </button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}
