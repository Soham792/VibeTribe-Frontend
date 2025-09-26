import React from 'react'
import { assets } from '../assets/assets'
import { Star } from 'lucide-react'
import {SignIn} from '@clerk/clerk-react'
import vibeTribeLogo from '../assets/logofinal.png'

const Login = () => {
  return (
    <div className='min-h-screen flex flex-col md:flex-row'>
      {/* Background Video */}
      <video 
        autoPlay 
        muted 
        loop 
        className='absolute top-0 left-0 -z-1 w-full h-full object-cover'
      >
        <source src="/src/assets/84703-586995504.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* left side : Branding  */}
      <div className='flex-1 flex flex-col items-start justify-between p-6 md:p-10 lg:pl-40'>
        {/* VibeTribe Logo - Optimized Size */}
        <img src={vibeTribeLogo} alt="VibeTribe" className='h-20 md:h-28 lg:h-32 w-auto object-contain'/>
        
        {/* Main Content - Properly Centered */}
        <div className='flex-1 flex flex-col justify-center'>
            <div className='flex items-center gap-3 mb-6'> 
                <img src={assets.group_users} alt="" className='h-8 md:h-10'/>
                <div>
                    <div className='flex'>
                        {Array(5).fill(0).map((_, i)=>(<Star key={i} className='size-4 md:size-4.5 text-transparent fill-amber-500'/>))}
                    </div>
                    <p className='text-gray-700'>Trusted by various users</p>
                </div>
            </div>
            <h1 className='text-3xl md:text-6xl md:pb-2 font-bold bg-gradient-to-r from-indigo-950 to-indigo-800 bg-clip-text text-transparent'>Discover your tribe</h1>
            <p className='text-xl md:text-3xl text-indigo-900 max-w-72 md:max-w-md mt-4'>Your gateway to worldwide friendships.</p>
        </div>
        
        {/* Bottom spacer */}
        <div className='h-4 md:h-8'></div>
      </div>
      
      {/* Right side: Login Form */}
      <div className='flex-1 flex items-center justify-center p-6 sm:p-10'>
            <SignIn />
      </div>
    </div>
  )
}

export default Login
