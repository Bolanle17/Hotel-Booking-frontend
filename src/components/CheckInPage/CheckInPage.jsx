import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEcom } from "../../context/EcomContext";
import useAuth from "../../hooks/useAuth";

const CheckInPage = () => {
  const { setSearchCriteria, setTotalAmount, addToSelectedRooms, setSelectedRooms } = useEcom();
  const navigate = useNavigate();
  const location = useLocation();
  
  
  const [checkInDate, setCheckInDate] = useState(() => 
    localStorage.getItem('checkInDate') || ""
  );
  const [checkOutDate, setCheckOutDate] = useState(() => 
    localStorage.getItem('checkOutDate') || ""
  );
  const [guestCount, setGuestCount] = useState(() => 
    parseInt(localStorage.getItem('guestCount')) || 1
  );
  const [selectedRoom, setSelectedRoom] = useState(() => {
    const saved = localStorage.getItem('selectedRoom');
    return saved ? JSON.parse(saved) : null;
  });
  const [calculatedTotal, setCalculatedTotal] = useState(() => 
    parseFloat(localStorage.getItem('calculatedTotal')) || 0
  );

  const { user } = useAuth();
  const [name, setName] = useState(() => 
    localStorage.getItem('guestName') || ""
  );
  const [email, setEmail] = useState(() => 
    localStorage.getItem('guestEmail') || ""
  );

  
  useEffect(() => {
    if (checkInDate) {
      localStorage.setItem('checkInDate', checkInDate);
    }
  }, [checkInDate]);

  
  useEffect(() => {
    if (checkOutDate) {
      localStorage.setItem('checkOutDate', checkOutDate);
    }
  }, [checkOutDate]);

  
  useEffect(() => {
    localStorage.setItem('guestCount', guestCount.toString());
  }, [guestCount]);

  
  useEffect(() => {
    if (selectedRoom) {
      localStorage.setItem('selectedRoom', JSON.stringify(selectedRoom));
    }
  }, [selectedRoom]);

  
  useEffect(() => {
    localStorage.setItem('calculatedTotal', calculatedTotal.toString());
  }, [calculatedTotal]);

 
  useEffect(() => {
    if (name) localStorage.setItem('guestName', name);
    if (email) localStorage.setItem('guestEmail', email);
  }, [name, email]);

  useEffect(() => {
    
    setSelectedRooms([]);

    if (user) {
      const savedName = localStorage.getItem('guestName');
      const savedEmail = localStorage.getItem('guestEmail');
      setName(savedName || user.name || "");
      setEmail(savedEmail || user.email || "");
    }

    
    if (location.state && location.state.roomType) {
      setSelectedRoom(location.state.roomType);
      localStorage.setItem('selectedRoom', JSON.stringify(location.state.roomType));
    }
  }, [location.state, setSelectedRooms, user]);

  const calculateDaysDifference = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    if (checkInDate && checkOutDate && selectedRoom) {
      const numberOfDays = calculateDaysDifference(checkInDate, checkOutDate);
      if (numberOfDays <= 0) return 0;
      return numberOfDays * selectedRoom.price;
    }
    return 0;
  };

  useEffect(() => {
    const total = calculateTotal();
    setCalculatedTotal(total);
  }, [checkInDate, checkOutDate, selectedRoom]);

  const handleNext = () => {
    if (checkInDate && checkOutDate && guestCount > 0 && selectedRoom) {
      setSearchCriteria({ checkIn: checkInDate, checkOut: checkOutDate, guests: guestCount });
      setTotalAmount(calculatedTotal);
      addToSelectedRooms({
        ...selectedRoom,
        quantity: 1
      });
      
      
      const bookingData = { 
        checkInDate, 
        checkOutDate, 
        guests: guestCount, 
        roomType: selectedRoom.roomType,
        totalAmount: calculatedTotal,
        name,  
        email  
      };
      
      navigate("/book-now", { state: bookingData });
    } else {
      alert("Please select check-in, check-out dates, specify number of guests, and ensure a room is selected.");
    }
  };

  
  const clearForm = () => {
    localStorage.removeItem('checkInDate');
    localStorage.removeItem('checkOutDate');
    localStorage.removeItem('guestCount');
    localStorage.removeItem('selectedRoom');
    localStorage.removeItem('calculatedTotal');
    localStorage.removeItem('guestName');
    localStorage.removeItem('guestEmail');
    
    setCheckInDate("");
    setCheckOutDate("");
    setGuestCount(1);
    setSelectedRoom(null);
    setCalculatedTotal(0);
    setName(user?.name || "");
    setEmail(user?.email || "");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-12 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">Select Your Stay Dates</h1>
          <button 
            onClick={clearForm}
            className="text-sm text-cyan-600 hover:text-cyan-700"
          >
            Clear Form
          </button>
        </div>

      
        <div className="mb-4 sm:mb-6">
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
        </div>
        <div className="mb-4 sm:mb-6">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
        </div>

        {selectedRoom && (
          <div className="mb-6 sm:mb-8 border-b border-gray-300 pb-4 sm:pb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">{selectedRoom.roomType}</h2>
            {selectedRoom.image && (
              <img 
                src={`http://localhost:3000/${selectedRoom.image}`} 
                alt={selectedRoom.roomType} 
                className="w-full h-48 sm:h-64 object-cover rounded-md mb-4 shadow-md" 
              />
            )}
            <p className="text-lg font-bold text-gray-800">₦{selectedRoom.price} per night</p>
          </div>
        )}
        <div className="mb-4 sm:mb-6">
          <label htmlFor="checkInDate" className="block text-gray-700 font-medium mb-2">Check-In Date:</label>
          <input
            type="date"
            id="checkInDate"
            name="checkInDate"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div className="mb-4 sm:mb-6">
          <label htmlFor="checkOutDate" className="block text-gray-700 font-medium mb-2">Check-Out Date:</label>
          <input
            type="date"
            id="checkOutDate"
            name="checkOutDate"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div className="mb-4 sm:mb-6">
          <label htmlFor="guests" className="block text-gray-700 font-medium mb-2">Number of Guests:</label>
          <input
            type="number"
            id="guests"
            name="guests"
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            min="1"
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <p className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
          Total Amount: <span className="text-xl sm:text-2xl">₦{calculatedTotal}</span>
        </p>
        <button
          className="w-full bg-cyan-600 text-white py-2 sm:py-3 rounded-lg hover:bg-cyan-700 transition duration-300 text-sm sm:text-base"
          onClick={handleNext}
        >
          Proceed to Booking
        </button>
      </div>
    </div>
  );
};

export default CheckInPage;