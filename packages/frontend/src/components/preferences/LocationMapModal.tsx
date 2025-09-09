import React, { useState, useEffect, useRef } from "react";

declare const L: any;

interface LocationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: { latitude: number; longitude: number };
  onSave: (newLocation: { lat: number; lng: number }) => void;
}

export const LocationMapModal: React.FC<LocationMapModalProps> = ({
  isOpen,
  onClose,
  location,
  onSave,
}) => {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [currentPos, setCurrentPos] = useState({
    lat: location.latitude,
    lng: location.longitude,
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (document.getElementById("map") && !mapRef.current) {
          const map = L.map("map").setView(
            [location.latitude, location.longitude],
            14
          );
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(map);

          const marker = L.marker([location.latitude, location.longitude], {
            draggable: true,
          }).addTo(map);
          marker.on("dragend", (event: any) => {
            const newPos = event.target.getLatLng();
            setCurrentPos({ lat: newPos.lat, lng: newPos.lng });
          });

          mapRef.current = map;
          markerRef.current = marker;
        } else if (mapRef.current) {
          mapRef.current.setView([location.latitude, location.longitude], 14);
          markerRef.current.setLatLng([location.latitude, location.longitude]);
        }
      }, 100);
    } else if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  }, [isOpen, location]);

  const handleSave = () => {
    onSave(currentPos);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">
            Adjust Your Location
          </h3>
          <p className="text-sm text-slate-400">
            Drag the marker to your desired starting point.
          </p>
        </div>
        <div
          id="map"
          style={{
            height: "400px",
            width: "100%",
            filter: "invert(1) hue-rotate(180deg)",
          }}
        ></div>
        <div className="p-4 bg-slate-800/50 border-t border-slate-700 flex justify-end gap-3">
          <p className="text-sm text-slate-300 mr-auto flex items-center">
            Lat: {currentPos.lat.toFixed(4)}, Lng: {currentPos.lng.toFixed(4)}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 border border-slate-600 rounded-md hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};