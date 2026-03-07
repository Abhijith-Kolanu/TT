import React, { useEffect, useState, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Link } from 'react-router-dom'
import { X, Send, Smile } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import Comment from './Comment'
import axios from 'axios'
import { toast } from 'sonner'
import { setPosts } from '@/redux/postSlice'
import { getUserInitials } from '@/lib/utils'
import EmojiPicker from 'emoji-picker-react'

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const { selectedPost, posts } = useSelector(store => store.post);
  const [comment, setComment] = useState([]);
  const dispatch = useDispatch();
  const commentsEndRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmojiPicker]);

  const onEmojiClick = (emojiData) => {
    setText(prev => prev + emojiData.emoji);
  };

  useEffect(() => {
    if (selectedPost) {
      setComment(selectedPost.comments || []);
    } else {
      setComment([]);
    }
  }, [selectedPost]);

  useEffect(() => {
    if (open) commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comment, open]);

  const changeEventHandler = (e) => {
    setText(e.target.value);
  };

  const sendMessageHandler = async () => {
    if (!selectedPost?._id) return toast.error('No post selected');
    if (!text.trim()) return;
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/post/${selectedPost._id}/comment`,
        { text },
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      );
      if (res.data.success) {
        const updatedComments = [...(comment || []), res.data.comment];
        setComment(updatedComments);
        dispatch(setPosts(posts.map(p =>
          p._id === selectedPost._id ? { ...p, comments: updatedComments } : p
        )));
        setText("");
        setShowEmojiPicker(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleDeleteComment = (commentId) => {
    const updatedComments = comment.filter(c => c._id !== commentId);
    setComment(updatedComments);
    dispatch(setPosts(posts.map(p =>
      p._id === selectedPost._id ? { ...p, comments: updatedComments } : p
    )));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && text.trim()) {
      e.preventDefault();
      sendMessageHandler();
    }
  };

  return (
    <>
      {open && (
        <div
          className='fixed inset-0 bg-black/20 dark:bg-black/40 z-40 transition-opacity duration-300'
          onClick={() => setOpen(false)}
        />
      )}

      <div className={`fixed top-0 right-0 h-full w-[360px] z-50 flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out ${open ? 'translate-x-0 shadow-2xl' : 'translate-x-full shadow-none'}`}>

        <div className='flex items-center justify-between px-4 py-3.5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0'>
          <div className='flex items-center gap-2.5'>
            {selectedPost && (
              <Link to={`/profile/${selectedPost.author?._id}`} onClick={() => setOpen(false)}>
                <Avatar className='w-8 h-8'>
                  <AvatarImage src={selectedPost.author?.profilePicture} />
                  <AvatarFallback className='bg-gradient-to-br from-indigo-400 to-violet-500 text-white font-bold text-xs'>
                    {getUserInitials(selectedPost.author?.username)}
                  </AvatarFallback>
                </Avatar>
              </Link>
            )}
            <div>
              <p className='font-semibold text-sm text-gray-900 dark:text-white leading-tight'>
                {selectedPost?.author?.username || 'Comments'}
              </p>
              <p className='text-[11px] text-gray-400 dark:text-gray-500'>
                {comment.length} {comment.length === 1 ? 'comment' : 'comments'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400'
          >
            <X size={18} />
          </button>
        </div>

        {selectedPost?.caption && (
          <div className='px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0'>
            <p className='text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2'>
              <span className='font-semibold text-gray-900 dark:text-white mr-1.5'>{selectedPost.author?.username}</span>
              {selectedPost.caption}
            </p>
          </div>
        )}

        <div className='flex-1 overflow-y-auto px-4 py-3 space-y-1'>
          {comment.length > 0 ? (
            <>
              {comment.map((c) => (
                <Comment key={c._id} comment={c} onDeleteComment={handleDeleteComment} />
              ))}
              <div ref={commentsEndRef} />
            </>
          ) : (
            <div className='flex flex-col items-center justify-center h-full text-center gap-3 py-12'>
              <div className='w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center'>
                <Send size={22} className='text-gray-400 dark:text-gray-500' />
              </div>
              <div>
                <p className='font-semibold text-gray-700 dark:text-gray-300 text-sm'>No comments yet</p>
                <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>Be the first to comment</p>
              </div>
            </div>
          )}
        </div>

        <div className='flex-shrink-0 border-t border-gray-200 dark:border-gray-700 px-4 py-3'>
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div ref={emojiPickerRef} className='absolute bottom-16 right-4 z-50'>
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                theme='auto'
                width={300}
                height={380}
                searchDisabled={false}
                skinTonesDisabled
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}
          <div className='flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-2'>
            <button
              type='button'
              onClick={() => setShowEmojiPicker(p => !p)}
              className='flex-shrink-0 text-gray-400 dark:text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors'
            >
              <Smile size={18} />
            </button>
            <input
              type='text'
              value={text}
              onChange={changeEventHandler}
              onKeyDown={handleKeyDown}
              placeholder='Add a comment…'
              className='flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500'
            />
            {text.trim() && (
              <button
                onClick={sendMessageHandler}
                className='flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white hover:opacity-90 transition-opacity'
              >
                <Send size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CommentDialog
