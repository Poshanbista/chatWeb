import React, { useRef } from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import toast from "react-hot-toast"
import { io } from "socket.io-client"
import { useSelector } from "react-redux"

const socket = io("http://localhost:4000", { autoConnect: true })

export default function ChatPage() {

  const user = useSelector((state) => state.user)
  const userId = user._id

  const token = localStorage.getItem("AccessToken");
  const [friends, setFriends] = useState([]);

  const [selectedFriend, setSelectedFriend] = useState(null)

  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState("")
  const [attachments, setAttachments] = useState([])

  useEffect(() => {
    fetchFriend();

    const savedFriend = localStorage.getItem("selectedFriend");
    if (savedFriend) {
      const friendObj = JSON.parse(savedFriend);
      setSelectedFriend(friendObj);
      fetchMessage(friendObj._id);
    }
  }, [])

  // fetch friend
  const fetchFriend = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/friends/getFriend", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${token}`
        }
      })

      const data = await res.json();

      setFriends(data.friends || [])

    } catch (error) {
      toast.error("Error while fetching all friends")
    }
  }

  //fetch message API
  const fetchMessage = async (friendId) => {
    try {

      const res = await fetch(`http://localhost:4000/api/messages/${friendId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${token}`
        }
      });

      const data = await res.json();
      setMessages(data.messages || []);
      scrollToBottom();

    } catch (error) {
      toast.error("Error while fetching messages");
    }
  }

  //send message API
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
        headers: {
          "authorization": `Bearer ${token}`, // only Authorization header
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [...prev, data.messages]); // append new message
        setMessageText(""); // clear input
        setAttachments([]); // clear files
        scrollToBottom();
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error(error); // log the real error
      toast.error("Error while sending message");
    }
  };


  const chatBodyRef = useRef(null)

  // Scroll chat to bottom
  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }

  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
    localStorage.setItem("selectedFriend", JSON.stringify(friend)); // Save only when user clicks
    fetchMessage(friend._id);
  };


  useEffect(() => {
    if (!userId) return;

    // Join user's own room
    socket.emit("join", userId);

    // Listen for real-time messages
    const handleReceivedMessage = (msg) => {
      if (selectedFriend && msg.from === selectedFriend._id) {
        setMessages((prev) => [...prev, msg]); // Update messages
        scrollToBottom();
      }
    };

    socket.on("receivedMessage", handleReceivedMessage);

    // Clean up listener
    return () => {
      socket.off("receivedMessage", handleReceivedMessage);
    };
  }, [selectedFriend, userId]);




  return (
    <div className='w-full h-[90vh] flex bg-white'>
      <div className="w-1/3 border-r p-4 overflow-y-auto flex flex-col gap-0.5">
        <h2 className="font-bold text-lg mb-3">Chats</h2>
        {friends.map((f) => (
          <div
            key={f._id}
            onClick={() => handleSelectFriend(f.friend)}
            className={`flex items-center gap-3 p-2 rounded-full cursor-pointer hover:bg-gray-600  
              ${selectedFriend?._id === f.friend._id ? "bg-gray-400" : "bg-white text-black"
              }`}
          >
            <img
              src={f.friend.profile_picture}
              className="w-8 h-8 rounded-full" />
            <div>
              <p className="font-semibold">{f.friend.displayName} ({f.friend.username})</p>
              {/* <p className="text-xs text-gray-600">{f.friend.username}</p> */}
            </div>
          </div>
        ))}
      </div>

      <div className='w-2/3 bg-gray-100 flex flex-col'>
        {
          selectedFriend ? (
            <>
              {/* Chat Header */}
              <div className='flex items-center gap-3 p-3 bg-black text-white shadow'>
                <img
                  src={selectedFriend.profile_picture}
                  alt='profile'
                  className='w-10 h-10 rounded-full object-cover'
                />
                <div>
                  <h3 className='font-semibold text-lg'>{selectedFriend.displayName}</h3>
                  <p className='text-xs text-gray-500'>{selectedFriend.username}</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div
                className="flex-1 p-4 overflow-y-auto flex flex-col" // add flex flex-col
                ref={chatBodyRef}
              >
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    const isOwnMessage = msg.from === userId; // userId = logged-in user's ID

                    return (
                      <div
                        key={msg._id}
                        className={`my-2 p-2 rounded-lg max-w-xs break-words
                           ${isOwnMessage ? "bg-blue-500 text-white self-end" : "bg-gray-200 text-black self-start"}`}
                      >
                        {msg.text && <p>{msg.text}</p>}

                        {msg.attachments &&
                          msg.attachments.map((att, i) => (
                            <div key={i} className="mt-1">
                              {att.endsWith(".mp3") ? (
                                <audio controls src={att}></audio>
                              ) : att.endsWith(".pdf") ? (
                                <a
                                  href={att}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline"
                                >
                                  PDF File
                                </a>
                              ) : (
                                <img
                                  src={att}
                                  className="w-40 h-40 object-cover rounded-md mt-1"
                                />
                              )}
                            </div>
                          ))}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-500 mt-4">No messages yet</p>
                )}
              </div>


              {/* chat input field */}
              <div className='p-3 bg-white flex gap-2'>
                <input
                  type='text'
                  placeholder='type a message'
                  className='flex-1 py-2 px-3 border rounded-full outline-none'
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <input
                  type="file"
                  multiple
                  onChange={(e) => setAttachments([...e.target.files])}
                />


                <button
                  onClick={sendMessage}
                  className='bg-blue-600 text-white px-4 rounded-full'>
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className='flex items-center justify-center flex-1  '>
              <p className='text-gray-500 font-semibold'>Select Friend to Chat</p>
            </div>
          )
        }
      </div>
    </div >
  )
}
