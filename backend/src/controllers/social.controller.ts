import { Request, Response } from 'express';
import { Community } from '@models/Community';
import { Post } from '@models/Post';
import { User } from '@models/User';
import { uploadFile, generateFilePath, FileType } from '@config/supabase';

export const createCommunity = async (req: Request, res: Response) => {
  try {
    const { name, description, productType, isPrivate } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can create communities' });
    }

    const community = new Community({
      name,
      description,
      productType,
      isPrivate,
      createdBy: userId,
      moderators: [userId],
      members: [userId]
    });

    if (isPrivate) {
      community.joinCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    await community.save();
    return res.status(201).json(community);
  } catch (error) {
    console.error('Create community error:', error);
    return res.status(500).json({ error: 'Error creating community' });
  }
};

export const getCommunities = async (req: Request, res: Response) => {
  try {
    const { productType } = req.query;
    const query: any = {};

    if (productType) {
      query.productType = productType;
    }

    const communities = await Community.find(query)
      .populate('createdBy', 'name')
      .populate('moderators', 'name')
      .sort({ createdAt: -1 });

    return res.json(communities);
  } catch (error) {
    console.error('Get communities error:', error);
    return res.status(500).json({ error: 'Error fetching communities' });
  }
};

export const joinCommunity = async (req: Request, res: Response) => {
  try {
    const { joinCode } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    if (community.isPrivate && community.joinCode !== joinCode) {
      return res.status(403).json({ error: 'Invalid join code' });
    }

    await community.addMember(userId);
    return res.json(community);
  } catch (error) {
    console.error('Join community error:', error);
    return res.status(500).json({ error: 'Error joining community' });
  }
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, communityId, tags } = req.body;
    const userId = req.userId;
    const files = req.files as Express.Multer.File[];

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can create posts' });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }
    if (!community.isMember(userId)) {
      return res.status(403).json({ error: 'Must be a community member to post' });
    }

    const imageUrls: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const filePath = generateFilePath(userId, 'post-image' as FileType, file.originalname);
        await uploadFile(filePath, file.buffer, file.mimetype, 'post-image' as FileType);
        imageUrls.push(filePath);
      }
    }

    const post = new Post({
      title,
      content,
      author: userId,
      community: communityId,
      images: imageUrls,
      tags: tags || []
    });

    await post.save();
    return res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    return res.status(500).json({ error: 'Error creating post' });
  }
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const { communityId } = req.query;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const query: any = {};
    if (communityId) {
      const community = await Community.findById(communityId);
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }
      if (community.isPrivate && !community.isMember(userId)) {
        return res.status(403).json({ error: 'Not a member of this community' });
      }
      query.community = communityId;
    }

    const posts = await Post.find(query)
      .populate('author', 'name')
      .populate('community', 'name')
      .populate('comments.user', 'name')
      .sort({ isPinned: -1, createdAt: -1 });

    return res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    return res.status(500).json({ error: 'Error fetching posts' });
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await post.addComment(userId, content);
    return res.json(post);
  } catch (error) {
    console.error('Add comment error:', error);
    return res.status(500).json({ error: 'Error adding comment' });
  }
};

export const toggleLike = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await post.toggleLike(userId);
    return res.json(post);
  } catch (error) {
    console.error('Toggle like error:', error);
    return res.status(500).json({ error: 'Error toggling like' });
  }
};

export const toggleCommentLike = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const post = await Post.findOne({ 'comments._id': commentId });
    if (!post) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    await post.toggleCommentLike(commentId, userId);
    return res.json(post);
  } catch (error) {
    console.error('Toggle comment like error:', error);
    return res.status(500).json({ error: 'Error toggling comment like' });
  }
};
