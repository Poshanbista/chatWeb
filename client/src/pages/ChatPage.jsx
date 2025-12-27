import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import toast from "react-hot-toast"

export default function ChatPage() {

  const token = localStorage.getItem("AccessToken");
  const [friends, setFriends] = useState([]);

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
      console.log("Friend", data)

      setFriends(data.friends)

    } catch (error) {
      toast.error("Error while fetching all friends")
    }
  }

  useEffect(() => {
    fetchFriend()
  }, [])

  return (
    <div className='p-4'>
      <div className='mt-4 flex flex-col gap-3'>
        {
          friends.length > 0 ? (
            friends.map((friend) => (
              <div className='flex items-center gap-3 p-2 shadow-lg rounded cursor-pointer hover:bg-gray-100'>
                <img
                  src={friend.profile_picture}
                  alt='profile'
                  className='w-8 h-8 rounded-full object-cover'
                />

                <div>
                  <p className="text-lg font-semibold">{friend.displayName}</p>
                  <p className="text-xs text-gray-600">{friend.username}</p>
                </div>

              </div>
            ))
          ) : (
            <p className='text-gray-600 font-semibold text-lg'>No Friend</p>
          )
        }
      </div>
    </div>
  )
}
