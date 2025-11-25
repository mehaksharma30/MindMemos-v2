import mongoose, { Document, Schema } from 'mongoose';

export interface IChatRating extends Document {
  conversationId: mongoose.Types.ObjectId;
  raterId: mongoose.Types.ObjectId;
  ratedUserId: mongoose.Types.ObjectId;
  rating: 'helpful' | 'not_helpful';
  createdAt: Date;
}

const chatRatingSchema = new Schema<IChatRating>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    raterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ratedUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: String,
      enum: ['helpful', 'not_helpful'],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

chatRatingSchema.index(
  { conversationId: 1, raterId: 1, ratedUserId: 1 },
  { unique: true }
);

const ChatRating = mongoose.model<IChatRating>('ChatRating', chatRatingSchema);

export default ChatRating;
