import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import axios from 'axios';

function UserBooking() {
  const { user, getAuthToken } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomDetails, setRoomDetails] = useState({});

  
  const fetchRoomDetails = async (id, token) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/room/${id}`, {
        headers: { 'auth-token': token }
      });
      return response.data.data; 
    } catch (error) {
      console.error(`Error fetching room details for ${id}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!user) {
        setError('User is not logged in');
        setLoading(false);
        return;
      }

      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get('http://localhost:3000/api/booking/bookings', {
          headers: { 'auth-token': token },
        });

        console.log('API Response Booking:', response.data);

        
        const bookingsData = response.data.bookings;
        setBookings(bookingsData);

       
        const roomDetailsMap = {};
        for (const booking of bookingsData) {
          if (booking.rooms && booking.rooms.length > 0) {
            for (const room of booking.rooms) {
              if (room._id && !roomDetailsMap[room._id]) {
                const roomDetail = await fetchRoomDetails(room._id, token);
                if (roomDetail) {
                  roomDetailsMap[room._id] = roomDetail;
                }
              }
            }
          }
        }
        
        setRoomDetails(roomDetailsMap);
      } catch (err) {
        console.error('Error fetching user bookings:', err.message);
        setError(err.message || 'An error occurred while fetching bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, [user]);

  const getRoomType = (room) => {
    
    if (room.roomType) {
      return room.roomType;
    }
    
    if (roomDetails[room._id]?.roomType) {
      return roomDetails[room._id].roomType;
    }
    
    if (roomDetails[room._id]?.hotel && roomDetails[room._id].hotel.name) {
      return roomDetails[room._id].hotel.name;
    }
    return 'Unknown';
  };

  if (loading) return <div>Loading booking information...</div>;
  if (error) return <div>Error: {error}</div>;
  if (bookings.length === 0) return <div>No bookings found.</div>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-[#e4dbd2] shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">Your Bookings</h2>
      {bookings.map((booking) => (
        <div key={booking._id} className="mb-8 p-4 border-b border-gray-300">
          <h1 className='text-center mb-4 font-bold text-xl'>MOAHOTELS Customer Booking Reference</h1>
          
          <p><strong>Guest Name:</strong> <span className="ml-2 text-center">{booking.Name}</span></p>
          <p><strong>Check-In Date:</strong> <span className="ml-2 text-center">{new Date(booking.checkInDate).toLocaleDateString()}</span></p>
          <p><strong>Check-Out Date:</strong> <span className="ml-2 text-center">{new Date(booking.checkOutDate).toLocaleDateString()}</span></p>
          <p><strong>Guests:</strong> <span className="ml-2 text-center">{booking.guests}</span></p>
          <p><strong>Total Price:</strong> <span className="ml-2 text-center">₦{booking.amount}</span></p>          
          <p><strong>Email:</strong> <span className="ml-2 text-center">{booking.email || 'N/A'}</span></p>
          <p><strong>Phone:</strong> <span className="ml-2 text-center">{booking.phone || 'N/A'}</span></p>
          <p><strong>Booking ID:</strong> <span className="ml-2 text-center">{booking.bookingId}</span></p>
          <p><strong>Room ID:</strong> <span className="ml-2 text-center">{booking._id}</span></p>
          
  
          <p><strong>Room Types:</strong> 
            <span className="ml-2 text-center">
              {booking.rooms.map((room, index) => (
                <span key={room._id}>
                  {getRoomType(room)}
                  {index < booking.rooms.length - 1 ? ', ' : ''}
                </span>
              ))}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}

export default UserBooking;
