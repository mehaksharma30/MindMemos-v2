import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import mongoose from 'mongoose';
import Conversation from '../models/Conversation';
import DirectMessage from '../models/DirectMessage';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export const setupDMSocket = (io: Server) => {
  io.on('connection', async (socket: AuthenticatedSocket) => {
    try {

      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        console.log('Socket connection rejected: No token');
        socket.disconnect();
        return;
      }

      const decoded = verifyToken(token as string);
      socket.userId = decoded.userId;
      socket.username = decoded.username;

      socket.join(`user:${socket.userId}`);
      console.log(`User ${socket.username} connected to DM socket`);

      socket.on('dm:send', async (data: { conversationId: string; receiverId: string; content: string }) => {
        try {
          if (!socket.userId) {
            socket.emit('dm:error', { message: 'Unauthorized' });
            return;
          }

          const { conversationId, receiverId, content } = data;

          if (!content || !content.trim()) {
            socket.emit('dm:error', { message: 'Message content is required' });
            return;
          }

          if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            socket.emit('dm:error', { message: 'Invalid conversation ID' });
            return;
          }

          const senderId = new mongoose.Types.ObjectId(socket.userId);
          const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

          const conversation = await Conversation.findById(conversationId);
          if (!conversation) {
            socket.emit('dm:error', { message: 'Conversation not found' });
            return;
          }

          const isParticipant = conversation.participants.some(
            (id) => id.toString() === senderId.toString()
          );
          if (!isParticipant) {
            socket.emit('dm:error', { message: 'Not authorized' });
            return;
          }

          const message = await DirectMessage.create({
            conversationId,
            senderId,
            receiverId: receiverObjectId,
            content: content.trim(),
          });

          conversation.lastMessage = content.trim().substring(0, 100);
          conversation.lastMessageAt = new Date();
          await conversation.save();

          const messageData = {
            _id: message._id,
            conversationId: message.conversationId,
            senderId: message.senderId,
            receiverId: message.receiverId,
            content: message.content,
            isRead: message.isRead,
            createdAt: message.createdAt,
          };

          io.to(`user:${socket.userId}`).emit('dm:message', messageData);
          io.to(`user:${receiverId}`).emit('dm:message', messageData);

          console.log(`DM sent from ${socket.username} to user ${receiverId}`);
        } catch (error: any) {
          console.error('DM send error:', error);
          socket.emit('dm:error', { message: error.message || 'Failed to send message' });
        }
      });

      socket.on('dm:mark-read', async (data: { conversationId: string }) => {
        try {
          if (!socket.userId) return;

          const { conversationId } = data;

          await DirectMessage.updateMany(
            {
              conversationId,
              receiverId: socket.userId,
              isRead: false,
            },
            {
              $set: { isRead: true },
            }
          );

          socket.emit('dm:marked-read', { conversationId });
        } catch (error: any) {
          console.error('Mark read error:', error);
        }
      });

      socket.on('disconnect', () => {
        console.log(`User ${socket.username} disconnected from DM socket`);
      });
    } catch (error: any) {
      console.error('Socket authentication error:', error);
      socket.disconnect();
    }
  });
};
