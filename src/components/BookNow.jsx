import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEcom } from '../context/EcomContext';
import useAuth from '../hooks/useAuth';
import useLocalStorage from '../hooks/useLocalStorage';
import { useDraftBooking } from '../hooks/useDraftBooking';

const BookNow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookNow, totalAmount, selectedRooms, showNotification } = useEcom();
  const { user, isLoading: authLoading, userID } = useAuth();
  const { setItem, getItem, removeItem } = useLocalStorage('tempBookingDetails');
  const { draftBooking, clearDraftBooking } = useDraftBooking();

  
  const [bookingDetails, setBookingDetails] = useState(() => {
    const savedBooking = localStorage.getItem('bookingFormData');
    return savedBooking ? JSON.parse(savedBooking) : {
      Name: '',
      email: '',
      phone: '',
      address: '',
      checkInDate: '',
      checkOutDate: '',
      guests: 1,
    };
  });

 
  useEffect(() => {
    localStorage.setItem('bookingFormData', JSON.stringify(bookingDetails));
  }, [bookingDetails]);

  useEffect(() => {
    const loadBookingDetails = async () => {
      if (authLoading) return;

      let newBookingDetails = { ...bookingDetails };
      
      const { name, email } = location.state || {};
      newBookingDetails = {
        ...newBookingDetails,
        Name: name || newBookingDetails.Name,
        email: email || newBookingDetails.email,
      };

      if (draftBooking) {
        newBookingDetails = { ...newBookingDetails, ...draftBooking };
        await clearDraftBooking();
      }

      const storedTempBookingDetails = getItem();
      if (storedTempBookingDetails) {
        newBookingDetails = { ...newBookingDetails, ...storedTempBookingDetails };
        removeItem();
      }

      if (user) {
        newBookingDetails = {
          ...newBookingDetails,
          Name: newBookingDetails.Name || user.name || '',
          email: newBookingDetails.email || user.email || '',
          phone: newBookingDetails.phone || user.phone || '',
          address: newBookingDetails.address || user.address || '',
        };
      }

      if (JSON.stringify(newBookingDetails) !== JSON.stringify(bookingDetails)) {
        setBookingDetails(newBookingDetails);
      }
    };

    loadBookingDetails();
  }, [authLoading, user, draftBooking, getItem, removeItem, clearDraftBooking, location.state]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setBookingDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!userID) {
      showNotification("error", "Please login to continue your booking.");
      navigate('/login');
      return;
    }
  
    if (!selectedRooms || selectedRooms.length === 0) {
      showNotification("error", "Please select at least one room");
      return;
    }
  
    
    const bookingDetailsWithAmount = {
      ...bookingDetails,
      totalAmount: totalAmount || 0,
      userId: userID,
      currency: 'NGN',
      rooms: selectedRooms.map(room => ({
        _id: room._id,
        roomType: room.roomType,
        numberOfRooms: 1,
        roomName: room.roomType,
        hotel: room.hotel || selectedRooms[0]?.hotel
      })),
      hotel: selectedRooms[0]?.hotel,
      hotelId: selectedRooms[0]?.hotel,
      bookingStatus: 'PENDING'
    };
  
    try {
      
      if (!bookingDetailsWithAmount.Name?.trim()) throw new Error("Name is required");
      if (!bookingDetailsWithAmount.email?.trim()) throw new Error("Email is required");
      if (!bookingDetailsWithAmount.phone?.trim()) throw new Error("Phone number is required");
      if (!bookingDetailsWithAmount.address?.trim()) throw new Error("Address is required");
      if (!bookingDetailsWithAmount.checkInDate || !bookingDetailsWithAmount.checkOutDate) {
        throw new Error("Please select check-in and check-out dates");
      }
      if (!bookingDetailsWithAmount.hotel) throw new Error("Hotel information is missing");
  
      const bookingResponse = await bookNow(bookingDetailsWithAmount);
  
      if (bookingResponse?.booking) {
        const paymentPayload = {
          bookingId: bookingResponse.booking.bookingId,
          userId: userID,
          amount: totalAmount,
          currency: 'NGN',
          transactionId: bookingResponse.booking.transactionId,
          Name: bookingDetails.Name,
          phone: bookingDetails.phone,
          address: bookingDetails.address,
          guests: bookingDetails.guests,
          checkInDate: bookingDetails.checkInDate,
          checkOutDate: bookingDetails.checkOutDate,
          rooms: selectedRooms,
          email: bookingDetails.email,
          hotelId: selectedRooms[0]?.hotel
        };
  
        localStorage.removeItem('bookingFormData');
        showNotification("success", "Booking successful!");
        navigate("/payment", { 
          state: { 
            bookingData: bookingResponse.booking,
            paymentPayload 
          } 
        });
      } else {
        throw new Error("Booking failed. Please try again later.");
      }
    } catch (error) {
      console.error('Error during booking process:', error);
      showNotification("error", error.message || "An error occurred during booking.");
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Book Now</h1>
      <form className="max-w-lg mx-auto" onSubmit={handleBooking}>

       
        <div className="mb-4">
          <label htmlFor="Name" className="block text-gray-700 text-sm font-bold mb-2">Name</label>
          <input
            type="text"
            id="Name"
            name="Name"
            value={bookingDetails.Name}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={bookingDetails.email}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        
        <div className="mb-4">
          <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={bookingDetails.phone}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        
        <div className="mb-4">
          <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">Address</label>
          <textarea
            id="address"
            name="address"
            value={bookingDetails.address}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          ></textarea>
        </div>

        
        <div className="mb-4">
          <label htmlFor="checkInDate" className="block text-gray-700 text-sm font-bold mb-2">Check-In Date</label>
          <input
            type="date"
            id="checkInDate"
            name="checkInDate"
            value={bookingDetails.checkInDate}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        
        <div className="mb-4">
          <label htmlFor="checkOutDate" className="block text-gray-700 text-sm font-bold mb-2">Check-Out Date</label>
          <input
            type="date"
            id="checkOutDate"
            name="checkOutDate"
            value={bookingDetails.checkOutDate}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        
        <div className="mb-4">
          <label htmlFor="guests" className="block text-gray-700 text-sm font-bold mb-2">Number of Guests</label>
          <input
            type="number"
            id="guests"
            name="guests"
            value={bookingDetails.guests}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
            min="1"
          />
        </div>

        
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">Selected Rooms:</h3>
          {selectedRooms && selectedRooms.length > 0 ? (
            selectedRooms.map((room, index) => (
              <div key={room._id || index} className="mb-2 p-4 border rounded">
                <h3 className="font-semibold">Room {index + 1}: {room.roomType}</h3>
                {room.hotel && <p className="text-gray-600">Hotel: {room.hotel}</p>}
              </div>
            ))
          ) : (
            <p className="text-red-500">No rooms selected</p>
          )}
        </div>
        
        <div className="mb-6">
          <p className="text-xl font-bold">Total Amount: ₦{totalAmount}</p>
        </div>

        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Confirm Booking and Proceed to Payment
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookNow;