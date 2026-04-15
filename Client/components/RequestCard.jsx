// src/components/RequestCard.jsx

//import { acceptRequest, rejectRequest } from "../api/friendApi";
import { friendsApi } from "../src/api/friendsApi";
const RequestCard = ({ request, refresh }) => {

  const handleAccept = async () => {
    await friendsApi.acceptRequest(request.id);
    refresh();
  };

  const handleReject = async () => {
    await friendsApi.rejectRequest(request.id);
    refresh();
  };

  return (
    <div className="social-card request-card">
      <div className="social-card-copy">
        <p className="social-card-title">{request.sender.name || "New request"}</p>
        <p className="social-card-subtitle">{request.sender.email}</p>
      </div>
      <div className="request-actions">
        <button type="button" className="social-card-btn accept-btn" onClick={handleAccept}>
          Accept
        </button>
        <button type="button" className="social-card-btn reject-btn" onClick={handleReject}>
          Reject
        </button>
      </div>
    </div>
  );
};

export default RequestCard;
