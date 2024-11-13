import React, { useContext } from "react";
import { useEcom } from "../../context/EcomContext";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const HotelListing = () => {
  const { allHotels } = useEcom();
  const { state } = useContext(AuthContext);
  const redirect = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 text-center">Explore Our Hotels</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {allHotels.map(hotel => (
          <div key={hotel._id} className="bg-white shadow-lg rounded-lg overflow-hidden transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl">
            <Link to={`/details/${hotel._id}`}>
              <img
                src={`https://hotel-booking-api-p8if.onrender.com/${hotel.img}`}
                alt={hotel.name}
                className="w-full h-48 sm:h-56 lg:h-64 object-cover"
              />
            </Link>
            <div className="p-4 sm:p-6">
              <h3 className="font-bold text-lg sm:text-xl mb-2">{hotel.name}</h3>
              <p className="text-gray-700 text-sm sm:text-base mb-4">{hotel.description}</p>
              <div className="flex justify-between items-center">
                <Link to={`/details/${hotel._id}`} className="bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-full text-sm transition duration-300">View Details</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotelListing;