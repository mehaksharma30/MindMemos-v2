import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Post from '../models/Post';
import mongoose from 'mongoose';

export const getCommentsByPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ success: false, message: 'Invalid post ID' });
    }

    const comments = await Comment.find({ postId })
      .sort({ createdAt: 1 })
      .limit(100);

    return res.json({
      success: true,
      data: comments,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch comments' });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { postId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ success: false, message: 'Invalid post ID' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = await Comment.create({
      postId,
      authorId: req.user.userId,
      authorName: req.user.username,
      content: content.trim(),
    });

    return res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment added successfully',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create comment' });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ success: false, message: 'Invalid comment ID' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.authorId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own comments' });
    }

    await comment.deleteOne();

    return res.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete comment' });
  }
};
