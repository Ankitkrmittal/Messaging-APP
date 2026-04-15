import useAuth from "../context/authContext"
import {io} from "socket.io-client"
import { useState } from "react"
import { useEffect } from "react"
import axios from "../api/axios"
import FriendsPage from "./Friends"

const DashBoard =()=>{
     const {user,logout,token} = useAuth();
     const [socket,setSocket]  = useState(null);
     const [isConnected,setIsConnected] = useState(false);
     const [receiverEmail,setReceiverEmail] = useState("");
     const [text,setText] = useState("");
     const [messages,setMessages] = useState([]);
      const [friendList,setFriendList] = useState([])
     const [activeConversationId,setActiveConversationId] = useState("");
     

    

     useEffect(()=>{
        if (!token) {
          return;
        }

        const socket = io("http://localhost:4444",{
          auth:{
               token
          },
        });
        socket.on("connect",()=>{
          console.log("User Connected")
          setIsConnected(true);
        });
        socket.on("disconnect",()=>{
          console.log("User Disconnected")
          setIsConnected(false);
        });
        socket.on("chat:new",(data)=>{
          setMessages((prevMessages)=>[...prevMessages,data]);
        });
        setSocket(socket);
        return ()=>{
          setIsConnected(false);
          socket.disconnect();
        };
     },[token]);
     useEffect(()=>{
          if(!isConnected){
               return;
          }
          axios.get("/api/friend").then(({data})=>{
               console.log(data);
               setFriendList(data)
          });

     },[isConnected]);

     const chatHandler = function () {
          if(!socket || !receiverEmail.trim() || !text.trim()) {
               return;
          }

          socket.emit("chat:send",{receiverEmail,text},(msg)=>{
               if(!msg.ok){
                    return alert(msg.error);
               }
               setText("");
          })
     }

     const activeFriend = friendList.find((f)=>f.id === activeConversationId);
     const activeRecipient = activeFriend
       ? user.id === activeFriend.userA.id ? activeFriend.userB : activeFriend.userA
       : null;
     return (
    <div className="dashboard">
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <div className="sidebar-panel profile-panel">
            <div>
              <p className="eyebrow">Messaging Hub</p>
              <h1>{user.name || "Welcome back"}</h1>
              <p className="profile-email">{user.email}</p>
            </div>
            <div className={`status-pill ${isConnected ? "live" : "idle"}`}>
              <span className="status-dot"></span>
              {isConnected ? "Connected" : "Reconnecting"}
            </div>
            <button className="logout-btn" onClick={() => logout()}>
              Logout
            </button>
          </div>

          <div className="sidebar-panel contacts-panel">
            <div className="friends-header-row">
              <div>
                <p className="eyebrow">Contacts</p>
                <h2>Conversations</h2>
              </div>
              <span className="friend-count">{friendList.length}</span>
            </div>

          {/* <ul className="friend-list">
            {friendList.map((f) => {
              const friend = user.id === f.userA.id ? f.userB : f.userA;
              const isActive = f.id === activeConversationId;
              return (
                <li
                  key={f.id}
                  className={`friend-item ${isActive ? "active" : ""}`}
                  onClick={() => {
                    setReceiverEmail(friend.email);
                    setActiveConversationId(f.id);

                    axios
                      .get("/api/user/messages", {
                        params: {
                          conversationId: f.id,
                        },
                      })
                      .then(({ data }) => {
                        console.log(data);
                        setMessages(data);
                      });
                  }}
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
            })}
          </ul> */}

          {/* <ul className="friend-list">
            {friendList}

          </ul> */}
          {/* {friendList.map((user) => (
          <li key={user.id}>
            <strong>{user.name}</strong><br />
            <span>{user.email}</span>
          </li>
        ))} */}
          <ul>
            <FriendsPage></FriendsPage>
             
             
          </ul>

          </div>
        </aside>

        <section className="chat-panel">
          <div className="chat-header">
            <div>
              <p className="eyebrow">Active Chat</p>
              <h2>{activeRecipient?.name || "Start a conversation"}</h2>
              <p className="chat-subtitle">
                {activeRecipient?.email || "Pick a contact or enter an email to send a new message."}
              </p>
            </div>
          </div>

          <div className="messages">
            {!messages.length ? (
              <div className="messages-empty">
                <h3>No messages yet</h3>
                <p>Select a conversation from the left, or start one by entering an email below.</p>
              </div>
            ) : null}
            {messages.map((m) => {
              const isMine = m.sender.id === user.id;
              return (
                <div
                  key={m.id}
                  className={`message ${isMine ? "mine" : "theirs"}`}
                >
                  {!isMine && <div className="sender">{m.sender.name}</div>}
                  <div className="bubble">{m.text}</div>
                </div>
              );
            })}
          </div>

          <div className="composer">
            <div className="composer-grid">
              <label className="composer-field">
                {/* <span>Recipient email</span> */}
                {/* <input
                  onChange={(e) => setReceiverEmail(e.target.value)}
                  type="email"
                  placeholder="name@example.com"
                  value={receiverEmail}
                /> */}
              </label>
              <label className="composer-field composer-message">
                <span>Message</span>
                <input
                  onChange={(e) => setText(e.target.value)}
                  type="text"
                  placeholder="Write something sharp, short, and clear"
                  value={text}
                />
              </label>
            </div>
            <button className="sendchat" onClick={chatHandler} disabled={!isConnected || !receiverEmail.trim() || !text.trim()}>
              Send
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashBoard;
