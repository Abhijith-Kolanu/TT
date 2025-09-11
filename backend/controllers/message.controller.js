import {Conversation} from "../models/conversation.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import {Message} from "../models/message.model.js"
// for chatting
export const sendMessage = async (req,res) => {
    try {
        const senderId = req.id;
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
        const senderId = req.id;
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