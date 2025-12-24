import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import useGetUserProfile from '@/hooks/useGetUserProfile';
import { useState as useReactState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  AtSign, 
  Heart, 
  MessageCircle, 
  Grid3X3, 
  Bookmark, 
  Film, 
  UserCheck, 
  UserPlus,
  MapPin,
  Calendar,
  Settings,
  Share2,
  MoreHorizontal,
  Camera,
  Globe,
  Plane,
  Award
} from 'lucide-react';
import { getUserInitials } from '@/lib/utils';
import FollowersFollowingModal from './FollowersFollowingModal';
import { setUserProfile as setReduxUserProfile } from '@/redux/authSlice';

const Profile = () => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userId = params.id;
  
  const [activeTab, setActiveTab] = useState('posts');
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState('followers');
  const { userProfile: rawUserProfile, user } = useSelector(store => store.auth);
  const [userProfile, setUserProfile] = useReactState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullBio, setShowFullBio] = useState(false);
  const [hoveredPost, setHoveredPost] = useState(null);

  // Clear profile data when userId changes to prevent showing wrong profile
  useEffect(() => {
    setUserProfile(null);
    setIsLoading(true);
    dispatch(setReduxUserProfile(null));
  }, [userId, dispatch]);

  // Fetch user profile
  const { isLoading: profileLoading } = useGetUserProfile(userId);

  // Update local state when Redux state changes and matches current userId
  useEffect(() => {
    if (rawUserProfile && rawUserProfile._id === userId) {
      setUserProfile(rawUserProfile);
      setIsLoading(false);
    }
  }, [rawUserProfile, userId]);

  // Check if user is a guide by fetching their guide profile
  useEffect(() => {
    const checkGuide = async () => {
      if (!userProfile?._id || userProfile._id !== userId) return;
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/guide/${userProfile._id}`);
        if (res.data.success && res.data.profile) {
          setUserProfile({ ...userProfile, isGuide: true });
        } else {
          setUserProfile({ ...userProfile, isGuide: false });
        }
      } catch {
        setUserProfile({ ...userProfile, isGuide: false });
      }
    };
    checkGuide();
  }, [userProfile?._id, userId]);

  const isLoggedInUserProfile = user?._id === userProfile?._id;
  // Assume userProfile.isGuide is true if user is a guide (add this property if needed)

  const [isFollowing, setIsFollowing] = useState(false);

  // Set initial follow state
  useEffect(() => {
    if (user && userProfile) {
      setIsFollowing(userProfile.followers.includes(user._id));
    }
  }, [userProfile, user]);

  const handleFollowToggle = async () => {
    try {
      const res = await axios.post(
  `${import.meta.env.VITE_API_URL}/api/v1/user/followorunfollow/${userProfile._id}`,
        {},
        { withCredentials: true }
      );

      toast.success(res.data.message);
      setIsFollowing(!isFollowing); // toggle state
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Action failed.');
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
    // Navigate to chat page with the selected user
    navigate('/chat', { state: { selectedUser: userProfile } });
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${userId}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success('Profile link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const displayedPost = activeTab === 'posts' ? userProfile?.posts : userProfile?.bookmarks;

  // Calculate total likes across all posts
  const totalLikes = userProfile?.posts?.reduce((acc, post) => acc + (post?.likes?.length || 0), 0) || 0;

  // Show loading state until the correct profile is loaded
  if (isLoading || profileLoading || !userProfile || userProfile._id !== userId) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200'>
        <div className='max-w-4xl mx-auto px-4 py-8'>
          {/* Cover Skeleton */}
          <div className='animate-pulse bg-gray-300 dark:bg-gray-700 h-48 rounded-xl mb-[-60px]'></div>
          
          {/* Avatar Skeleton */}
          <div className='flex justify-center'>
            <div className='animate-pulse bg-gray-400 dark:bg-gray-600 rounded-full h-32 w-32 border-4 border-white dark:border-gray-900'></div>
          </div>
          
          {/* Content Skeleton */}
          <div className='mt-4 flex flex-col items-center space-y-4'>
            <div className='animate-pulse bg-gray-300 dark:bg-gray-700 h-8 w-48 rounded'></div>
            <div className='animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-32 rounded'></div>
            <div className='flex gap-8 mt-4'>
              <div className='animate-pulse bg-gray-300 dark:bg-gray-700 h-20 w-24 rounded-xl'></div>
              <div className='animate-pulse bg-gray-300 dark:bg-gray-700 h-20 w-24 rounded-xl'></div>
              <div className='animate-pulse bg-gray-300 dark:bg-gray-700 h-20 w-24 rounded-xl'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200'>
      <div className='max-w-4xl mx-auto px-4 py-6'>
        
        {/* Cover Image / Banner */}
        <div className='relative h-48 md:h-56 rounded-2xl overflow-hidden mb-[-60px] shadow-lg'>
          <div className='absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500'>
            {/* Decorative elements */}
            <div className='absolute inset-0 opacity-20'>
              <div className='absolute top-4 left-8'>
                <Plane className='w-12 h-12 text-white transform rotate-45' />
              </div>
              <div className='absolute top-12 right-16'>
                <Globe className='w-16 h-16 text-white' />
              </div>
              <div className='absolute bottom-8 left-1/4'>
                <MapPin className='w-8 h-8 text-white' />
              </div>
              <div className='absolute bottom-4 right-1/3'>
                <Camera className='w-10 h-10 text-white' />
              </div>
            </div>
          </div>
          
          {/* Settings button for own profile */}
          {isLoggedInUserProfile && (
            <Link to="/account/edit" className='absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors'>
              <Settings className='w-5 h-5 text-white' />
            </Link>
          )}
        </div>

        {/* Profile Section */}
        <div className='relative z-10 flex flex-col items-center'>
          {/* Avatar */}
          <div className='relative'>
            <Avatar className='h-32 w-32 border-4 border-white dark:border-gray-900 shadow-xl'>
              <AvatarImage src={userProfile?.profilePicture} alt="profilephoto" className='object-cover' />
              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-bold text-3xl">
                {getUserInitials(userProfile?.username)}
              </AvatarFallback>
            </Avatar>
            
            {/* Guide Badge */}
            {userProfile?.isGuide && (
              <div className='absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full p-1.5 shadow-lg'>
                <Award className='w-5 h-5 text-white' />
              </div>
            )}
            
            {/* Online Indicator */}
            <div className='absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full'></div>
          </div>

          {/* Username & Bio */}
          <div className='mt-4 text-center'>
            <div className='flex items-center justify-center gap-2'>
              <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                {userProfile?.username}
              </h1>
              {userProfile?.isGuide && (
                <Badge className='bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0'>
                  <Award className='w-3 h-3 mr-1' /> Guide
                </Badge>
              )}
            </div>
            
            <div className='flex items-center justify-center gap-1 mt-1'>
              <AtSign className='w-4 h-4 text-gray-500 dark:text-gray-400' />
              <span className='text-gray-500 dark:text-gray-400'>{userProfile?.username}</span>
            </div>

            {/* Bio */}
            <div className='mt-3 max-w-md mx-auto'>
              {userProfile?.bio ? (
                <p className='text-gray-700 dark:text-gray-300 text-sm leading-relaxed'>
                  {showFullBio || userProfile.bio.length <= 100 
                    ? userProfile.bio 
                    : `${userProfile.bio.substring(0, 100)}...`}
                  {userProfile.bio.length > 100 && (
                    <button 
                      onClick={() => setShowFullBio(!showFullBio)}
                      className='ml-1 text-emerald-600 dark:text-emerald-400 hover:underline font-medium'
                    >
                      {showFullBio ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </p>
              ) : (
                <p className='text-gray-400 dark:text-gray-500 text-sm italic'>
                  {isLoggedInUserProfile ? 'Add a bio to tell people about yourself' : 'No bio yet'}
                </p>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className='flex gap-4 md:gap-6 mt-6'>
            <div className='bg-white dark:bg-gray-800 rounded-xl px-6 py-4 shadow-md hover:shadow-lg transition-shadow cursor-default'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>{userProfile?.posts?.length || 0}</p>
                <p className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide'>Posts</p>
              </div>
            </div>
            
            <div 
              onClick={handleFollowersClick}
              className='bg-white dark:bg-gray-800 rounded-xl px-6 py-4 shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-105'
            >
              <div className='text-center'>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>{userProfile?.followers?.length || 0}</p>
                <p className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide'>Followers</p>
              </div>
            </div>
            
            <div 
              onClick={handleFollowingClick}
              className='bg-white dark:bg-gray-800 rounded-xl px-6 py-4 shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-105'
            >
              <div className='text-center'>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>{userProfile?.following?.length || 0}</p>
                <p className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide'>Following</p>
              </div>
            </div>

            <div className='bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl px-6 py-4 shadow-md hover:shadow-lg transition-shadow cursor-default'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-white'>{totalLikes}</p>
                <p className='text-xs text-white/80 uppercase tracking-wide'>Likes</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-3 mt-6'>
            {isLoggedInUserProfile ? (
              <>
                <Link to="/account/edit">
                  <Button className='bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full px-6 shadow-md'>
                    <Settings className='w-4 h-4 mr-2' /> Edit Profile
                  </Button>
                </Link>
                <Button 
                  variant='outline' 
                  className='rounded-full px-4 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                  onClick={handleShareProfile}
                >
                  <Share2 className='w-4 h-4' />
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleFollowToggle}
                  className={`rounded-full px-6 shadow-md ${
                    isFollowing 
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600' 
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white'
                  }`}
                >
                  {isFollowing ? (
                    <><UserCheck className='w-4 h-4 mr-2' /> Following</>
                  ) : (
                    <><UserPlus className='w-4 h-4 mr-2' /> Follow</>
                  )}
                </Button>
                
                {isFollowing && (
                  <Button 
                    variant='outline'
                    className='rounded-full px-6 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                    onClick={handleMessageClick}
                  >
                    <MessageCircle className='w-4 h-4 mr-2' /> Message
                  </Button>
                )}
                
                <Button 
                  variant='outline' 
                  className='rounded-full px-4 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                  onClick={handleShareProfile}
                >
                  <Share2 className='w-4 h-4' />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        <div className='mt-10 bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden'>
          {/* Tab Headers */}
          <div className='flex border-b border-gray-200 dark:border-gray-700'>
            <button
              onClick={() => handleTabChange('posts')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all ${
                activeTab === 'posts'
                  ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Grid3X3 className='w-4 h-4' />
              <span>POSTS</span>
            </button>
            
            <button
              onClick={() => handleTabChange('saved')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all ${
                activeTab === 'saved'
                  ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Bookmark className='w-4 h-4' />
              <span>SAVED</span>
            </button>
            
            <button
              className='flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium text-gray-400 dark:text-gray-500 cursor-not-allowed'
              disabled
            >
              <Film className='w-4 h-4' />
              <span>REELS</span>
              <Badge className='text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'>Soon</Badge>
            </button>
          </div>

          {/* Posts Grid */}
          <div className='p-4'>
            {displayedPost && displayedPost.length > 0 ? (
              <div className='grid grid-cols-3 gap-2 md:gap-3'>
                {displayedPost.map((post) => (
                  <div 
                    key={post?._id} 
                    className='relative group cursor-pointer aspect-square rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all'
                    onClick={() => handlePostClick(post?._id)}
                    onMouseEnter={() => setHoveredPost(post?._id)}
                    onMouseLeave={() => setHoveredPost(null)}
                  >
                    <img 
                      src={post.image} 
                      alt='post' 
                      className={`w-full h-full object-cover transition-transform duration-300 ${
                        hoveredPost === post?._id ? 'scale-110' : 'scale-100'
                      }`}
                    />
                    
                    {/* Hover Overlay */}
                    <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${
                      hoveredPost === post?._id ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <div className='flex items-center gap-6 text-white'>
                        <div className='flex items-center gap-2'>
                          <Heart className='w-5 h-5 fill-white' />
                          <span className='font-semibold'>{post?.likes?.length || 0}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <MessageCircle className='w-5 h-5 fill-white' />
                          <span className='font-semibold'>{post?.comments?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className='flex flex-col items-center justify-center py-16 text-center'>
                {activeTab === 'posts' ? (
                  <>
                    <div className='w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4'>
                      <Camera className='w-10 h-10 text-gray-400 dark:text-gray-500' />
                    </div>
                    <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                      {isLoggedInUserProfile ? 'Share your adventures' : 'No Posts Yet'}
                    </h3>
                    <p className='text-gray-500 dark:text-gray-400 max-w-xs'>
                      {isLoggedInUserProfile 
                        ? 'When you share photos and videos of your travels, they will appear on your profile.'
                        : 'This user hasn\'t shared any posts yet.'}
                    </p>
                  </>
                ) : (
                  <>
                    <div className='w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4'>
                      <Bookmark className='w-10 h-10 text-gray-400 dark:text-gray-500' />
                    </div>
                    <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                      {isLoggedInUserProfile ? 'Save posts you love' : 'No Saved Posts'}
                    </h3>
                    <p className='text-gray-500 dark:text-gray-400 max-w-xs'>
                      {isLoggedInUserProfile 
                        ? 'Save photos and videos that inspire your next adventure.'
                        : 'Saved posts are private and only visible to the account owner.'}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Followers/Following Modal */}
        <FollowersFollowingModal
          open={followersModalOpen}
          setOpen={setFollowersModalOpen}
          userId={userId}
          activeTab={followersModalTab}
        />
      </div>
    </div>
  );
};

export default Profile;
