import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEcom } from "../../context/EcomContext";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

const HomePage = () => {
  const { hotels, getHotelById } = useEcom();
  const navigate = useNavigate();
  const { state } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useState({ location: "" });
  const [hotelList, setHotelList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    navigate(`/all-hotels?search=${searchParams.location}`);
  };

  const fetchHotels = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("https://hotel-booking-api-p8if.onrender.com/api/hotel");
      setHotelList(response.data.data);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  
  const handleHotelClick = async (_id) => {
    try {
      const hotelData = await getHotelById(_id);
      if (hotelData) {
        navigate('/all-hotels', { state: { hotel: hotelData } }); 
      }
    } catch (error) {
      console.error("Error navigating to hotel details:", error);
    }
  };

  return (
    <div className="bg-gray-100">
      <div className="relative h-64 sm:h-80 md:h-96">
        <div
          className="absolute inset-0 bg-cover bg-center z-10"
          style={{ backgroundImage: "url('/img/image4.jpg')" }}
        >
          <div className="absolute inset-0 bg-black opacity-40"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center text-white px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Explore Unbeatable Hotel Rates
            </h1>
            <p className="text-base sm:text-lg mb-8">
              Find the perfect stay for your next adventure
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <input
                type="text"
                name="location"
                placeholder="Enter destination"
                className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-cyan-700 w-full sm:w-auto text-black"
                value={searchParams.location}
                onChange={handleInputChange}
              />
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg text-lg font-semibold transition duration-300 w-full sm:w-auto"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 text-center">
            Discover Our Hotels
          </h2>
          {isLoading && <p className="text-center text-gray-700">Loading hotels...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotelList.map((item) => (
              <div
                key={item._id}
                className="bg-gray-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300 cursor-pointer"
                onClick={() => handleHotelClick(item._id)}
              >
                <img
                  src={`https://hotel-booking-api-p8if.onrender.com/${item.img}`}
                  alt={item.name}
                  className="w-full h-48 sm:h-56 lg:h-64 object-cover"
                />
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold mb-2">{item.name}</h3>
                  <p className="text-gray-700 text-sm sm:text-base mb-4">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
