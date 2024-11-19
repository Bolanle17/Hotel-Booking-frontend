export const generateBookingId = () => {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000000);
    return `BK${timestamp}${random}`;
  };
  
  export const validateBookingDetails = (bookingDetails) => {
    const required = [
      { field: 'Name', message: 'Name is required' },
      { field: 'email', message: 'Email is required' },
      { field: 'phone', message: 'Phone number is required' },
      { field: 'address', message: 'Address is required' },
      { field: 'checkInDate', message: 'Check-in date is required' },
      { field: 'checkOutDate', message: 'Check-out date is required' },
      { field: 'hotel', message: 'Hotel information is missing' }
    ];
  
    for (const { field, message } of required) {
      if (!bookingDetails[field]?.toString().trim()) {
        throw new Error(message);
      }
    }
  
    if (!bookingDetails.rooms || bookingDetails.rooms.length === 0) {
      throw new Error('Please select at least one room');
    }
  };
  
  export const formatBookingPayload = (bookingDetails, userId) => {
    return {
      bookingId: generateBookingId(),
      Name: bookingDetails.Name,
      email: bookingDetails.email,
      phone: bookingDetails.phone,
      address: bookingDetails.address,
      checkInDate: bookingDetails.checkInDate,
      checkOutDate: bookingDetails.checkOutDate,
      guests: bookingDetails.guests,
      totalAmount: bookingDetails.totalAmount,
      currency: bookingDetails.currency || 'NGN',
      rooms: bookingDetails.rooms.map(room => ({
        _id: room._id,
        numberOfRooms: room.numberOfRooms || 1,
        roomType: room.roomType,
        roomName: room.roomName || room.roomType,
        hotel: room.hotel
      })),
      hotel: bookingDetails.hotel,
      hotelId: bookingDetails.hotelId,
      userId: userId,
      status: 'pending'
    };
  };
  
  export const formatPaymentPayload = (bookingResponse, bookingDetails, userId, totalAmount) => {
    return {
      bookingId: bookingResponse.booking.bookingId,
      userId: userId,
      amount: totalAmount,
      currency: 'NGN',
      Name: bookingDetails.Name,
      phone: bookingDetails.phone,
      address: bookingDetails.address,
      guests: bookingDetails.guests,
      checkInDate: bookingDetails.checkInDate,
      checkOutDate: bookingDetails.checkOutDate,
      rooms: bookingDetails.rooms,
      email: bookingDetails.email,
      hotelId: bookingDetails.rooms[0]?.hotel
    };
  };