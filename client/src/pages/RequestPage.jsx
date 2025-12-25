import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react'
import toast from 'react-hot-toast';
import { FaTimes } from "react-icons/fa";
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

export default function RequestPage() {

  const token = localStorage.getItem("AccessToken")
  const [requests, setRequests] = useState([])
  const [openModel, setOpenModel] = useState(null)

  const fetchFriendRequest = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/friend-request/getrequest", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${token}`
        }
      })
      const data = await res.json();

      setRequests(data.requests)

    } catch (error) {
      toast.error("Error in getting Friend Request")
    }
  }

  useEffect(() => {
    fetchFriendRequest()
  }, [])

  return (
    <div className='p-4'>
      <h2 className='text-xl font-bold mb-4'>Request</h2>
      {requests.length === 0 && <p>No Friend Request</p>}
      <ul>
        {
          requests.map((request) => (
            <li
              className=''
            >
              <div className='flex items-center gap-4 my-8 shadow-md '>
                <img
                  src={request.from.profile_picture}
                  alt='profile'
                  className='w-24 h-24 rounded-full'
                  onClick={() => setOpenModel(request)}
                />

                <div>
                  <h1 className="text-2xl font-bold">{request.from.displayName}</h1>
                  <p className="text-gray-500">@{request.from.username}</p>
                  <p className="text-xs text-gray-500 my-2">
                    {dayjs(request.createdAt).fromNow()} {/* relative time */}
                  </p>
                </div>

                <div className="flex gap-2 mx-auto">
                  <button
                    onClick={() => handleAction(req._id, "accept")}
                    className="px-3 py-1 bg-green-500 text-white rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleAction(req._id, "decline")}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Decline
                  </button>
                </div>
              </div>

            </li>
          ))
        }
      </ul>
      {
        openModel && (
          <div className='fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50'
            onClick={() => setOpenModel(null)}>

            <div className='relative'
              onClick={(e) => e.stopPropagation()}>

              <button
                onClick={() => setOpenModel(null)}
                className='absolute top-2 right-2 text-white text-2xl hover:text-gray-600'>
                <FaTimes size={30} />
              </button>

              <img
                src={openModel.from.profile_picture}
                alt="profile large"
                className="max-h-[80vh] max-w-[80vw] rounded-lg shadow-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
    </div>
  )
}
