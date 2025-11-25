import { Request, Response } from 'express';
import Post from '../models/Post';
import { askOllama } from '../services/ollamaService';

interface RecommendedPost {
  postId: string;
  authorId: string;
  authorName: string;
  title: string;
  excerpt: string;
  tags: string[];
}

async function findSimilarPosts(query: string): Promise<RecommendedPost[]> {
  try {

    const keywords = query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    if (keywords.length === 0) {

      const posts = await Post.find({ isPublic: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      return posts.map(post => ({
        postId: post._id.toString(),
        authorId: post.authorId.toString(),
        authorName: post.authorName,
        title: post.title,
        excerpt: post.content.substring(0, 200).trim() + (post.content.length > 200 ? '...' : ''),
        tags: post.tags || [],
      }));
    }

    try {
      const posts = await Post.find(
        {
          $text: { $search: keywords.join(' ') },
          isPublic: true,
        },
        {
          score: { $meta: 'textScore' },
        }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(10)
        .lean();

      if (posts.length > 0) {
        return posts.map(post => ({
          postId: post._id.toString(),
          authorId: post.authorId.toString(),
          authorName: post.authorName,
          title: post.title,
          excerpt: post.content.substring(0, 200).trim() + (post.content.length > 200 ? '...' : ''),
          tags: post.tags || [],
        }));
      }
    } catch (textSearchError) {
      console.log('Text search not available, using regex fallback');
    }

    const regexPatterns = keywords.map(kw => new RegExp(kw, 'i'));
    const posts = await Post.find({
      isPublic: true,
      $or: [
        { title: { $in: regexPatterns } },
        { content: { $in: regexPatterns } },
        { tags: { $in: keywords } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return posts.map(post => ({
      postId: post._id.toString(),
      authorId: post.authorId.toString(),
      authorName: post.authorName,
      title: post.title,
      excerpt: post.content.substring(0, 200).trim() + (post.content.length > 200 ? '...' : ''),
      tags: post.tags || [],
    }));
  } catch (error: any) {
    console.error('Find similar posts error:', error);
    return [];
  }
}

export const aiChat = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }

    const similarPosts = await findSimilarPosts(question);

    let context = '';
    if (similarPosts.length > 0) {
      context = 'Here are some posts from other MindMemos users who shared similar experiences:\n\n';
      similarPosts.forEach((post, index) => {
        const tagsStr = post.tags.length > 0 ? ` (tags: ${post.tags.map(t => '#' + t).join(' ')})` : '';
        context += `${index + 1}. "${post.title}" by ${post.authorName} – ${post.excerpt}${tagsStr}\n\n`;
      });
    } else {
      context = 'No directly similar posts found in the community yet, but I can still offer support.';
    }

    const answer = await askOllama(question.trim(), context);

    return res.json({
      success: true,
      answer,
      recommendations: similarPosts,
    });
  } catch (error: any) {
    console.error('AI chat error:', error);

    let message = 'AI service is currently unavailable';
    if (error.message.includes('Ollama server is not running')) {
      message = 'AI companion is offline. Please make sure Ollama is running.';
    }

    return res.status(500).json({
      success: false,
      message,
      error: error.message,
    });
  }
};
