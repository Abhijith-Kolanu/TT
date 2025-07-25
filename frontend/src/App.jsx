import { useEffect } from 'react';
import ChatPage from './components/ChatPage';
import EditProfile from './components/EditProfile';
import Home from './components/Home';
import Login from './components/Login';
import MainLayout from './components/MainLayout';
import Profile from './components/Profile';
import Signup from './components/Signup';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { io } from "socket.io-client";
import { useDispatch, useSelector } from 'react-redux';
import { setSocket } from './redux/socketSlice';
import { setOnlineUsers } from './redux/chatSlice';
import { setLikeNotification } from './redux/rtnSlice';
import ProtectedRoutes from './components/ProtectedRoutes';
import ExplorePage from './components/ExplorePage';
import NotificationPage from './components/NotificationPage';
import { addNotification } from './redux/notificationSlice';


const browserRouter = createBrowserRouter([
  {
    path: "/",
    // The Parent route is protected. This is correct.
    element: <ProtectedRoutes><MainLayout /></ProtectedRoutes>,
    children: [
      // All children will now inherit the protection.
      // We must remove the extra <ProtectedRoutes> wrapper from them.
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/explore',
        element: <ExplorePage />
      },
      {
        path: '/profile/:id',
        element: <Profile />
      },
      {
        path: '/account/edit',
        element: <EditProfile />
      },
      {
        path: '/chat',
        element: <ChatPage />
      },
      {
        path: '/notifications',
        element: <NotificationPage />
      },
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  },

]);

function App() {
  const { user } = useSelector(store => store.auth);
  const { socket } = useSelector(store => store.socketio);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      const socketio = io('http://localhost:8000', {
        query: {
          userId: user?._id
        },
        transports: ['websocket']
      });
      console.log("Socket connected", socketio);
      dispatch(setSocket(socketio));

      socketio.on('getOnlineUsers', (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socketio.on('notification', (notification) => {
        dispatch(setLikeNotification(notification));
      });
      socketio.on('newNotification', (notification) => {
        console.log("Received newNotification", notification);
        dispatch(addNotification(notification));
        toast(notification.sender.username + " liked your post");
      });


      return () => {
        socketio.close();
        dispatch(setSocket(null));
      };
    } else if (socket) {
      socket.close();
      dispatch(setSocket(null));
    }
  }, [user, dispatch]);

  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  );
}

export default App;