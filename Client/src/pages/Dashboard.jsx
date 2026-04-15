import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import RequestCard from "../../components/RequestCard";
import FriendCard from "../../components/FriendCard";
import axios from "../api/axios";
import { friendsApi } from "../api/friendsApi";
import useAuth from "../context/authContext";

const TABS = [
  { id: "request", label: "Send Request" },
  { id: "incoming", label: "Incoming Requests" },
  { id: "friends", label: "Friends" },
];

const getConversationRecipient = (conversation, userId) =>
  conversation.userA.id === userId ? conversation.userB : conversation.userA;

const DashBoard = () => {
  const { user, logout, token } = useAuth();
  const activeConversationRef = useRef("");

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("request");
  const [requestEmail, setRequestEmail] = useState("");
  const [chatSearchEmail, setChatSearchEmail] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [activeRecipient, setActiveRecipient] = useState(null);
  const [notice, setNotice] = useState({ type: "", text: "" });

  useEffect(() => {
    activeConversationRef.current = activeConversationId;
  }, [activeConversationId]);

  const loadConversations = async (preferredConversationId = "") => {
    const { data } = await axios.get("/api/user/friends");
    setConversations(data);

    if (!preferredConversationId) {
      return data;
    }

    const nextConversation = data.find((item) => item.id === preferredConversationId);
    if (nextConversation) {
      setActiveRecipient(getConversationRecipient(nextConversation, user.id));
    }

    return data;
  };

  const loadFriendData = async () => {
    const [friendData, incomingData] = await Promise.all([
      friendsApi.getFriends(),
      friendsApi.getIncomming(),
    ]);

    setFriends(friendData);
    setRequests(incomingData);
  };

  const loadMessages = async (conversationId) => {
    const { data } = await axios.get("/api/user/messages", {
      params: { conversationId },
    });
    setMessages(data);
  };

  const selectConversation = async (conversation) => {
    const recipient = getConversationRecipient(conversation, user.id);
    setActiveConversationId(conversation.id);
    setActiveRecipient(recipient);
    setReceiverEmail(recipient.email);
    setChatSearchEmail(recipient.email);
    await loadMessages(conversation.id);
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    const nextSocket = io("http://localhost:4444", {
      auth: { token },
    });

    nextSocket.on("connect", () => {
      setIsConnected(true);
    });

    nextSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    nextSocket.on("chat:new", async (data) => {
      if (data.conversationId === activeConversationRef.current) {
        setMessages((prevMessages) => {
          const alreadyExists = prevMessages.some((message) => message.id === data.id);
          return alreadyExists ? prevMessages : [...prevMessages, data];
        });
      }

      await loadConversations(data.conversationId);
    });

    setSocket(nextSocket);

    return () => {
      setIsConnected(false);
      nextSocket.disconnect();
    };
  }, [token, user.id]);

  useEffect(() => {
    if (!token) {
      return;
    }

    loadConversations();
    loadFriendData();
  }, [token]);

  const handleSendRequest = async () => {
    const email = requestEmail.trim().toLowerCase();
    if (!email) {
      return;
    }

    try {
      await friendsApi.sendRequest(email);
      setNotice({ type: "success", text: "Friend request sent." });
      setRequestEmail("");
      await loadFriendData();
    } catch (error) {
      setNotice({
        type: "error",
        text: error?.response?.data?.msg || "Unable to send friend request.",
      });
    }
  };

  const handleSearchChat = async () => {
    const email = chatSearchEmail.trim().toLowerCase();
    if (!email) {
      return;
    }

    const existingConversation = conversations.find((conversation) => {
      const recipient = getConversationRecipient(conversation, user.id);
      return recipient.email === email;
    });

    if (existingConversation) {
      await selectConversation(existingConversation);
      return;
    }

    const existingFriend = friends.find((friend) => friend.email === email) || null;
    setActiveConversationId("");
    setMessages([]);
    setReceiverEmail(email);
    setActiveRecipient(existingFriend || { email, name: existingFriend?.name || "New chat" });
    setNotice({ type: "", text: "" });
  };

  const chatHandler = async () => {
    if (!socket || !receiverEmail.trim() || !text.trim()) {
      return;
    }

    socket.emit("chat:send", { receiverEmail, text }, async (response) => {
      if (!response?.ok) {
        setNotice({
          type: "error",
          text: response?.error?.msg || response?.error || "Message failed to send.",
        });
        return;
      }

      const nextMessage = response.message;
      setText("");
      setActiveConversationId(nextMessage.conversationId);
      setMessages((prevMessages) => {
        const alreadyExists = prevMessages.some((message) => message.id === nextMessage.id);
        return alreadyExists ? prevMessages : [...prevMessages, nextMessage];
      });
      setNotice({ type: "success", text: "Message sent." });
      await loadConversations(nextMessage.conversationId);
    });
  };

  const startChatWithFriend = async (friend) => {
    setActiveTab("friends");
    setChatSearchEmail(friend.email);

    const existingConversation = conversations.find((conversation) => {
      const recipient = getConversationRecipient(conversation, user.id);
      return recipient.id === friend.id;
    });

    if (existingConversation) {
      await selectConversation(existingConversation);
      return;
    }

    setActiveConversationId("");
    setMessages([]);
    setReceiverEmail(friend.email);
    setActiveRecipient(friend);
  };

  return (
    <div className="dashboard">
      <header className="social-topbar">
        <div className="social-topbar-copy">
          <p className="eyebrow">Messaging Hub</p>
          <h1>{user.name || "Dashboard"}</h1>
          <p className="profile-email">{user.email}</p>
        </div>

        <div className="social-topbar-actions">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`topbar-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.id === "incoming" ? <span>{requests.length}</span> : null}
              {tab.id === "friends" ? <span>{friends.length}</span> : null}
            </button>
          ))}
          <div className={`status-pill ${isConnected ? "live" : "idle"}`}>
            <span className="status-dot"></span>
            {isConnected ? "Connected" : "Reconnecting"}
          </div>
          <button className="logout-btn" onClick={() => logout()}>
            Logout
          </button>
        </div>
      </header>

      <section className="social-strip">
        {activeTab === "request" ? (
          <div className="social-panel">
            <div>
              <p className="eyebrow">Add Friend</p>
              <h2>Send request by email</h2>
            </div>
            <div className="social-form">
              <input
                type="email"
                placeholder="friend@example.com"
                value={requestEmail}
                onChange={(event) => setRequestEmail(event.target.value)}
              />
              <button type="button" onClick={handleSendRequest}>
                Send Request
              </button>
            </div>
          </div>
        ) : null}

        {activeTab === "incoming" ? (
          <div className="social-panel">
            <div>
              <p className="eyebrow">Incoming</p>
              <h2>Pending requests</h2>
            </div>
            <div className="social-grid">
              {requests.length ? (
                requests.map((request) => (
                  <RequestCard key={request.id} request={request} refresh={loadFriendData} />
                ))
              ) : (
                <p className="panel-empty">No incoming requests right now.</p>
              )}
            </div>
          </div>
        ) : null}

        {activeTab === "friends" ? (
          <div className="social-panel">
            <div>
              <p className="eyebrow">Friends</p>
              <h2>Start a chat from your friend list</h2>
            </div>
            <div className="social-grid">
              {friends.length ? (
                friends.map((friend) => (
                  <FriendCard
                    key={friend.id}
                    friend={friend}
                    onClick={startChatWithFriend}
                    actionLabel="Open Chat"
                  />
                ))
              ) : (
                <p className="panel-empty">Add a friend to start chatting from here.</p>
              )}
            </div>
          </div>
        ) : null}
      </section>

      {notice.text ? <div className={`dashboard-notice ${notice.type}`}>{notice.text}</div> : null}

      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <div className="sidebar-panel contacts-panel">
            <div className="friends-header-row">
              <div>
                <p className="eyebrow">Previous Chats</p>
                <h2>Conversations</h2>
              </div>
              <span className="friend-count">{conversations.length}</span>
            </div>

            <ul className="friend-list">
              {conversations.length ? (
                conversations.map((conversation) => {
                  const friend = getConversationRecipient(conversation, user.id);
                  const isActive = conversation.id === activeConversationId;

                  return (
                    <li
                      key={conversation.id}
                      className={`friend-item ${isActive ? "active" : ""}`}
                      onClick={() => selectConversation(conversation)}
                    >
                      <div className="friend-avatar">
                        {(friend.name || friend.email).slice(0, 1).toUpperCase()}
                      </div>
                      <div className="friend-meta">
                        <div className="friend-name">{friend.name || "Unknown user"}</div>
                        <div className="friend-email">{friend.email}</div>
                      </div>
                    </li>
                  );
                })
              ) : (
                <li className="panel-empty sidebar-empty">No chat history yet.</li>
              )}
            </ul>
          </div>
        </aside>

        <section className="chat-panel">
          <div className="chat-header">
            <div className="chat-header-top">
              <div>
                <p className="eyebrow">Active Chat</p>
                <h2>{activeRecipient?.name || activeRecipient?.email || "Start a conversation"}</h2>
                <p className="chat-subtitle">
                  {activeRecipient?.email || "Click a profile from previous chats or search by email below."}
                </p>
              </div>
            </div>
            <div className="chat-search-row">
              <input
                type="email"
                placeholder="Search user by email"
                value={chatSearchEmail}
                onChange={(event) => setChatSearchEmail(event.target.value)}
              />
              <button type="button" onClick={handleSearchChat}>
                Open Chat
              </button>
            </div>
          </div>

          <div className="messages">
            {!messages.length ? (
              <div className="messages-empty">
                <h3>No messages yet</h3>
                <p>Choose an old chat from the left or search a user email to start a new one.</p>
              </div>
            ) : null}
            {messages.map((message) => {
              const isMine = message.sender.id === user.id;
              return (
                <div key={message.id} className={`message ${isMine ? "mine" : "theirs"}`}>
                  {!isMine && <div className="sender">{message.sender.name || message.sender.email}</div>}
                  <div className="bubble">{message.text}</div>
                </div>
              );
            })}
          </div>

          <div className="composer">
            <div className="composer-grid composer-grid-single">
              <label className="composer-field composer-message">
                <span>Message</span>
                <input
                  onChange={(event) => setText(event.target.value)}
                  type="text"
                  placeholder="Write your message"
                  value={text}
                />
              </label>
            </div>
            <button
              className="sendchat"
              onClick={chatHandler}
              disabled={!isConnected || !receiverEmail.trim() || !text.trim()}
            >
              Send
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashBoard;
