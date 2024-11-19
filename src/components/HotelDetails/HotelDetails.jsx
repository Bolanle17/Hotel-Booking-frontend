import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEcom } from "../../context/EcomContext";
import { AuthContext } from "../../context/AuthContext";
import RoomFeatured from "../RoomFeatured";
import HotelMap from "../HotelMap";

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useContext(AuthContext);
  const { allHotels, getHotelById, fetchRooms, rooms } = useEcom();
  
  const [hotel, setHotel] = useState(null);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const foundHotel = allHotels.find((h) => h._id === id);
        if (foundHotel) {
          setHotel(foundHotel);
        } else {
          const fetchedHotel = await getHotelById(id);
          if (!fetchedHotel) throw new Error('Hotel not found');
          setHotel(fetchedHotel);
        }
        await fetchRooms();
      } catch (error) {
        console.error("Error fetching hotel details:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, allHotels]);

  useEffect(() => {
    if (rooms && hotel) {
      const hotelRooms = rooms.filter((room) => room.hotelId === hotel._id);
      setFilteredRooms(hotelRooms);
    }
  }, [rooms, hotel]);


  //////////////////
  const handleCheckAvailability = async (rooms) => {
    if (!checkInDate || !checkOutDate) {
      alert("Please select check-in and check-out dates");
      return;
    }

    const roomAvailability = await fetch("/api/booking/check-room-availability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rooms,
        checkInDate,
        checkOutDate,
      }),
    });

    const result = await roomAvailability.json();

    if (result.success) {
      return true;
    } else {
      alert(result.message);
      return false;
    }
  };


  const handleBookNow = async (room) => {
    const available = await handleCheckAvailability([room]);
    if (available) {
      navigate("/checkin", { state: { roomType: { ...room, hotel: hotel.name } } });
    }
  };

  
  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;
  if (error) return <div className="container mx-auto px-4 py-8">Error: {error}</div>;
  if (!hotel) return <div className="container mx-auto px-4 py-8">Hotel not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 text-center">{hotel.name}</h2>
       
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

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div>
          <img
            src={`https://hotel-booking-api-p8if.onrender.com/${hotel.img}`}
            alt={hotel.name}
            className="w-full h-48 md:h-64 lg:h-96 object-cover rounded-lg shadow-lg mb-4"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {hotel.gallery?.map((img) => (
              <img
                key={img} 
                src={`https://hotel-booking-api-p8if.onrender.com/${img}`}
                alt={`${hotel.name} Gallery`}
                className="w-full h-24 md:h-32 object-cover rounded shadow"
              />
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm md:text-base lg:text-lg mb-6">{hotel.description}</p>
          <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-4">Amenities</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            {hotel.amenities?.map((amenity, index) => (
              <li key={index} className="flex items-center">
                <svg className="w-4 h-4 md:w-5 md:h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
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
        {filteredRooms.length > 0 ? (
          filteredRooms.map(room => (
            <div key={room._id} className="bg-white shadow-lg rounded-lg overflow-hidden">
              <button 
                onClick={() => setSelectedRoom(room)}
                className="w-full"
              >
                {room.image ? (
                  <img
                    src={`https://hotel-booking-api-p8if.onrender.com/${room.image}`}
                    alt={room.roomType}
                    className="w-full h-32 sm:h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 sm:h-48 bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
              </button>
              <div className="p-4">
                <h4 className="font-bold text-lg mb-2">{room.roomType}</h4>
                <p className="text-gray-700 mb-4">Price per night: ₦{room.price}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-cyan-600">₦{room.price}</span>
                  <button
                    className="bg-cyan-600 text-white py-2 px-4 rounded-full text-sm hover:bg-cyan-700 transition duration-300"
                    onClick={() => handleBookNow(room)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">No rooms available for this hotel.</p>
        )}
      </div>
      {selectedRoom && (
        <RoomFeatured 
          room={selectedRoom}
          hotelName={hotel.name}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </div>
  );
};

export default HotelDetails;
