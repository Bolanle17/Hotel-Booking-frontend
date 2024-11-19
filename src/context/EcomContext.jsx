import React, { createContext, useContext, useState, useEffect } from "react";
import { hotels as initialHotels } from "../Data/HotelData";
import useAuth  from "../hooks/useAuth";
import { useDraftBooking } from "../hooks/useDraftBooking";
import { 
  generateBookingId, 
  validateBookingDetails, 
  formatBookingPayload,
  formatPaymentPayload 
} from '../utils/bookingUtils';
import axios from 'axios';



const EcomContext = createContext();

export const useEcom = () => useContext(EcomContext);

const useLocalStorage = (key) => {
  const setItem = (value) => {
    try {
      if (key === 'auth-token') {

      localStorage.setItem(key, value);
    } else {
      
      const stringValue = JSON.stringify(value);
      localStorage.setItem(key, stringValue);
    }
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
    }
  };

  const getItem = () => {
    try {
      const item = localStorage.getItem(key);
      if (key === 'auth-token') {
        return item;
      }
     
     return item ? JSON.parse(item) : null;

    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return null;
    }
  };

  const removeItem = () => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  };

  return { setItem, getItem, removeItem };
};

export const EcomProvider = ({ children }) => {

  const user = useAuth(); 
  
  const initialUser = localStorage.getItem('userProfile') ? JSON.parse(localStorage.getItem('userProfile')) : null;
  const [totalAmount, setTotalAmount] = useState(0);
  const [currentBooking, setCurrentBooking] = useState(() => {
    const storedBooking = localStorage.getItem('currentBooking');
    return storedBooking ? JSON.parse(storedBooking) : null;
  });
  const [hotels, setHotels] = useState(initialHotels);
  const [rooms, setRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [userProfile, setUserProfile] = useState(initialUser);
  const [success, setSuccess] = useState(false)

  const { isLoading: authLoading, error: authError, logout, userID, setUserID } = useAuth();

  const { 
    draftBooking, 
    saveDraftBooking, 
    clearDraftBooking, 
    transferDraftBookingToServer 
  } = useDraftBooking();
  const authTokenStorage = useLocalStorage("auth-token");
  const tempBookingDetailsStorage = useLocalStorage("tempBookingDetails");


  useEffect(() => {
    fetchHotels();
    fetchRooms();
  }, []);

  useEffect(() => {
    if (currentBooking) {
      localStorage.setItem('currentBooking', JSON.stringify(currentBooking));
    } else {
      localStorage.removeItem('currentBooking');
    }
  }, [currentBooking]);

  const fetchHotels = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("https://hotel-booking-api-p8if.onrender.com/api/hotel");
      if (!response.ok) {
       throw new Error(`HTTP error! status: ${response.status}`);
      }
     const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setHotels(data.data);
        const allRooms = data.data.flatMap(hotel => hotel.rooms || []);
        setRooms(allRooms);
      } else {
        throw new Error("Invalid data format received from server");
      }
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setError(error.message);
      setHotels(initialHotels);
     
      showNotification("error", "Failed to fetch hotels. Using default data.");
    } finally {
      setIsLoading(false);
    }
  };



  const getHotelById = async(id)=>{

    try {
        const response = await axios.get(`https://hotel-booking-api-p8if.onrender.com/api/hotel/${id}`);
        const result = await response.data;
        if (result.success) {
          return result.data;
        } else {
          throw new Error("Failed to fetch hotel:", result.message);
        }
  
    } catch (error) {
      console.error("Error fetching hotels:", error);
      return null;;
    }

  }

  
  
  const searchHotels = (criteria) => {
    setSearchCriteria(criteria);
    const filteredHotels = hotels.filter(hotel => {
      const { location } = criteria;
      return hotel.address.city.toLowerCase().includes(location.toLowerCase()) ||
             hotel.address.area.toLowerCase().includes(location.toLowerCase()) ||
             hotel.address.country.toLowerCase().includes(location.toLowerCase());
    });
    return filteredHotels;
  };

  const fetchRooms = async () => {
    setIsLoading(true); 
    setError(null); 
  
    try {
      const response = await fetch("https://hotel-booking-api-p8if.onrender.com/api/room");
  
     
      console.log("Room API response:", response);
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log("Fetched rooms data:", result); 
      
  
      if (result.success) {
       setRooms(result);
       
        console.log("Rooms set successfully:", result); 
      } else {
        console.error("Failed to fetch rooms:", result?.message);
        setError(result.message); 
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setError(error.message); 
    } finally {
      setIsLoading(false); 
    }
  }; 

  // Check room availability
  const checkRoomAvailability = async (rooms, checkInDate, checkOutDate) => {
    try {
      const response = await axios.post(
        "https://hotel-booking-api-p8if.onrender.com/api/booking/check-room-availability",
        { rooms, checkInDate, checkOutDate },
        { headers: { "auth-token": authTokenStorage.getItem() } }
      );
      return response.data.success;
    } catch (error) {
      console.error("Error checking room availability:", error);
      return false;
    }
  };


  const generateTransactionId = () => {
    
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `TXN-${timestamp}-${random}`;
  };
  
  const bookNow = async (bookingDetails) => {
     const token = authTokenStorage.getItem();
     const userId = userID;
  
    if (!userId || typeof userId !== 'string') {
      throw new Error("User ID must be a valid string.");
    }
  
    try {
      
      const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  
      
      const hotelResponse = await fetch(`https://hotel-booking-api-p8if.onrender.com/api/hotel/name/${encodeURIComponent(bookingDetails.hotel)}`, {
        headers: {
          "auth-token": token
        }
      });
      
      const hotelData = await hotelResponse.json();
      if (!hotelData.success || !hotelData.data._id) {
        throw new Error("Could not find hotel ID");
      }
  
      
      const bookingPayload = {
        ...bookingDetails,
        hotelId: hotelData.data._id,
        transactionId: transactionId, 
        bookingStatus: 'PENDING',
        userId: userId, 
        rooms: bookingDetails.rooms.map(room => ({
          _id: room._id,
          roomType: room.roomType,
          numberOfRooms: room.numberOfRooms || 1,
          roomName: room.roomType,
          hotel: hotelData.data._id
        }))
      };
  
      
      console.log('Booking payload:', JSON.stringify(bookingPayload, null, 2));
  
      const response = await fetch("https://hotel-booking-api-p8if.onrender.com/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token
        },
        body: JSON.stringify(bookingPayload)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create booking");
      }
  
      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || "Failed to create booking");
      }
  
      
      setCurrentBooking({
        ...responseData.booking,
        bookingId: responseData.booking.bookingId,
        transactionId: transactionId
      });
      
      return {
        success: true,
        booking: {
          ...responseData.booking,
          transactionId: transactionId
        }
      };
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  };
  


const showNotification = (type, message) => {
  setNotification({ type, message });
  setTimeout(() => setNotification(null), 5000); 
};



  
  const addToSelectedRooms = (room) => {
    setSelectedRooms((prev) => {
      return [...prev, room];
    });
  };

  const removeFromSelectedRooms = (roomId) => {
    setSelectedRooms(prev => prev.filter(room => room._id !== roomId));
  };



  const getUserProfile = async () => {
    try {
      const token = authTokenStorage.getItem(); 
      const response = await axios.get("https://hotel-booking-api-p8if.onrender.com/api/profile/view", {
        headers: { "auth-token": token }
      });
      setUserProfile(response.data.profile);
      localStorage.setItem('userProfile', JSON.stringify(response.data.profile));
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      setError(null);
      setSuccess(false);
      const token = authTokenStorage.getItem(); 
  
      let response;
      if (profileData instanceof FormData) {
        response = await axios.post("https://hotel-booking-api-p8if.onrender.com/api/profile/update", profileData, {
          headers: {
            "auth-token": token,
            "Content-Type": "multipart/form-data"
          }
        });
      } else {
        response = await axios.post("https://hotel-booking-api-p8if.onrender.com/api/profile/update", profileData, {
          headers: { "auth-token": token }
        });
      }
  
      setUserProfile(response.data.profile);
      localStorage.setItem('userProfile', JSON.stringify(response.data.profile));
      setSuccess(true);
      await getUserProfile(); 
    } catch (error) {
      console.error("Error updating user profile:", error);
      setError('Error updating profile');
    }
  };




  return (
    <EcomContext.Provider value={{
      allHotels: hotels,
      searchHotels,
      searchCriteria,
      setSearchCriteria,
      totalAmount,
      setTotalAmount,
      currentBooking,
      setCurrentBooking,
      bookNow,
      showNotification,
      notification,
      isAuthenticated: !!user,
      fetchHotels,
      isLoading,
      error,
      fetchRooms,
      rooms,
      logout,
      user,
      selectedRooms,
      setSelectedRooms,
      addToSelectedRooms,
      removeFromSelectedRooms,
      draftBooking,
      saveDraftBooking,
      clearDraftBooking,
      transferDraftBookingToServer,
      getUserProfile,
      updateUserProfile,
      success,
      authLoading,
      authError,
      userProfile,
      getHotelById
    }}>
      {children}
    </EcomContext.Provider>
  );
};

export default EcomProvider;