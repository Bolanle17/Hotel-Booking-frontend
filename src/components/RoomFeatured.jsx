import React from 'react';

const RoomFeatured = ({ room, hotelName, onClose }) => {
  if (!room) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">{room.roomType}</h2>
          <button onClick={onClose} className="text-2xl hover:text-gray-700 transition-colors">&times;</button>
        </div>
        <img
          src={`http://localhost:3000/${room.image}`}
          alt={room.roomType}
          className="w-full h-48 sm:h-64 object-cover mb-4 rounded"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="font-semibold text-lg">Price: ₦{room.price} per night</p>
          </div>
        </div>
        <p className="mb-4 text-sm sm:text-base">{room.description || 'No description available.'}</p>
        <h3 className="font-bold text-base sm:text-lg mb-2">Hotel: {hotelName}</h3>
      </div>
    </div>
  );
};

export default RoomFeatured;