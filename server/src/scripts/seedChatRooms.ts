import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database';
import ChatRoom from '../models/ChatRoom';

dotenv.config();

const seedChatRooms = async () => {
  try {
    await connectDB();

    const rooms = [
      {
        name: 'Anxiety Support',
        slug: 'anxiety-support',
        description: 'A safe space to discuss anxiety and share coping strategies',
      },
      {
        name: 'Depression Support',
        slug: 'depression-support',
        description: 'Support for those dealing with depression',
      },
      {
        name: 'Exam Stress',
        slug: 'exam-stress',
        description: 'Share experiences and tips for managing exam stress',
      },
      {
        name: 'Sleep Issues',
        slug: 'sleep-issues',
        description: 'Discuss sleep problems and solutions',
      },
      {
        name: 'General Mental Health',
        slug: 'general-mental-health',
        description: 'General discussions about mental health and wellness',
      },
    ];

    await ChatRoom.deleteMany({});

    for (const room of rooms) {
      const existingRoom = await ChatRoom.findOne({ slug: room.slug });
      if (!existingRoom) {
        await ChatRoom.create(room);
        console.log(`Created room: ${room.name}`);
      } else {
        console.log(`Room already exists: ${room.name}`);
      }
    }

    console.log('Chat rooms seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding chat rooms:', error);
    process.exit(1);
  }
};

seedChatRooms();
