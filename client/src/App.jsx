import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Outlet } from 'react-router'
import { Toaster } from 'react-hot-toast'
import Header from './component/Header'
import { useSelector } from 'react-redux'

function App() {

  const user = useSelector((state) => state.user)

  return (
    <div className='min-h-screen flex flex-col'>
      <Toaster position='right-bottom' reverseOrder={false} />
      {user._id && <Header />}
      <Outlet />
    </div>

  )
}

export default App
