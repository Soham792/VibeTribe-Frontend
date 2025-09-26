import React, { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import Loading from '../components/Loading'
import StoriesBar from '../components/StoriesBar'
import PostCard from '../components/PostCard'
import RecentMessages from '../components/RecentMessages'
import toast from 'react-hot-toast'

const Feed = () => {
  const [feeds, setFeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const { getToken } = useAuth()

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        setLoading(true)
        const token = await getToken()
        const { data } = await api.get('/api/post/feed', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (data.success) setFeeds(data.posts)
        else toast.error(data.message || 'Failed to load feed')
      } catch (err) {
        console.error('Feed error:', err);
        toast.error(err.response?.data?.message || err.message || 'Network error')
      } finally {
        setLoading(false)
      }
    }

    fetchFeeds();
  }, [getToken])

  if (loading) return <Loading />

  return (
    <div className="h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8">
      <div className="p-4 space-y-6 max-w-2xl w-full">
        <StoriesBar />
        {feeds.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      <div className="hidden xl:block w-[360px] p-4">
        <RecentMessages />
      </div>
    </div>
  )
}

export default Feed
