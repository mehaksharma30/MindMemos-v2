import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  title: string;
  content: string;
  tags: string[];
  isPublic: boolean;
  imageUrl?: string;
  likeCount: number;
  likedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    authorName: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      maxlength: [100, 'Author name is too long'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      maxlength: [5000, 'Content cannot exceed 5000 characters'],
    },
    tags: {
      type: [String],
      default: [],
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    likedBy: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ title: 'text', content: 'text', tags: 'text' });
postSchema.index({ authorId: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

const Post = mongoose.model<IPost>('Post', postSchema);

export default Post;
