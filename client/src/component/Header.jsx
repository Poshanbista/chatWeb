import React, { useEffect, useRef, useState } from 'react'
import UserMenu from '../component/UserMenu.jsx'
import Setting from "../component/Setting.jsx"
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router'
import { FaSearch } from "react-icons/fa"
import { FaArrowLeft } from "react-icons/fa6"

export default function Header() {
    const user = useSelector((state) => state.user)
    const navigate = useNavigate();

    const [isOpenUserMenu, setIsOpenUserMenu] = useState(false)
    const [activeMenu, setActiveMenu] = useState("user")

    const [openSearch, setOpenSearch] = useState(false);
    const [search, setSearch] = useState("")

    //close search when clicked outside
    const searchRef = useRef(null)
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setOpenSearch(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    })

    // close userMenu when click on outside
    const userMenuRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(e.target)
            ) {
                setIsOpenUserMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    //searching
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!search || search.trim() === "") {
            setSearchResult([]);
            return
        }

        const delay = setTimeout(async () => {
            try {
                setLoading(true)

                const res = await fetch(`http://localhost:4000/api/user/search?query=${search}`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    }
                })

                const data = await res.json();

                if (res.ok) {
                    setSearchResult(data.users)
                } else {
                    setSearchResult([])
                }

            } catch (error) {
                console.log("search error", error)
            }
        }, 500);
        return () => clearTimeout(delay)
    }, [search])


    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="relative flex items-center h-16">

                    {/* Logo */}
                    <div className='relative w-80' ref={searchRef}>
                        <div className="flex flex-row gap-2">
                            <span
                                onClick={() => navigate("/chatpage")}
                                className="text-2xl font-bold text-blue-600 cursor-pointer"
                            >
                                ChatApp
                            </span>

                            <button
                                onClick={() => setOpenSearch(true)}
                                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                            >
                                <FaSearch className="text-gray-600" />
                            </button>
                        </div>

                        {
                            openSearch && (
                                <div className='absolute top-0 left-0 w-full bg-white z-50 rounded-xl shadow-lg p-3'>
                                    <div className='flex items-center gap-3'>
                                        <button
                                            onClick={() => setOpenSearch(false)}
                                        >
                                            <FaArrowLeft size={30} />
                                        </button>

                                        <input
                                            autoFocus
                                            type='text'
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder='search user....'
                                            className='w-full px-3 py-2 focus:outline-none bg-slate-100 rounded-lg '
                                        />
                                    </div>

                                    {/* Search Results */}
                                    {loading && (
                                        <p className="text-sm text-gray-500 mt-2">Searching...</p>
                                    )}

                                    {searchResult.length > 0 && (
                                        <div className="mt-3 max-h-64 overflow-y-auto">
                                            {searchResult.map((u) => (
                                                <div
                                                    key={u._id}
                                                    onClick={() => {
                                                        setOpenSearch(false);
                                                        setSearch("");
                                                        navigate(`/user/${u._id}`);
                                                    }}
                                                    className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100"
                                                >
                                                    {u.profile_picture ? (
                                                        <img
                                                            src={u.profile_picture}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                            alt="profile"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                            {u.displayName?.charAt(0)}
                                                        </div>
                                                    )}

                                                    <div>
                                                        <p className="font-medium">{u.displayName}</p>
                                                        <p className="text-sm text-gray-500">@{u.username}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {search && !loading && searchResult.length === 0 && (
                                        <p className="text-sm text-gray-500 mt-2">No users found</p>
                                    )}

                                </div>
                            )
                        }

                    </div>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex gap-6 font-medium text-gray-600">
                        <Link
                            to={"/chatpage"}
                            className="hover:text-blue-500 cursor-pointer transition"
                        >Chats
                        </Link>

                        <Link
                            to={"/request"}
                            className="hover:text-blue-500 cursor-pointer transition"
                        >Request
                        </Link>
                    </nav>


                    {/* User Profile */}
                    <div className="ml-auto relative" ref={userMenuRef}>
                        <div
                            onClick={() => {
                                setIsOpenUserMenu(prev => !prev)
                                setActiveMenu("user")
                            }}
                            className="flex items-center gap-2 cursor-pointer font-semibold text-gray-700 hover:text-blue-500 transition"
                        >
                            {user?.profile_picture ? (
                                <img
                                    src={user.profile_picture}
                                    alt="profile"
                                    className="w-10 h-10 rounded-full border object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                                    {user.displayName}
                                </div>
                            )}
                            <span className="hidden sm:block">{user?.displayName || "User"}</span>
                        </div>

                        {isOpenUserMenu && (
                            <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-lg border animate-fadeIn overflow-hidden z-50">
                                {activeMenu === "user" && (
                                    <UserMenu
                                        setActiveMenu={setActiveMenu}
                                        closeMenu={() => setIsOpenUserMenu(false)}
                                    />
                                )}
                                {activeMenu === "Setting" && (
                                    <Setting
                                        setActiveMenu={setActiveMenu}
                                        closeMenu={() => setIsOpenUserMenu(false)}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
