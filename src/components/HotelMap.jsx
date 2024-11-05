import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const FALLBACK_POSITION = [6.5244, 3.3792];
const API_BASE_URL = 'http://localhost:3000';

const HotelMap = ({ hotel }) => {
  const [position, setPosition] = useState(FALLBACK_POSITION);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoordinates = async () => {
      const address = `${hotel.address.street}, ${hotel.address.area}, ${hotel.address.city}, ${hotel.address.country}`;
      try {
        setIsLoading(true);
        
        const response = await axios.get(`${API_BASE_URL}/api/geocode`, {
          params: { address },
          withCredentials: true
        });
        
        if (response.data && response.data.lat && response.data.lon) {
          const lat = parseFloat(response.data.lat);
          const lon = parseFloat(response.data.lon);
          if (!isNaN(lat) && !isNaN(lon)) {
            console.log('Setting position to:', [lat, lon]);
            setPosition([lat, lon]);
          } else {
            throw new Error(`Invalid coordinates received: lat=${lat}, lon=${lon}`);
          }
        } else if (response.data && response.data.error) {
          throw new Error(response.data.error);
        } else {
          throw new Error('Unexpected response format from geocoding service');
        }
      } catch (error) {
        console.error('Error fetching coordinates:', error);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          console.error('Response headers:', error.response.headers);
        } else if (error.request) {
          console.error('No response received:', error.request);
        } else {
          console.error('Error message:', error.message);
        }
        setError(`Failed to load map location: ${error.message}`);
        setPosition(FALLBACK_POSITION);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoordinates();
  }, [hotel]);

  if (isLoading) return <div className="text-center py-4">Loading map...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

  return (
    <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]">
      <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position}>
          <Popup>
            {hotel.name}<br/>
            {hotel.address.street}, {hotel.address.area}<br/>
            {hotel.address.city}, {hotel.address.country}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default HotelMap;