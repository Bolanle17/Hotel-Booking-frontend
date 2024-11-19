import React, { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";

function UserBooking() {
  const { user, getAuthToken } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomDetails, setRoomDetails] = useState({});
  const [hotelDetails, setHotelDetails] = useState({});

  const fetchRoomDetails = async (id, token) => {
    try {
      const response = await axios.get(`https://hotel-booking-api-p8if.onrender.com/api/room/${id}`, {
        headers: { "auth-token": token },
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching room details for ${id}:`, error);
      return null;
    }
  };

  const fetchHotelDetails = async (hotelId, token) => {
    const id = typeof hotelId === "object" ? hotelId._id : hotelId;

    if (!id || typeof id !== "string") {
      console.error("Invalid hotel ID:", hotelId);
      return null;
    }

    try {
      const response = await axios.get(
        `https://hotel-booking-api-p8if.onrender.com/api/hotel/${id}`,
        {
          headers: { "auth-token": token },
        }
      );

      const hotelData = response.data.data;
      return {
        name: hotelData.name || "Unknown Hotel",
        address:
          typeof hotelData.address === "object"
            ? `${hotelData.address.street}, ${hotelData.address.area}, ${hotelData.address.city}, ${hotelData.address.country}`
            : hotelData.address || "N/A",
      };
    } catch (error) {
      console.error(`Error fetching hotel details for ${id}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!user) {
        setError("User is not logged in");
        setLoading(false);
        return;
      }

      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(
          "https://hotel-booking-api-p8if.onrender.com/api/booking/bookings",
          {
            headers: { "auth-token": token },
          }
        );

        const bookingsData = response.data.bookings;
        setBookings(bookingsData);

        const roomDetailsMap = {};
        const hotelDetailsMap = {};

        for (const booking of bookingsData) {
          let hotelId = booking.hotel;

          if (typeof hotelId === "object" && hotelId?._id) {
            hotelId = hotelId._id;
          }

          if (!hotelId && booking.rooms && booking.rooms.length > 0) {
            const firstRoom = booking.rooms[0];
            hotelId =
              typeof firstRoom.hotel === "object"
                ? firstRoom.hotel._id
                : firstRoom.hotel;
          }

          if (hotelId && !hotelDetailsMap[hotelId]) {
            const hotelDetail = await fetchHotelDetails(hotelId, token);
            if (hotelDetail) {
              hotelDetailsMap[hotelId] = {
                name: hotelDetail.name || "Unknown Hotel",
                address: hotelDetail.address || "N/A",
              };
            }
          }

          if (booking.rooms && Array.isArray(booking.rooms)) {
            for (const room of booking.rooms) {
              if (room._id && !roomDetailsMap[room._id]) {
                const roomDetail = await fetchRoomDetails(room._id, token);
                if (roomDetail) {
                  roomDetailsMap[room._id] = {
                    roomType: roomDetail.roomType || "Unknown Type",
                    name: roomDetail.name || "Unknown Room",
                    hotel: roomDetail.hotel,
                  };

                  if (roomDetail.hotel && !hotelDetailsMap[roomDetail.hotel]) {
                    const hotelDetail = await fetchHotelDetails(
                      roomDetail.hotel,
                      token
                    );
                    if (hotelDetail) {
                      hotelDetailsMap[roomDetail.hotel] = {
                        name: hotelDetail.name || "Unknown Hotel",
                        address: hotelDetail.address || "N/A",
                      };
                    }
                  }
                }
              }
            }
          }
        }

        setRoomDetails(roomDetailsMap);
        setHotelDetails(hotelDetailsMap);
      } catch (err) {
        console.error("Error fetching user bookings:", err.message);
        setError(err.message || "An error occurred while fetching bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, [user, getAuthToken]);

  const getRoomType = (room) => {
    if (typeof room.roomType === "string") {
      return room.roomType;
    }
    if (roomDetails[room._id]?.roomType) {
      return roomDetails[room._id].roomType;
    }
    return "Unknown";
  };

  const getHotelInfo = (booking) => {
    let hotelId = booking.hotel;

    if (typeof hotelId === "object" && hotelId?._id) {
      hotelId = hotelId._id;
    }

    if (!hotelId && booking.rooms && booking.rooms.length > 0) {
      const firstRoom = booking.rooms[0];
      hotelId = firstRoom.hotel?._id || firstRoom.hotel;

      if (!hotelId && firstRoom._id && roomDetails[firstRoom._id]) {
        hotelId = roomDetails[firstRoom._id].hotel;
      }
    }

    if (!hotelId || !hotelDetails[hotelId]) {
      return {
        name: "Unknown Hotel",
        address: "N/A",
      };
    }

    return hotelDetails[hotelId];
  };

  if (loading) return <div>Loading booking information...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!Array.isArray(bookings) || bookings.length === 0)
    return <div>No bookings found.</div>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-[#e4dbd2] shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">Your Bookings</h2>
      {bookings.map((booking) => {
        const hotelInfo = getHotelInfo(booking);

        return (
          <div key={booking._id} className="mb-8 p-4 border-b border-gray-300">
            <h1 className="text-center mb-4 font-bold text-xl">
              MOAHOTELS Customer Booking Reference
            </h1>

            <div className="mb-4 p-3 bg-white rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Hotel Information</h3>
              <p>
                <strong>Hotel Name:</strong>{" "}
                <span className="ml-2">{hotelInfo.name}</span>
              </p>
              <p>
                <strong>Address:</strong>{" "}
                <span className="ml-2">
                  {typeof hotelInfo.address === "object"
                    ? `${hotelInfo.address.street}, ${hotelInfo.address.area}, ${hotelInfo.address.city}, ${hotelInfo.address.country}`
                    : String(hotelInfo.address || "N/A")}
                </span>
              </p>
            </div>

            <p>
              <strong>Guest Name:</strong>{" "}
              <span className="ml-2">{String(booking.Name || "N/A")}</span>
            </p>
            <p>
              <strong>Check-In Date:</strong>{" "}
              <span className="ml-2">
                {booking.checkInDate
                  ? new Date(booking.checkInDate).toLocaleDateString()
                  : "N/A"}
              </span>
            </p>
            <p>
              <strong>Check-Out Date:</strong>{" "}
              <span className="ml-2">
                {booking.checkOutDate
                  ? new Date(booking.checkOutDate).toLocaleDateString()
                  : "N/A"}
              </span>
            </p>
            <p>
              <strong>Guests:</strong>{" "}
              <span className="ml-2">{String(booking.guests || "N/A")}</span>
            </p>
            <p>
              <strong>Total Price:</strong>{" "}
              <span className="ml-2">₦{String(booking.amount || "N/A")}</span>
            </p>
            <p>
              <strong>Email:</strong>{" "}
              <span className="ml-2">{String(booking.email || "N/A")}</span>
            </p>
            <p>
              <strong>Phone:</strong>{" "}
              <span className="ml-2">{String(booking.phone || "N/A")}</span>
            </p>
            <p>
              <strong>Booking ID:</strong>{" "}
              <span className="ml-2">{String(booking.bookingId || "N/A")}</span>
            </p>
            <p>
              <strong>Room ID:</strong>{" "}
              <span className="ml-2">{String(booking._id || "N/A")}</span>
            </p>

            <p>
              <strong>Room Name:</strong>
              <span className="ml-2">
                {Array.isArray(booking.rooms)
                  ? booking.rooms.map((room, index) => (
                      <span key={room._id || index}>
                        {String(getRoomType(room))}
                        {index < booking.rooms.length - 1 ? ", " : ""}
                      </span>
                    ))
                  : "N/A"}
              </span>
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default UserBooking;