import React from 'react'
import { FaArrowLeft } from "react-icons/fa6"

export default function Setting({ setActiveMenu }) {
    return (
        <section className="p-4">

            <div className='flex items-center gap-4 py-2'>
                {/* Back */}
                <button
                    onClick={() => setActiveMenu("user")}
                    className="hover:text-blue-600 "
                >
                    <FaArrowLeft size={25} />

                </button>
                <div className='font-semibold'>
                    Setting and Privacy
                </div>
            </div>

            {/* Settings list */}
            <div className="space-y-2">
                <p className="cursor-pointer hover:bg-gray-50 p-2 rounded-md">
                    Change Password
                </p>
                <p className="cursor-pointer hover:bg-gray-50 p-2 rounded-md">
                    Friends
                </p>
            </div>
        </section>
    )
}
