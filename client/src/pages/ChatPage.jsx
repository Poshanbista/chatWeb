import React, { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { FaImage, FaMicrophone, FaStop } from "react-icons/fa";

const socket = io("http://localhost:4000", { autoConnect: true });

export default function ChatPage() {
  const user = useSelector((state) => state.user);
  const userId = user._id;
  const token = localStorage.getItem("AccessToken");

  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [attachments, setAttachments] = useState([]);

  const chatBodyRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Scroll bottom when messages update
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    fetchFriend();

    const savedFriend = localStorage.getItem("selectedFriend");
    if (savedFriend) {
      const friendObj = JSON.parse(savedFriend);
      setSelectedFriend(friendObj);
      fetchMessage(friendObj._id);
    }
  }, []);

  const handleVoiceClick = async () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true);
      audioChunksRef.current = [];

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.addEventListener("dataavailable", (event) => {
          audioChunksRef.current.push(event.data);
        });

        mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mp3" });
          sendVoice(audioBlob); // send audio blob to parent function
        });

        mediaRecorder.start();
      } catch (err) {
        console.error("Microphone access denied:", err);
        setIsRecording(false);
      }
    } else {
      // Stop recording
      setIsRecording(false);
      mediaRecorderRef.current.stop();
    }
  };


  // Fetch Friends
  const fetchFriend = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/friends/getFriend", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setFriends(data.friends || []);
    } catch (error) {
      toast.error("Error while fetching all friends");
    }
  };

  // Fetch Messages
  const fetchMessage = async (friendId) => {
    try {
      const res = await fetch(`http://localhost:4000/api/messages/${friendId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      toast.error("Error while fetching messages");
    }
  };

  // Send Message API
  const sendMessage = async () => {
    if (!messageText && attachments.length === 0) return;
    if (!selectedFriend) return;

    const formData = new FormData();
    formData.append("to", selectedFriend._id);
    formData.append("text", messageText);
    attachments.forEach((file) => formData.append("attachments", file));

    try {
      const res = await fetch("http://localhost:4000/api/messages/send", {
        method: "POST",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.messages]);
        setMessageText("");
        setAttachments([]);
      }
    } catch (error) {
      toast.error("Error while sending message");
    }
  };

  // Select friend
  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
    localStorage.setItem("selectedFriend", JSON.stringify(friend));
    fetchMessage(friend._id);
  };

  // Socket Listeners (Realtime Status + Delivery)
  useEffect(() => {
    if (!userId) return;

    socket.emit("join", userId);

    const handleReceivedMessage = (msg) => {
      if (selectedFriend && msg.from === selectedFriend._id) {
        setMessages((prev) => [...prev, msg]);

        // Mark delivered immediately
        fetch("http://localhost:4000/api/messages/update-status", {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ messageIds: [msg._id] }),
        });
      }
    };

    const handleMessageStatusUpdated = ({ messageId, status }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, status } : m))
      );
    };

    socket.on("receivedMessage", handleReceivedMessage);
    socket.on("messageStatusUpdated", handleMessageStatusUpdated);

    return () => {
      socket.off("receivedMessage", handleReceivedMessage);
      socket.off("messageStatusUpdated", handleMessageStatusUpdated);
    };
  }, [selectedFriend, userId]);

  // Mark Messages READ when Chat is opened
  useEffect(() => {
    if (!selectedFriend) return;

    const unreadIds = messages
      .filter((m) => m.to === userId && m.status !== "read")
      .map((m) => m._id);

    if (unreadIds.length > 0) {
      fetch("http://localhost:4000/api/messages/update-status", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messageIds: unreadIds }),
      });
    }
  }, [messages, selectedFriend, userId]);

  return (
    <div className="w-full h-[90vh] flex">

      {/* Sidebar */}
      <div className="w-1/3 border-r p-4 overflow-y-auto">
        <h2 className="font-bold text-lg mb-3">Chats</h2>
        {friends.map((f) => (
          <div
            key={f._id}
            onClick={() => handleSelectFriend(f.friend)}
            className={`flex items-center p-2 rounded cursor-pointer mb-1 ${selectedFriend?._id === f.friend._id
              ? "bg-gray-300"
              : "hover:bg-gray-200"
              }`}
          >
            <img
              src={f.friend.profile_picture}
              className="w-8 h-8 rounded-full mr-3"
            />
            <p>{f.friend.displayName}</p>
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div className="w-2/3 bg-gray-100 flex flex-col">

        {selectedFriend ? (
          <>
            {/* Header */}
            <div className="p-3 bg-black text-white flex items-center gap-3">
              <img
                src={selectedFriend.profile_picture}
                className="w-10 h-10 rounded-full"
              />
              <p className="font-semibold">{selectedFriend.displayName}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col" ref={chatBodyRef}>
              {messages.map((msg) => {
                const isOwnMessage = msg.from === userId;

                return (
                  <div
                    key={msg._id}
                    className={`my-2 flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    {/* Bubble */}
                    <div
                      className={`relative px-3 py-2 rounded-lg max-w-xs break-words ${isOwnMessage ? "bg-green-900 text-white" : "bg-gray-800 text-white"}`}
                    >
                      {/* Message text */}
                      <div>{msg.text}</div>

                      {/* Time and Status */}
                      <div className="flex items-center justify-end space-x-1 mt-1">
                        <span className="text-[10px] text-gray-200">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {/* ksdflsdf ✓✓ */}
                        {isOwnMessage && (
                          <span className="text-[10px]">
                            {msg.status === "sent" && "sent"}
                            {msg.status === "delivered" && "delivered"} 
                            {msg.status === "read" && (
                              <span className="text-blue-300 font-bold">seen</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );

              })}
            </div>

            {/* Input Field */}
            <div className="p-3 bg-white flex gap-2 items-center">
              <input type="file" accept="image/*" className="hidden" id="uploadImage" />
              <label htmlFor="uploadImage" className="cursor-pointer p-2 hover:bg-gray-200 rounded-full">
                <FaImage className="text-xl text-gray-600" />
              </label>

              <input
                type="text"
                className="flex-1 border rounded-full px-3 py-2"
                placeholder="Type message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />

              {/* Voice Icon */}
              <button
                onClick={handleVoiceClick}
                className={`p-2 rounded-full hover:bg-gray-200 ${isRecording ? "bg-red-500 text-white" : ""}`}
              >
                {isRecording ? (
                  <FaStop className="text-xl" />
                ) : (
                  <FaMicrophone className="text-gray-600 text-xl" />
                )}
              </button>


              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-4 py-2 rounded-full"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1">
            <p className="text-gray-600 font-medium">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
