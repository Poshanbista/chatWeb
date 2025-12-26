import { Children, createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

//1. create context
export const GlobalContext = createContext();

//2. create provider
export const GlobalProvider = ({ children }) => {
    const token = localStorage.getItem("AccessToken")
    const [requests, setRequests] = useState([])

    //fetch frn request
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


    //accept frnd request
    const handleAcceptRequest = async (requestId) => {
        setRequests(prev => prev.filter(r => r._id !== requestId)) // remove request from ui after accept
        try {
            const res = await fetch(`http://localhost:4000/api/friend-request/accept-request/${requestId}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${token}`
                }
            })
            const data = await res.json();
            
            if (data.success) {
                setRequests(prev => prev.filter(r => r._id !== requestId));
                toast.success(data.message);
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error("Error while accept request")
        }
    }

    //declined friend request
    const handleDeclineRequest = async (requestId) => {
        // setRequests(prev => prev.filter(r => r._id !== requestId)) // remove request from ui after declined

        try {
            const res = await fetch(`http://localhost:4000/api/friend-request/declined-request/${requestId}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${token}`
                }
            })

            const data = await res.json();

            if (data.success) {
                setRequests(prev => prev.filter(r => r._id !== requestId));
                toast.success(data.message);
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error("Error while declined request")
        }
    }


    useEffect(() => {
        fetchFriendRequest()
    }, [])



    return (
        <GlobalContext.Provider value={{
            requests,
            fetchFriendRequest,
            handleAcceptRequest,
            handleDeclineRequest,
        }}>
            {children}
        </GlobalContext.Provider>
    )
}