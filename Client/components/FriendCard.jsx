

const FriendCard = ({ friend }) => {
  return (
    <div style={{ border: "1px solid gray", padding: "10px", margin: "5px" }}>
      <p>{friend.email}</p>
      <p>{friend.name || "No Name"}</p>
    </div>
  );
};

export default FriendCard;