import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

export default function ProfilePage() {

  const user = useSelector((state) => state.user)

  const dispatch = useDispatch()

  const [showModal, setShowModal] = useState(false);
  const [newProfile, setNewProfile] = useState(null);
  const [loading, setLoading] = useState(false);


  return (
    <section className='max-w-lg mx-auto'>
      <div>
        <img
          onClick={() => {
            setUserMenu(prev = !prev)
          }}
          src={user.profile_picture}
          alt="profile"
          className='w-44 h-44 rounded-full cursor-pointer border'
        />
        <p>
          Edit
        </p>
      </div>
    </section>
  )
}
