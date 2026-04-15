// src/pages/FriendsPage.jsx

import { useEffect, useState } from "react";
import { friendsApi } from "../api/friendsApi";

import FriendCard from "../../components/FriendCard";
import RequestCard from "../../components/RequestCard"
const FriendsPage = () => {
  const [email, setEmail] = useState("");
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);

  const fetchData = async () => {
    const res1 = await friendsApi.getIncomming();
    const res2 = await friendsApi.getFriends();

    setRequests(res1);
    setFriends(res2);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSend = async () => {
    if (!email) return;
    await friendsApi.sendRequest(email);
    alert("Request sent");
    setEmail("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Add Friend</h2>
      <input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleSend}>Send Request</button>

      <h2>Incoming Requests</h2>
      {requests.map((r) => (
        <RequestCard key={r.id} request={r} refresh={fetchData} />
      ))}

      <h2>Your Friends</h2>
      {friends.map((f) => (
        <FriendCard key={f.id} friend={f} />
      ))}
    </div>
  );
};

export default FriendsPage;