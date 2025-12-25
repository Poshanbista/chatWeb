import React, { useEffect, useState } from 'react'
import { useRef } from 'react'
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router'

export default function OTPverification() {

  const [formData, setFormData] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate()
  const inputRef = useRef([])
  const location = useLocation()

  useEffect(() => {
    if (!location?.state?.email) {
      navigate("/forgot-password")
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)

    try {
      const res = await fetch("http://localhost:4000/api/user/otp-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          otp: formData.join(""),
          email: location?.state?.email
        })
      })

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        toast.error(data.message || "Error in otp verification")
        return
      }

      toast.success(data.message);
      setFormData(["", "", "", "", "", ""])
      navigate("/reset-password", {
        state: {
          email: location?.state?.email
        }
      });
    } catch (error) {
      setLoading(false);
      toast.error("something error")
    }
  }

  return (
    <section className='w-full container mx-auto px-7'>
      <div className='bg-white my-4 w-full max-w-lg mx-auto rounded p-3'>
        <p className='font-bold text-lg mb-2'>OTP Verification</p>
        <form className='grid gap-3' onSubmit={handleSubmit}>
          <div className='grid gap-2'>
            <label htmlFor='otp'>Provide OTP:</label>
            <div className='flex items-center gap-2 justify-between mt-4'>
              {
                formData.map((element, index) => {
                  return (
                    <input
                      key={"otp" + index}
                      type='text'
                      id='otp'
                      name='otp'
                      ref={(ref) => {
                        inputRef.current[index] = ref
                        return ref;
                      }}
                      value={formData[index]}
                      onChange={(e) => {
                        const value = e.target.value

                        const newData = [...formData]
                        newData[index] = value
                        setFormData(newData)

                        if (value && index < 5) {
                          inputRef.current[index + 1].focus()
                        }
                      }}
                      maxLength={1}
                      className='w-full max-w-16 bg-blue-50 p-2 border rounded text-center font-bold'
                    />
                  )
                })
              }
            </div>
          </div>

          <button
            className='text-white bg-blue-500 hover:bg-green-800 py-2 rounded font-semibold my-3'>
            {loading ? "verifying...." : "Verify OTP"}
          </button>
        </form>
      </div>
    </section>
  )
}