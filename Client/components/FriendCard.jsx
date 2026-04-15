const FriendCard = ({ friend, onClick, actionLabel = "Chat" }) => {
  return (
    <div className="social-card friend-card">
      <div className="social-card-copy">
        <p className="social-card-title">{friend.name || "No Name"}</p>
        <p className="social-card-subtitle">{friend.email}</p>
      </div>
      {onClick ? (
        <button type="button" className="social-card-btn" onClick={() => onClick(friend)}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
};

export default FriendCard;
