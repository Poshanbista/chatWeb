import React from 'react'
import Divider from './Divider'
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from 'react-router'
import { clearUserDetails } from "../redux/slice/user.slice.js"
import toast from 'react-hot-toast'

export default function UserMenu({ setActiveMenu, closeMenu }) {

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const user = useSelector((state) => state.user)

    const handleLogout = async () => {
        const res = await fetch("http://localhost:4000/api/user/logout", {
            method: "POST",
            credentials: "include"
        })

        const data = await res.json()

        if (!res.ok) {
            toast.error(data.message || "Logout failed")
            return
        }

        toast.success(data.message)
        localStorage.clear()
        dispatch(clearUserDetails())

        closeMenu()
        navigate("/")
    }

    return (
        <section className="p-4">

            <Link to={"/profile"}
                onClick={closeMenu}
                className="font-semibold text-gray-800 text-2xl truncate cursor-pointer flex items-center gap-3 hover:shadow-md rounded-lg hover:bg-slate-200 p-1 ">
                {
                    user && (
                        <img
                            src={user.profile_picture}
                            alt='profile'
                            className='w-10 h-10 rounded-full border object-cover'
                        />
                    )
                }
                {user.displayName}
            </Link>

            <Divider />

            <button
                onClick={() => setActiveMenu("Setting")}
                className="w-full text-left py-2 text-gray-600 hover:text-blue-500 hover:bg-gray-50 rounded-md transition"
            >
                Settings and Privacy
            </button>

            <button
                onClick={handleLogout}
                className="w-full text-left py-2 text-red-500 hover:bg-red-50 rounded-md transition"
            >
                Logout
            </button>
        </section>
    )
}
