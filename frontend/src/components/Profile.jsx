import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import useGetUserProfile from '@/hooks/useGetUserProfile';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Camera, 
  Grid3X3, 
  Bookmark, 
  Settings, 
  Share2, 
  MoreHorizontal,
  Compass,
  Award,
  Users,
  UserPlus,
  UserMinus,
  CheckCircle,
  Star
} from 'lucide-react';
import { getUserInitials } from '@/lib/utils';
import FollowersFollowingModal from './FollowersFollowingModal';
import { setUserProfile as setReduxUserProfile } from '@/redux/authSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

const Profile = () => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userId = params.id;
  
  const [activeTab, setActiveTab] = useState('posts');
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState('followers');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { userProfile: rawUserProfile, user } = useSelector(store => store.auth);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Clear profile data when userId changes
  useEffect(() => {
    setUserProfile(null);
    setIsLoading(true);
    dispatch(setReduxUserProfile(null));
  }, [userId, dispatch]);

  // Fetch user profile
  const { isLoading: profileLoading } = useGetUserProfile(userId);

  // Update local state when Redux state changes
  useEffect(() => {
    if (rawUserProfile && rawUserProfile._id === userId) {
      setUserProfile(rawUserProfile);
      setIsLoading(false);
    }
  }, [rawUserProfile, userId]);

  // Check if user is a guide
  useEffect(() => {
    const checkGuide = async () => {
      if (!userProfile?._id || userProfile._id !== userId) return;
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/guide/${userProfile._id}`);
        if (res.data.success && res.data.profile) {
          setUserProfile(prev => ({ ...prev, isGuide: true, guideProfile: res.data.profile }));
        } else {
          setUserProfile(prev => ({ ...prev, isGuide: false }));
        }
      } catch {
        setUserProfile(prev => ({ ...prev, isGuide: false }));
      }
    };
    checkGuide();
  }, [userProfile?._id, userId]);

  const isLoggedInUserProfile = user?._id === userProfile?._id;

  // Set initial follow state
  useEffect(() => {
    if (user && userProfile) {
      setIsFollowing(userProfile.followers?.includes(user._id));
    }
  }, [userProfile, user]);

  const handleFollowToggle = async () => {
    if (followLoading) return;
    try {
      setFollowLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/user/followorunfollow/${userProfile._id}`,
        {},
        { withCredentials: true }
      );
      toast.success(res.data.message);
      setIsFollowing(!isFollowing);
      // Update follower count locally
      setUserProfile(prev => ({
        ...prev,
        followers: isFollowing 
          ? prev.followers.filter(id => id !== user._id)
          : [...prev.followers, user._id]
      }));
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Action failed.');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleFollowersClick = () => {
    setFollowersModalTab('followers');
    setFollowersModalOpen(true);
  };

  const handleFollowingClick = () => {
    setFollowersModalTab('following');
    setFollowersModalOpen(true);
  };

  const handleMessageClick = () => {
    navigate('/chat', { state: { selectedUser: userProfile } });
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/profile/${userProfile._id}`;
    navigator.clipboard.writeText(profileUrl);
    toast.success('Profile link copied to clipboard!');
    setShareDialogOpen(false);
  };

  const displayedPost = activeTab === 'posts' ? userProfile?.posts : userProfile?.bookmarks;

  // Loading state
  if (isLoading || profileLoading || !userProfile || userProfile._id !== userId) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-white via-blue-50 to-green-50 dark:from-gray-900 dark:via-blue-950 dark:to-green-950 transition-colors duration-300'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          {/* Skeleton Header */}
          <div className='relative'>
            {/* Cover Photo Skeleton */}
            <div className='h-32 sm:h-40 md:h-48 rounded-2xl bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse' />
            
            {/* Profile Info Skeleton */}
            <div className='relative -mt-12 sm:-mt-14 md:-mt-16 px-4'>
              <div className='flex flex-col sm:flex-row items-center sm:items-end gap-4'>
                <div className='w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse border-4 border-white dark:border-gray-900' />
                <div className='flex-1 space-y-2 text-center sm:text-left pb-2'>
                  <div className='h-6 w-40 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse mx-auto sm:mx-0' />
                  <div className='h-4 w-28 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mx-auto sm:mx-0' />
                  <div className='flex gap-4 justify-center sm:justify-start'>
                    {[1, 2, 3].map(i => (
                      <div key={i} className='h-8 w-16 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse' />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Posts Skeleton */}
          <div className='mt-6 grid grid-cols-3 gap-1 sm:gap-2 md:gap-3'>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className='aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg sm:rounded-xl animate-pulse' />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-white via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors duration-300'>
      <div className='max-w-3xl mx-auto px-4 py-6'>
        
        {/* Profile Header Card */}
        <div className='adventure-card p-5 sm:p-6 mb-4'>
          <div className='flex flex-col sm:flex-row items-center sm:items-start gap-4'>
            
            {/* Avatar */}
            <div className='relative flex-shrink-0'>
              <Avatar className='w-20 h-20 sm:w-24 sm:h-24 border-2 border-white dark:border-gray-700 shadow-lg'>
                <AvatarImage src={userProfile?.profilePicture} alt={userProfile?.username} className='object-cover' />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-green-500 text-white font-bold text-xl sm:text-2xl">
                  {getUserInitials(userProfile?.username)}
                </AvatarFallback>
              </Avatar>
              
              {/* Guide Badge */}
              {userProfile?.isGuide && (
                <div className='absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full p-1.5 shadow-md'>
                  <Compass className='w-3 h-3 text-white' />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className='flex-1 text-center sm:text-left'>
              <div className='flex flex-col sm:flex-row items-center sm:items-center gap-2 mb-1'>
                <h1 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-white'>
                  {userProfile?.username}
                </h1>
                {userProfile?.isGuide && (
                  <Badge className='bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-0 text-[10px] px-2 py-0.5'>
                    <Star className='w-2.5 h-2.5 mr-0.5' />
                    Guide
                  </Badge>
                )}
                {userProfile?.followers?.length >= 100 && (
                  <CheckCircle className='w-4 h-4 text-blue-500' />
                )}
              </div>
              
              {/* Stats Row */}
              <div className='flex items-center justify-center sm:justify-start gap-4 sm:gap-6 my-3'>
                <button onClick={() => handleTabChange('posts')} className='text-center hover:opacity-70 transition-opacity'>
                  <span className='font-bold text-gray-900 dark:text-white'>{userProfile?.posts?.length || 0}</span>
                  <span className='text-xs text-gray-500 dark:text-gray-400 ml-1'>posts</span>
                </button>
                <button onClick={handleFollowersClick} className='text-center hover:opacity-70 transition-opacity'>
                  <span className='font-bold text-gray-900 dark:text-white'>{userProfile?.followers?.length || 0}</span>
                  <span className='text-xs text-gray-500 dark:text-gray-400 ml-1'>followers</span>
                </button>
                <button onClick={handleFollowingClick} className='text-center hover:opacity-70 transition-opacity'>
                  <span className='font-bold text-gray-900 dark:text-white'>{userProfile?.following?.length || 0}</span>
                  <span className='text-xs text-gray-500 dark:text-gray-400 ml-1'>following</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className='flex items-center gap-2 justify-center sm:justify-start'>
                {isLoggedInUserProfile ? (
                  <>
                    <Link to="/account/edit">
                      <Button size='sm' variant='outline' className='text-xs h-8 px-4 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'>
                        Edit Profile
                      </Button>
                    </Link>
                    <Button 
                      size='sm'
                      variant='outline' 
                      className='text-xs h-8 px-3 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                      onClick={() => setShareDialogOpen(true)}
                    >
                      <Share2 className='w-3.5 h-3.5' />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size='sm'
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={`text-xs h-8 px-4 ${
                        isFollowing 
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {followLoading ? (
                        <div className='w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin' />
                      ) : isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    {isFollowing && (
                      <Button 
                        size='sm'
                        variant='outline'
                        onClick={handleMessageClick}
                        className='text-xs h-8 px-3 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                      >
                        <MessageCircle className='w-3.5 h-3.5' />
                      </Button>
                    )}
                    <Button 
                      variant='ghost' 
                      size='sm'
                      onClick={() => setShareDialogOpen(true)}
                      className='h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    >
                      <MoreHorizontal className='w-4 h-4' />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {userProfile?.bio && (
          <div className='adventure-card p-4 mb-4'>
            <p className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed'>
              {userProfile.bio}
            </p>
          </div>
        )}

        {/* Guide Stats (if user is a guide) */}
        {userProfile?.isGuide && userProfile?.guideProfile && (
          <div className='adventure-card p-4 mb-4'>
            <div className='flex items-center gap-2 mb-3'>
              <Award className='w-4 h-4 text-orange-500' />
              <span className='text-sm font-medium text-gray-900 dark:text-white'>Travel Guide</span>
            </div>
            <div className='grid grid-cols-4 gap-2'>
              <div className='text-center'>
                <p className='text-base font-bold text-gray-900 dark:text-white'>
                  {userProfile?.guideProfile?.rating?.toFixed(1) || '5.0'}
                </p>
                <p className='text-[10px] text-gray-500 dark:text-gray-400'>Rating</p>
              </div>
              <div className='text-center'>
                <p className='text-base font-bold text-gray-900 dark:text-white'>
                  {userProfile?.guideProfile?.totalTours || 0}
                </p>
                <p className='text-[10px] text-gray-500 dark:text-gray-400'>Tours</p>
              </div>
              <div className='text-center'>
                <p className='text-base font-bold text-gray-900 dark:text-white'>
                  {userProfile?.guideProfile?.languages?.length || 1}
                </p>
                <p className='text-[10px] text-gray-500 dark:text-gray-400'>Languages</p>
              </div>
              <div className='text-center'>
                <p className='text-base font-bold text-gray-900 dark:text-white'>
                  {userProfile?.guideProfile?.yearsOfExperience || 1}+
                </p>
                <p className='text-[10px] text-gray-500 dark:text-gray-400'>Years</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className='flex items-center justify-center gap-6 border-b border-gray-200 dark:border-gray-700 mb-4'>
          <button 
            onClick={() => handleTabChange('posts')}
            className={`flex items-center gap-1.5 py-3 px-1 border-b-2 transition-all duration-200 ${
              activeTab === 'posts' 
                ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white' 
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Grid3X3 className='w-4 h-4' />
            <span className='text-xs font-medium uppercase'>Posts</span>
          </button>
          
          <button 
            onClick={() => handleTabChange('saved')}
            className={`flex items-center gap-1.5 py-3 px-1 border-b-2 transition-all duration-200 ${
              activeTab === 'saved' 
                ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white' 
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Bookmark className='w-4 h-4' />
            <span className='text-xs font-medium uppercase'>Saved</span>
          </button>
        </div>

        {/* Posts Grid */}
        {displayedPost?.length > 0 ? (
          <div className='grid grid-cols-3 gap-0.5 sm:gap-1'>
            {displayedPost.map((post) => (
              <div 
                key={post?._id} 
                className='relative aspect-square group cursor-pointer overflow-hidden'
                onClick={() => handlePostClick(post?._id)}
              >
                <img 
                  src={post.image} 
                  alt='post' 
                  className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105' 
                />
                
                {/* Overlay on hover */}
                <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center'>
                  <div className='flex items-center gap-4 text-white'>
                    <div className='flex items-center gap-1'>
                      <Heart className='w-4 h-4 fill-white' />
                      <span className='text-sm font-semibold'>{post?.likes?.length || 0}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <MessageCircle className='w-4 h-4 fill-white' />
                      <span className='text-sm font-semibold'>{post?.comments?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <Camera className='w-12 h-12 text-gray-300 dark:text-gray-600 mb-3' />
            <h3 className='text-base font-medium text-gray-900 dark:text-white mb-1'>
              {activeTab === 'posts' ? 'No Posts Yet' : 'No Saved Posts'}
            </h3>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              {activeTab === 'posts' 
                ? isLoggedInUserProfile 
                  ? 'Share your travel moments!'
                  : 'No posts to show.'
                : 'Save posts to see them here.'
              }
            </p>
          </div>
        )}
        
        {/* Followers/Following Modal */}
        <FollowersFollowingModal
          open={followersModalOpen}
          setOpen={setFollowersModalOpen}
          userId={userId}
          activeTab={followersModalTab}
        />

        {/* Share Profile Dialog */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent className='bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 max-w-xs'>
            <DialogHeader>
              <DialogTitle className='text-sm text-gray-900 dark:text-white'>Share Profile</DialogTitle>
            </DialogHeader>
            <Button 
              size='sm'
              onClick={handleShareProfile}
              className='w-full bg-blue-500 hover:bg-blue-600 text-white text-xs h-9'
            >
              <Share2 className='w-3.5 h-3.5 mr-1.5' />
              Copy Profile Link
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Profile;
