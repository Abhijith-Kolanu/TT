import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import useGetUserProfile from '@/hooks/useGetUserProfile';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AtSign, Heart, MessageCircle } from 'lucide-react';
import { getUserInitials } from '@/lib/utils';
import FollowersFollowingModal from './FollowersFollowingModal';

const Profile = () => {
  const params = useParams();
  const navigate = useNavigate();
  const userId = params.id;
  useGetUserProfile(userId);
  const [activeTab, setActiveTab] = useState('posts');
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState('followers');
  const { userProfile, user } = useSelector(store => store.auth);

  const isLoggedInUserProfile = user?._id === userProfile?._id;

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
        `http://localhost:8000/api/v1/user/followorunfollow/${userProfile._id}`,
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
    // Navigate to post detail page
    navigate(`/post/${postId}`);
  };

  const displayedPost = activeTab === 'posts' ? userProfile?.posts : userProfile?.bookmarks;

  return (
    <div className='flex max-w-5xl justify-center mx-auto pl-10 transition-colors duration-200'>
      <div className='flex flex-col gap-20 p-8'>
        <div className='grid grid-cols-2'>
          <section className='flex items-center justify-center'>
            <Avatar className='h-32 w-32'>
              <AvatarImage src={userProfile?.profilePicture} alt="profilephoto" />
              <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-3xl">
                {getUserInitials(userProfile?.username)}
              </AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className='flex flex-col gap-5'>
              <div className='flex items-center gap-2'>
                <span className='text-gray-900 dark:text-white font-semibold'>{userProfile?.username}</span>
                {isLoggedInUserProfile ? (
                  <>
                    <Link to="/account/edit"><Button variant='secondary' className='hover:bg-gray-200 dark:hover:bg-gray-700 h-8 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800'>Edit profile</Button></Link>
                    <Button variant='secondary' className='hover:bg-gray-200 dark:hover:bg-gray-700 h-8 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800'>View archive</Button>
                    <Button variant='secondary' className='hover:bg-gray-200 dark:hover:bg-gray-700 h-8 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800'>Ad tools</Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant='secondary'
                      className='h-8 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      onClick={handleFollowToggle}
                    >
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                    {isFollowing && (
                      <Button 
                        variant='secondary' 
                        className='h-8 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                        onClick={handleMessageClick}
                      >
                        Message
                      </Button>
                    )}
                  </>
                )}
              </div>
              <div className='flex items-center gap-4'>
                <p className='text-gray-900 dark:text-white'><span className='font-semibold'>{userProfile?.posts.length}</span> posts</p>
                <p 
                  className='text-gray-900 dark:text-white cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
                  onClick={handleFollowersClick}
                >
                  <span className='font-semibold'>{userProfile?.followers.length}</span> followers
                </p>
                <p 
                  className='text-gray-900 dark:text-white cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
                  onClick={handleFollowingClick}
                >
                  <span className='font-semibold'>{userProfile?.following.length}</span> following
                </p>
              </div>
              <div className='flex flex-col gap-1'>
                <span className='font-semibold text-gray-900 dark:text-white'>{userProfile?.bio || 'bio here...'}</span>
                <Badge className='w-fit bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' variant='secondary'>
                  <AtSign /><span className='pl-1'>{userProfile?.username}</span>
                </Badge>
              </div>
            </div>
          </section>
        </div>
        <div className='border-t border-t-gray-200 dark:border-t-gray-700'>
          <div className='flex items-center justify-center gap-10 text-sm'>
            <span className={`py-3 cursor-pointer transition-colors duration-200 ${activeTab === 'posts' ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`} onClick={() => handleTabChange('posts')}>
              POSTS
            </span>
            <span className={`py-3 cursor-pointer transition-colors duration-200 ${activeTab === 'saved' ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`} onClick={() => handleTabChange('saved')}>
              SAVED
            </span>
            <span className='py-3 cursor-pointer text-gray-600 dark:text-gray-400 transition-colors duration-200'>REELS</span>
            <span className='py-3 cursor-pointer text-gray-600 dark:text-gray-400 transition-colors duration-200'>TAGS</span>
          </div>
          <div className='grid grid-cols-3 gap-1'>
            {displayedPost?.map((post) => (
              <div key={post?._id} className='relative group cursor-pointer' onClick={() => handlePostClick(post?._id)}>
                <img src={post.image} alt='postimage' className='rounded-sm my-2 w-full aspect-square object-cover' />
                <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                  <div className='flex items-center text-white space-x-4'>
                    <button className='flex items-center gap-2 hover:text-gray-300' onClick={(e) => { e.stopPropagation(); }}>
                      <Heart />
                      <span>{post?.likes.length}</span>
                    </button>
                    <button className='flex items-center gap-2 hover:text-gray-300' onClick={(e) => { e.stopPropagation(); }}>
                      <MessageCircle />
                      <span>{post?.comments.length}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
