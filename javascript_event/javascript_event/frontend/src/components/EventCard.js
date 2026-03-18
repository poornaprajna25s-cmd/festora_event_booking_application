import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event, showStatus = false, onViewDetails, onEdit }) => {
  // Function to get the first image attachment from an event
  const getEventImageUrl = (event) => {
    if (event.attachments && event.attachments.length > 0) {
      const imageAttachment = event.attachments.find(attachment => attachment.type === 'image');
      if (imageAttachment) {
        // Check if the URL is already absolute or needs the base URL
        if (imageAttachment.url.startsWith('http')) {
          return imageAttachment.url;
        } else {
          return `http://localhost:5001${imageAttachment.url}`;
        }
      }
    }
    return null;
  };

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold text-primary">{event.title}</h3>
        {showStatus && (
          <span className={`px-2 py-1 rounded text-sm font-semibold ${
            event.status === 'approved' ? 'text-green-500' :
            event.status === 'pending' ? 'text-yellow-500' :
            event.status === 'rejected' ? 'text-red-500' :
            event.status === 'completed' ? 'text-purple-500' :
            'text-blue-500'
          }`}>
            {event.status}
          </span>
        )}
      </div>
      
      {getEventImageUrl(event) && (
        <div className="mb-3">
          <img 
            src={getEventImageUrl(event)} 
            alt={event.title}
            className="w-full h-40 object-cover rounded"
          />
        </div>
      )}
      
      <p className="text-gray-200 mb-2 text-sm">{event.shortDescription}</p>
      <p className="mb-1 text-gray-200">
        <span className="font-semibold">Category:</span> {event.category}
      </p>
      <p className="mb-1 text-gray-200">
        <span className="font-semibold">Date:</span>{' '}
        {new Date(event.startDate).toLocaleDateString()}
      </p>
      
      {event.organiser && (
        <p className="mb-1 text-gray-200">
          <span className="font-semibold">Organiser:</span> {event.organiser.name}
        </p>
      )}
      
      {event.assignedAdmin && (
        <p className="mb-3 text-gray-200">
          <span className="font-semibold">Assigned Admin:</span> {event.assignedAdmin.name}
        </p>
      )}
      
      <div className="flex space-x-2 mt-4">
        {onViewDetails ? (
          <button 
            onClick={onViewDetails}
            className="btn-primary inline-block flex-1 text-center"
          >
            View Details
          </button>
        ) : (
          <Link 
            to={`/events/${event._id}`} 
            className="btn-primary inline-block flex-1 text-center"
          >
            View Details
          </Link>
        )}
        
        {onEdit && (
          <button 
            onClick={onEdit}
            className="btn-secondary inline-block flex-1 text-center"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default EventCard;