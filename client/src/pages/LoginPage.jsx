import React from 'react'
import { Link, useNavigate } from 'react-router'
import { LuRefreshCw } from "react-icons/lu";
import { useState } from 'react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from "react-redux"
import { setUserDetails } from "../redux/slice/user.slice.js"


export default function LoginPage() {

  const token = localStorage.getItem("AccessToken");
  const user = JSON.parse(localStorage.getItem("user"))

  function checktoken() {
    if (!token && !user) {
      return
    }
    else {
      navigate("/chatpage")
    }
  }

  useEffect(() => {
    checktoken();
  }, [])

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    captchaText: ""
  })

  const [captcha, setCaptcha] = useState({
    svg: "",
    sessionId: ""
  });

  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

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
    fetchCaptcha();
  }, [])

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

    const payload = {
      ...formData,
      sessionId:captcha.sessionId
    }
    try {
      const res = await fetch("http://localhost:4000/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json();

      if (!res.ok) {
        setLoading(false)
        toast.error(data.message || "Login failed");
        fetchCaptcha();
        return;
      }

      toast.success(data.message);

      //send user data in the slice
      dispatch(setUserDetails(data.data.fullUser))

      localStorage.setItem("AccessToken", data.data.accessToken)
      localStorage.setItem("user", JSON.stringify(data.data.fullUser))

      setFormData({
        email: "",
        password: "",
        captchaText: ""
      })

      navigate("/chatpage")

    } catch (error) {
      toast.error("Something Error")
    }
  }

  return (
    <section className='w-full min-h-screen bg-blue-50 flex items-center justify-center px-4 sm:px-6'>
      <div className='bg-white w-full max-w-md sm:max-w-lg md:max-w-md lg:max-w-lg mx-auto rounded-xl shadow-lg p-6 sm:p-8'>
        <p className='text-center font-bold text-xl sm:text-2xl mb-4'>Login</p>
        <form className='grid gap-4' onSubmit={handleSubmit} >
          <div className='grid gap-1'>
            <label className='text-sm sm:text-base font-medium'>Email</label>
            <input
              type='text'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleonChange}
              className='bg-blue-50 p-2 sm:p-3 border rounded-lg w-full outline-none text-sm sm:text-base'
              required
            />
          </div>

          <div className='grid gap-1'>
            <label className='text-sm sm:text-base font-medium'>Password</label>
            <input
              type="password"
              id='password'
              name='password'
              value={formData.password}
              onChange={handleonChange}
              className='bg-blue-50 p-2 sm:p-3 border rounded-lg w-full outline-none text-sm sm:text-base'
              required
            />
          </div>

          {/* Captcha Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Captcha</label>
            <div className="flex items-center gap-4">
              {captcha.svg &&
                <div
                  className='border px-2 py-1 rounded select-none'
                  dangerouslySetInnerHTML={{ __html: captcha.svg }}
                />
              }
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

          <div className='flex justify-end hover:underline hover:text-blue-600 cursor-pointer'>
            <Link to={"/forgot-password"} className='font-semibold'>Forgot Password?</Link>
          </div>

          <button
            type='submit'
            className='w-full bg-green-500 text-white font-semibold p-2 sm:p-3 rounded-lg hover:bg-green-600 transition-all duration-200 text-sm sm:text-base'
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className='text-sm sm:text-base text-center'>
            Don't have an account?{' '}
            <Link to={"/registration"} className='text-blue-400 hover:underline'>
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </section>
  )

}
