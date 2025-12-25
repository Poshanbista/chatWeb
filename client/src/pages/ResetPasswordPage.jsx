import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom'

export default function ResetPasswordPage() {

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: ""
  })

  const location = useLocation();
  const navigate = useNavigate();


  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    })
  }

  useEffect(() => {
    if (!location?.state?.email) {
      navigate("/forgot-password")
      return
    }
    setFormData((prev) => ({
      ...prev,
      email: location?.state?.email
    }))
  }, [location,navigate])

  const handlesubmit = async (e) => {
    e.preventDefault();
    setLoading(true)

    try {
      const res = await fetch("http://localhost:4000/api/user/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        toast.error(data.message || "error in resetting password");
        return
      }

      toast.success(data.message)
      navigate("/")

    } catch (error) {
      setLoading(false)
      toast.error("something Error");
    }
  }


  return (
    <section className='w-full container mx-auto px-7'>
      <div className='bg-white my-4 w-full max-w-lg mx-auto rounded p-3'>
        <p className='font-bold text-lg mb-2'>Reset Password</p>

        <form className='grid gap-3' onSubmit={handlesubmit}>

          <div className='grid gap-1'>
            <label htmlFor='newPassword'>New Password: </label>
            <input
              type='text'
              id='newPassword'
              name='newPassword'
              value={formData.newPassword}
              onChange={handleOnChange}
              className='bg-blue-50 p-2 border rounded'
              placeholder='Enter new password'
            />
          </div>

          <div className='grid gap-1'>
            <label htmlFor='confirmPassword'>Confirm New Password: </label>
            <input
              type='text'
              id='confirmPassword'
              name='confirmPassword'
              value={formData.confirmPassword}
              onChange={handleOnChange}
              className='bg-blue-50 p-2 border rounded'
              placeholder='Enter confirm password'
            />
          </div>

          <button className='border p-2 bg-blue-600 text-white rounded hover:bg-green-600'>
            {loading ? "Reseting....." : "Reset Password"}
          </button>
        </form>
      </div>
    </section>
  )
}
