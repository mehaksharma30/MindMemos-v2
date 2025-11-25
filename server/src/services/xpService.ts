import User from '../models/User';
import mongoose from 'mongoose';

export function computeLevelAndBadge(xp: number): { 
  level: number; 
  badge: 'none' | 'silver' | 'gold' | 'diamond' 
} {
  const level = Math.floor(xp / 100);

  let badge: 'none' | 'silver' | 'gold' | 'diamond' = 'none';
  if (level >= 3) {
    badge = 'diamond';
  } else if (level === 2) {
    badge = 'gold';
  } else if (level === 1) {
    badge = 'silver';
  }

  return { level, badge };
}

export async function addXpToUser(userId: string, amount: number): Promise<void> {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const user = await User.findById(userObjectId);
    if (!user) {
      console.error('User not found for XP update:', userId);
      return;
    }

    user.xp += amount;

    const { level, badge } = computeLevelAndBadge(user.xp);
    user.level = level;
    user.badge = badge;

    await user.save();

    console.log(`Added ${amount} XP to ${user.username}. Now: Level ${level}, ${user.xp} XP, ${badge} badge`);
  } catch (error: any) {
    console.error('Error adding XP to user:', error);
  }
}
