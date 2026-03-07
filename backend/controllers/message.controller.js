import {Conversation} from "../models/conversation.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import {Message} from "../models/message.model.js"
import User from "../models/user.model.js";
// for chatting
export const sendMessage = async (req,res) => {
    try {
        console.log('sendMessage: req.user:', req.user);
        const senderId = req.user._id;
        const receiverId = req.params.id;
        const {textMessage: message, postId, messageType = 'text'} = req.body;
      
        let conversation = await Conversation.findOne({
            participants:{$all:[senderId, receiverId]}
        });
        // establish the conversation if not started yet.
        if(!conversation){
            conversation = await Conversation.create({
                participants:[senderId, receiverId]
            })
        };

        // Create message based on type
        let newMessage;
        if (messageType === 'post' && postId) {
            newMessage = await Message.create({
                senderId,
                receiverId,
                message: "Shared a post",
                sharedPost: postId,
                messageType: 'post'
            });
        } else {
            newMessage = await Message.create({
                senderId,
                receiverId,
                message,
                messageType: 'text'
            });
        }

        if(newMessage) conversation.messages.push(newMessage._id);

        await Promise.all([conversation.save(), newMessage.save()]);

        // Populate the shared post if it exists
        if (messageType === 'post') {
            await newMessage.populate('sharedPost');
        }

        // implement socket io for real time data transfer
        const receiverSocketId = getReceiverSocketId(receiverId);
        const senderSocketId = getReceiverSocketId(senderId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', { ...newMessage.toObject(), isReceiver: true });
            console.log(`[Socket] Emitted newMessage to receiver (${receiverId}):`, newMessage);
        }
        if (senderSocketId) {
            io.to(senderSocketId).emit('newMessage', { ...newMessage.toObject(), isReceiver: false });
            console.log(`[Socket] Emitted newMessage to sender (${senderId}):`, newMessage);
        }

        return res.status(201).json({
            success:true,
            newMessage
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to send message"
        });
    }
}
export const getMessage = async (req,res) => {
    try {
        const senderId = req.user._id;
        const receiverId = req.params.id;
        const conversation = await Conversation.findOne({
            participants:{$all: [senderId, receiverId]}
        }).populate({
            path: 'messages',
            populate: {
                path: 'sharedPost',
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            }
        });
        if(!conversation) return res.status(200).json({success:true, messages:[]});

        return res.status(200).json({success:true, messages:conversation?.messages});
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to get messages"
        });
    }
}

// Delete conversation with a specific user
export const deleteChat = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const otherUserId = req.params.id;

        console.log('deleteChat called - currentUser:', currentUserId, 'otherUser:', otherUserId);

        // Find the conversation between the two users
        const conversation = await Conversation.findOne({
            participants: { $all: [currentUserId, otherUserId] }
        });

        if (conversation) {
            console.log('Found conversation:', conversation._id, 'with', conversation.messages.length, 'messages');

            // Delete all messages in the conversation
            if (conversation.messages && conversation.messages.length > 0) {
                await Message.deleteMany({ _id: { $in: conversation.messages } });
                console.log('Deleted messages');
            }

            // Delete the conversation
            await Conversation.findByIdAndDelete(conversation._id);
            console.log('Deleted conversation');
        }

        // Add otherUserId to current user's deletedChats array (so they won't appear in suggested users)
        await User.findByIdAndUpdate(currentUserId, {
            $addToSet: { deletedChats: otherUserId }
        });
        console.log('Added to deletedChats');

        return res.status(200).json({
            success: true,
            message: "Chat deleted successfully"
        });

    } catch (error) {
        console.error('deleteChat error:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete chat"
        });
    }
}