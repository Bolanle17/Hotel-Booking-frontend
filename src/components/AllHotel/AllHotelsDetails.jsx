import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEcom } from "../../context/EcomContext";
import { AuthContext } from "../../context/AuthContext";
import RoomFeatured from "../RoomFeatured";
import HotelMap from "../HotelMap";
 
const AllHotelsDetails = () => {
  const { allHotels, showNotification} = useEcom();
  const navigate = useNavigate();
  const { state } = useContext(AuthContext);
  const location = useLocation();
  const [filteredHotels, setFilteredHotels] = useState(allHotels);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchTerm = searchParams.get('search');

    if (searchTerm) {
      const filtered = allHotels.filter((hotel) =>
        hotel.address.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.address.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredHotels(filtered);
    } else {
      setFilteredHotels(allHotels);
    }
  }, [location.search, allHotels]);
   
  
  const handleBookNow = async (hotel, room) => {
    const available = await handleCheckAvailability([room]); /////
    if (available) {
      navigate("/checkin", { state: { roomType: { ...room, hotel: hotel.name } } });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 text-center">All Hotels and Rooms</h1>
        
       
      <div className="flex justify-between mb-6">
        <input
          type="date"
          value={checkInDate}
          onChange={(e) => setCheckInDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded"
        />
        <input
          type="date"
          value={checkOutDate}
          onChange={(e) => setCheckOutDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded"
        />
      </div>

      {filteredHotels.length > 0 ? (
        filteredHotels.map((hotel) => (
          <div key={hotel._id} className="mb-16">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-6 text-center">{hotel.name}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div>
                {hotel.img ? (
                  <>
                    <img 
                      src={`https://hotel-booking-api-p8if.onrender.com/${hotel.img}`} 
                      alt={hotel.name} 
                      className="w-full h-48 md:h-64 lg:h-96 object-cover rounded-lg shadow-lg mb-4" 
                    />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {hotel.gallery && hotel.gallery.map((img, index) => (
                        <img 
                          key={`hotel-${hotel._id}-img-${index}`} 
                          src={`https://hotel-booking-api-p8if.onrender.com/${img}`} 
                          alt={`${hotel.name} ${index + 1}`} 
                          className="w-full h-24 md:h-32 object-cover rounded shadow" 
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-48 md:h-64 lg:h-96 bg-gray-200 flex items-center justify-center rounded-lg shadow-lg mb-4">
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm md:text-base lg:text-lg mb-6">{hotel.description}</p>
                <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-4">Amenities</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                  {hotel.amenities && hotel.amenities.map((amenity, index) => (
                    <li key={`hotel-${hotel._id}-amenity-${index}`} className="flex items-center">
                      <svg className="w-4 h-4 md:w-5 md:h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      {amenity}
                    </li>
                  ))}
                </ul>
                <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-4">Location</h3>
                <p className="text-sm md:text-base">{`${hotel.address?.street}, ${hotel.address?.area}, ${hotel.address?.city}, ${hotel.address?.country}`}</p>
                <HotelMap hotel={hotel} />
              </div>
            </div>
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-6">Available Rooms</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {hotel.rooms && hotel.rooms.length > 0 ? (
                hotel.rooms.map((room) => (
                  <div key={room._id} className="border p-4 rounded-lg shadow-lg flex flex-col">
                    <button 
                      onClick={() => setSelectedRoom(room)}
                      className="w-full"
                    >
                      {room.image ? (
                        <img 
                          src={`https://hotel-booking-api-p8if.onrender.com/${room.image}`} 
                          alt={room.roomType} 
                          className="w-full h-32 sm:h-48 object-cover rounded mb-4" 
                        />
                      ) : (
                        <div className="w-full h-32 sm:h-48 bg-gray-200 flex items-center justify-center rounded mb-4">
                          <p className="text-gray-500">No image available</p>
                        </div>
                      )}
                    </button>
                    <h4 className="text-lg font-bold mb-2">{room.roomType}</h4>
                    <p className="text-base font-bold mb-4">₦{room.price} per night</p>
                    <button
                      onClick={() => handleBookNow(hotel, room)}
                      className="mt-auto bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Book Now
                    </button>
                  </div>
                ))
              ) : (
                <p className="col-span-full text-center text-gray-500">No rooms available for this hotel.</p>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">No hotels found.</p>
      )}
      {selectedRoom && (
        <RoomFeatured 
          key={selectedRoom._id}
          room={selectedRoom}
          hotelName={filteredHotels.find(hotel => hotel.rooms.some(r => r._id === selectedRoom._id))?.name}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </div>
  );
};

export default AllHotelsDetails;