import React, { useState, useEffect, useRef } from "react";

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
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerInstance = useRef<google.maps.Marker | null>(null);
  const [currentPos, setCurrentPos] = useState({
    lat: location.latitude,
    lng: location.longitude,
  });

  useEffect(() => {
    if (isOpen && mapRef.current && !mapInstance.current) {
      const mapOptions = {
        center: { lat: location.latitude, lng: location.longitude },
        zoom: 14,
        disableDefaultUI: true,
      };
      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      const marker = new window.google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map,
        draggable: true,
      });

      marker.addListener("dragend", (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          setCurrentPos({ lat: event.latLng.lat(), lng: event.latLng.lng() });
        }
      });

      mapInstance.current = map;
      markerInstance.current = marker;
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
          ref={mapRef}
          style={{
            height: "400px",
            width: "100%",
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