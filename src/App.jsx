import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import { useDispatch } from 'react-redux'
import { fetchUser } from './features/user/userSlice'

import Layout from './pages/Layout'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Discover from './pages/Discover'
import Messages from './pages/Messages'
import Profile from './pages/Profile'
import Connections from './pages/Connections'
import CreatePost from './pages/CreatePost'
import ChatBox from './pages/ChatBox'
import { Toaster } from 'react-hot-toast'

function AppRoutes() {
  const { isLoaded, isSignedIn } = useUser();
  const clerk = useClerk();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isSignedIn) {
      // Ensure window.Clerk is set for axios interceptor
      window.Clerk = clerk;
      dispatch(fetchUser());
    }
  }, [isSignedIn, dispatch, clerk]);

  if (!isLoaded) {
    return <div className="h-screen w-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
    </div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={!isSignedIn ? <Login /> : <Layout />}>
        {isSignedIn && (
          <>
            <Route index element={<Feed />} />
            <Route path="discover" element={<Discover />} />
            <Route path="messages" element={<Messages />} />
            <Route path="messages/:userId" element={<ChatBox />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/:profileId" element={<Profile />} />
            <Route path="connections" element={<Connections />} />
            <Route path="create-post" element={<CreatePost />} />
          </>
        )}
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" />
    </>
  );
}