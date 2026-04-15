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
    <div style={{ border: "1px solid blue", padding: "10px", margin: "5px" }}>
      <p>{request.sender.email}</p>

      <button onClick={handleAccept}>Accept</button>
      <button onClick={handleReject}>Reject</button>
    </div>
  );
};

export default RequestCard;