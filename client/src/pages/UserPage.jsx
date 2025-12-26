import React, { useContext, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router'
import { FaTimes } from "react-icons/fa";
import { FaUserPlus } from "react-icons/fa";
import { useSelector } from 'react-redux';
import { GlobalContext } from '../context/GlobalProvider';

export default function UserPage() {

    const { requests, handleAcceptRequest } = useContext(GlobalContext)

    const token = localStorage.getItem("AccessToken")
    const loggedInUser = useSelector((state) => state.user)
    const navigate = useNavigate()

    const { user_id } = useParams();
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);
    const [openModel, setOpenModel] = useState(false)

    const [requestSend, setRequestSend] = useState(false)
    const [requestReceived, setRequestReceived] = useState(false)
    const [isFriend, setIsFriend] = useState(false)

    const fetchEachUser = async () => {
        try {
            setLoading(true)
            const res = await fetch(`http://localhost:4000/api/user/${user_id}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${token}`
                }
            })

            const data = await res.json();


            if (!res.ok) {
                setLoading(false)
                toast.error(data.message || "fetching failed");
                return;
            }

            setUser(data.eachUser)

            if (data.eachUser._id === loggedInUser._id) {
                navigate("/profile")
            }

            setRequestSend(!!data.isFriendRequestSent);
            setRequestReceived(!!data.isFriendRequestReceived)
            setIsFriend(!!data.isFriendWith)


        } catch (error) {
            toast.error("Error in fetching Individual users")
        }
    }

    useEffect(() => {
        fetchEachUser()
    }, [user_id])


    const handleSendFriendRequest = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/friend-request/send-request/${user_id}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${token}`
                }
            })

            const data = await res.json();
            console.log("Data", data)

            if (!res.ok) {
                toast.error(data.message || "Friend request sending failed")
                return
            }

            toast.success(data.message);
            setRequestSend(true)

        } catch (error) {
            toast.error("Error in sending friend request")
        }
    }


    const handleCancelFriendRequest = async () => {
        try {

            const res = await fetch(`http://localhost:4000/api/friend-request/cancel-request/${user_id}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${token}`
                }
            })

            const data = await res.json();
            toast.success(data.message)

            setRequestSend(false)


        } catch (error) {
            toast.error("Error in canceling friend request")
        }
    }

    return (
        <div className="m-2">
            <div className="flex items-center  gap-4">
                <img
                    src={user.profile_picture}
                    alt="profile"
                    className="w-24 h-24 rounded-full object-cover"
                    onClick={() => setOpenModel(true)}
                />
                <div>
                    <h1 className="text-2xl font-bold">{user.displayName}</h1>
                    <p className="text-gray-500">@{user.username}</p>
                </div>

                {/* open profile picture in large */}
                {openModel && (
                    <div className='fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50'>
                        <div className='relative'>
                            <button
                                onClick={() => setOpenModel(false)}
                                className='absolute top-2 right-2 text-white text-2xl hover:text-gray-600'>
                                <FaTimes size={30} />
                            </button>
                            <img
                                src={user.profile_picture}
                                alt="profile large"
                                className="max-h-[80vh] max-w-[80vw] rounded-lg shadow-lg"
                                // ref={modelRef}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                )}
                <div className='mx-auto'>
                    {
                        isFriend ? (
                            <button
                                className='flex gap-1 items-center font-semibold border p-2 rounded-lg px-3 bg-blue-600 text-white hover:bg-blue-900 '
                            >
                                Friend
                            </button>
                        ) : requestReceived ? (
                            <div className="flex gap-2 mx-auto">
                                <button
                                    className="px-3 py-1 bg-green-500 text-white rounded"
                                >
                                    Accept
                                </button>
                                <button
                                    className="px-3 py-1 bg-red-500 text-white rounded"
                                >
                                    Decline
                                </button>
                            </div>
                        ) : requestSend ? (
                            <button
                                onClick={handleCancelFriendRequest}
                                className='flex gap-1 items-center font-semibold border p-2 rounded-lg px-3 bg-blue-600 text-white hover:bg-blue-900 '>
                                cancel Request
                            </button>
                        ) : (
                            <button
                                onClick={handleSendFriendRequest}
                                className='flex gap-1 items-center font-semibold border p-2 rounded-lg px-3 bg-blue-600 text-white hover:bg-blue-900 '>
                                <FaUserPlus size={20} />
                                Add friend
                            </button>
                        )
                    }
                </div>
            </div>
        </div>
    );
}

