import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '@clerk/clerk-react'
import Sidebar from '../components/Sidebar'
import Loading from '../components/Loading'
import { fetchUser } from '../features/user/userSlice'
import toast from 'react-hot-toast'

const Layout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.user.value)
  const userLoading = useSelector((state) => state.user.loading)
  const userError = useSelector((state) => state.user.error)
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const init = async () => {
      if (isLoaded && isSignedIn) {
        try {
          const token = await getToken()
          if (token) {
            const result = await dispatch(fetchUser(token)).unwrap()
            if (!result) {
              toast.error('Failed to load user data')
              navigate('/login')
            }
          }
        } catch (error) {
          console.error('Error fetching user:', error)
          toast.error(error.message || 'Failed to load user data')
          navigate('/login')
        }
      }
    }
    init()
  }, [isLoaded, isSignedIn, getToken, dispatch, navigate])

  // Show loading state while authentication is being checked
  if (!isLoaded || userLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  // If there's an error, show it
  if (userError) {
    return (
      <div className="h-screen w-screen flex items-center justify-center flex-col gap-4">
        <div className="text-red-500">Error: {userError}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Retry
        </button>
      </div>
    )
  }

  // If no user data, redirect to login
  if (!user || !isSignedIn) {
    navigate('/login')
    return <Loading />
  }

  return (
    <div className="w-full flex h-screen">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 bg-slate-50">
        <Outlet />
      </div>
      {sidebarOpen ? (
        <X 
          className="absolute top-3 right-3 p-2 z-[100] bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden"
          onClick={() => setSidebarOpen(false)} 
        />
      ) : (
        <Menu 
          className="absolute top-3 right-3 p-2 z-[100] bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden"
          onClick={() => setSidebarOpen(true)} 
        />
      )}
    </div>
  )
}

export default Layout