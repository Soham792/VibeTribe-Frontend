import React, { useState } from 'react'
import { Search, MapPin, Users, UserPlus, UserCheck } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

const Discover = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [error, setError] = useState(null)
  const [followLoading, setFollowLoading] = useState({})
  const { getToken, isSignedIn } = useAuth()

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      setUsers([])
      toast.info('Enter a username to search')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const token = await getToken()
      const response = await api.post('/api/user/discover', 
        { input: searchInput.trim() }, 
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data?.success) {
        setUsers(response.data.users || [])
        if (response.data.users?.length === 0) {
          toast.info(`No user found with username "@${searchInput.trim()}"`)
        } else {
          toast.success(`Found ${response.data.users.length} user(s)`)
        }
      } else {
        toast.error(response.data?.message || 'Search failed')
        setUsers([])
      }
    } catch (err) {
      console.error('Search error:', err)
      toast.error('Search error')
      setUsers([])
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchInput('')
    setUsers([])
    setError(null)
  }

  const handleFollowUser = async (userId, username) => {
    try {
      setFollowLoading(prev => ({ ...prev, [userId]: true }))
      const token = await getToken()
      const response = await api.post('/api/user/follow', 
        { id: userId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data?.success) {
        toast.success(`Started following @${username}`)
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId 
              ? { ...user, isFollowing: true, followersCount: user.followersCount + 1 } 
              : user
          )
        )
      } else {
        toast.error(response.data?.message || 'Failed to follow user')
      }
    } catch (error) {
      console.error('Follow error:', error)
      toast.error('Error following user')
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }))
    }
  }

  const handleUnfollowUser = async (userId, username) => {
    try {
      setFollowLoading(prev => ({ ...prev, [userId]: true }))
      const token = await getToken()
      const response = await api.post('/api/user/unfollow', 
        { id: userId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data?.success) {
        toast.success(`Unfollowed @${username}`)
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId 
              ? { ...user, isFollowing: false, followersCount: Math.max(0, user.followersCount - 1) } 
              : user
          )
        )
      } else {
        toast.error(response.data?.message || 'Failed to unfollow user')
      }
    } catch (error) {
      console.error('Unfollow error:', error)
      toast.error('Error unfollowing user')
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }))
    }
  }

  const sendConnectionRequest = async (userId, username) => {
    try {
      const token = await getToken()
      const response = await api.post('/api/user/connect', 
        { id: userId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data?.success) {
        toast.success(`Connection request sent to @${username}!`)
      } else {
        toast.error(response.data?.message || 'Failed to send connection request')
      }
    } catch (error) {
      console.error('Connection request error:', error)
      toast.error('Error sending connection request')
    }
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Please sign in to discover users</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover People</h1>
          <p className="text-gray-600">Connect with amazing people and grow your network</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search exact username (e.g., user5725)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            {searchInput && (
              <button
                onClick={clearSearch}
                disabled={loading}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
            <button
              onClick={handleSearch}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching for users...</p>
          </div>
        )}

        {/* Users Count */}
        {users.length > 0 && !loading && (
          <div className="mb-6">
            <p className="text-gray-600">Search Results: Found {users.length} user(s)</p>
          </div>
        )}

        {/* Users Grid */}
        {users.length > 0 && !loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <div key={user._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={user.profile_picture || 'https://via.placeholder.com/50x50?text=User'}
                    alt={user.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/50x50?text=User'
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {user.full_name || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-600">@{user.username || 'no_username'}</p>
                  </div>
                </div>

                {user.location && (
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {user.location}
                  </div>
                )}

                {user.bio && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{user.bio}</p>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {user.followersCount || 0} followers
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {user.followingCount || 0} following
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {/* Follow/Unfollow Button */}
                  {user.isFollowing ? (
                    <button
                      onClick={() => handleUnfollowUser(user._id, user.username)}
                      disabled={followLoading[user._id]}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                      {followLoading[user._id] ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <UserCheck className="w-4 h-4 mr-2" />
                      )}
                      {followLoading[user._id] ? 'Loading...' : 'Following'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFollowUser(user._id, user.username)}
                      disabled={followLoading[user._id]}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                      {followLoading[user._id] ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <UserPlus className="w-4 h-4 mr-2" />
                      )}
                      {followLoading[user._id] ? 'Loading...' : 'Follow'}
                    </button>
                  )}

                  {/* Connect Button */}
                  <button
                    onClick={() => sendConnectionRequest(user._id, user.username)}
                    className="flex-1 border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : !loading && searchInput && users.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600 mb-6">
              No user found with exact username "@{searchInput}". Make sure you're using the exact username.
            </p>
            <button onClick={clearSearch} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Clear Search
            </button>
          </div>
        ) : !loading && !searchInput ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Search for Users</h3>
            <p className="text-gray-600">
              Enter a username in the search box above to find and connect with users.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default Discover
