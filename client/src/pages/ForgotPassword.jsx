import React from 'react'
import { useState } from 'react'
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router'

export default function ForgotPassword() {

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: ""
    })

    const handleonChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)

        try {
            const res = await fetch("http://localhost:4000/api/user/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            })

            const data = await res.json();

            if (!res.ok) {
                setLoading(false)
                toast.error(data.message || "error in forgot password")
                return
            }

            toast.success(data.message);

            setFormData({
                email: ""
            })

            navigate("/verification-otp", {
                state: formData
            })
        } catch (error) {
            setLoading(false);
            toast.error("something error")
        }
    }
    return (
        <section className='w-full container mx-auto px-7'>
            <div className='bg-white w-full max-w-md sm:max-w-lg md:max-w-md lg:max-w-lg mx-auto rounded-xl shadow-lg p-6 sm:p-8'>
                <p className='text-center font-bold text-xl sm:text-2xl mb-4'>Forgot Password</p>

                <form className='grid gap-2' onSubmit={handleSubmit}>
                    <div>
                        <label className='text-sm sm:text-base font-medium'>Email</label>
                        <input
                            type='email'
                            id='email'
                            name='email'
                            value={formData.email}
                            onChange={handleonChange}
                            className='bg-blue-50 p-2 sm:p-3 border rounded-lg w-full outline-none text-sm sm:text-base'
                            required
                            placeholder='Enter your register email'
                        />
                    </div>

                    <button className="bg-green-600 hover:bg-yellow-800 mt-3 p-2 rounded">
                        {loading ? "Sending....." : "Send OTP"}
                    </button>

                </form>

                <div className='px-6 py-4 bg-gray-50 border-t border-gray-100'>
                    <p className='text-center text-sm sm:text-base text-gray-600'>
                        Already have an account?{' '}
                        <Link to={"/"} className='text-blue-400 hover:underline'>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}