import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from "react-hot-toast"
import { LuRefreshCw } from "react-icons/lu";

export default function RegistrationPage() {

  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    displayName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    captchaText: ""
  })

  const [captcha, setCaptcha] = useState({
    svg: "",
    sessionId: " "
  });

  const [loading, setLoading] = useState(false)

  const fetchCaptcha = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/user/captcha")
      const data = await res.json();
      setCaptcha({ svg: data.svg, sessionId: data.sessionId });


    } catch (error) {
      console.log("captcha fetch Error", error)
    }
  }

  useEffect(() => {
    fetchCaptcha()
  }, [])

  const handleonChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    }
    )
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      ...formData,
      sessionId: captcha.sessionId
    }

    try {

      const res = await fetch("http://localhost:4000/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json();
      setLoading(false)

      if (!res.ok) {
        setLoading(false)
        toast.error(data.message || "Registration failed");
        fetchCaptcha();
        return
      }

      toast.success(data.message);

      setFormData({
        displayName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        captchaText: ""
      })

      navigate("/")

    } catch (error) {
      setLoading(false);
      toast.error("something error")
    }
  }


  return (
    <section className='w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 flex items-center justify-center'>
      <div className='bg-white w-full max-w-md sm:max-w-lg md:max-w-md lg:max-w-lg mx-auto rounded-2xl shadow-lg overflow-hidden border border-gray-100'>
        <div className='bg-gradient-to-r from-green-600 to-indigo-700 p-6'>
          <h1 className='text-center font-bold text-2xl sm:text-3xl text-white'>Create Your Account</h1>
          <p className='text-center text-blue-100 mt-2 text-sm sm:text-base'>Join our community today</p>
        </div>

        <form className='p-6 space-y-5' onSubmit={handleSubmit}>
          <div className='space-y-2'>
            <label htmlFor='displayName' className='block text-sm sm:text-base font-medium text-gray-700'>
              Display Name
            </label>
            <input
              type='text'
              id='displayName'
              name='displayName'
              maxLength={30}
              value={formData.displayName}
              onChange={handleonChange}
              autoComplete="new-password"
              className='capitalize w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-sm sm:text-base'
              placeholder='Enter your display name'
              required
            />
          </div>
          <div className='space-y-2'>
            <label htmlFor='username' className='block text-sm sm:text-base font-medium text-gray-700'>
              Username
            </label>
            <input
              type='text'
              id='username'
              name='username'
              maxLength={30}
              value={formData.username}
              onChange={handleonChange}
              autoComplete="new-password"
              className='capitalize w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-sm sm:text-base'
              placeholder='Enter unique username'
              required
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='email' className='block text-sm sm:text-base font-medium text-gray-700'>
              Email Address
            </label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleonChange}
              autoComplete="new-password"
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-sm sm:text-base'
              placeholder='Enter your email'
              required
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='password' className='block text-sm sm:text-base font-medium text-gray-700'>
              Password
            </label>
            <input
              type='password'
              id='password'
              name='password'
              value={formData.password}
              onChange={handleonChange}
              autoComplete="new-password"
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-sm sm:text-base'
              placeholder='Create a password'
              required
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='confirmPassword' className='block text-sm sm:text-base font-medium text-gray-700'>
              Confirm Password
            </label>
            <input
              type='password'
              id='confirmPassword'
              name='confirmPassword'
              value={formData.confirmPassword}
              onChange={handleonChange}
              autoComplete="new-password"
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-sm sm:text-base'
              placeholder='Confirm your password'
              required
            />
          </div>

          {/* Captcha Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Captcha</label>
            <div className="flex items-center gap-4">
              <span className="px-4 py-2 bg-gray-200 font-bold tracking-widest text-lg rounded">
                {captcha.svg &&
                  <div
                    className='border px-2 py-1 rounded'
                    dangerouslySetInnerHTML={{ __html: captcha.svg }}
                  />
                }
              </span>

              <button
                type="button"
                onClick={fetchCaptcha}
                className="text-green-500 hover:text-blue-600 text-sm"
              >
                <LuRefreshCw size={25} />
              </button>
            </div>
          </div>

          {/* Captcha Input */}
          <div>
            <input
              type="text"
              name="captchaText"
              value={formData.captchaText}
              onChange={handleonChange}
              className="w-full px-4 py-3 border rounded-lg"
              placeholder="Enter captcha"
              required
            />
          </div>
          {/* Create Account Button */}
          <button
            type='submit'
            className='w-full bg-gradient-to-r from-green-600 to-indigo-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-indigo-800 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5 shadow-md text-sm sm:text-base'
          >
            {loading ? "creating....." : "Create Account"}
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
