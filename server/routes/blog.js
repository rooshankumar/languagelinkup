
const express = require('express');
const BlogPost = require('../models/BlogPost');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/blog/articles
// @desc    Get blog posts with pagination and filtering
// @access  Public
router.get('/articles', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      language, 
      category, 
      tag, 
      difficulty,
      search
    } = req.query;
    
    // Build query
    const query = { published: true };
    
    if (language) query.language = language;
    if (category) query.categories = category;
    if (tag) query.tags = tag;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$text = { $search: search };
    }
    
    // Execute query with pagination
    const posts = await BlogPost.find(query)
      .populate('author', 'username firstName lastName profilePicture')
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    // Get total count for pagination
    const totalPosts = await BlogPost.countDocuments(query);
    
    res.json({
      posts,
      totalPages: Math.ceil(totalPosts / parseInt(limit)),
      currentPage: parseInt(page),
      totalPosts
    });
  } catch (error) {
    console.error('Get blog posts error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/blog/articles/:slug
// @desc    Get single blog post by slug
// @access  Public
router.get('/articles/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Find post by slug
    const post = await BlogPost.findOne({ 
      slug, 
      published: true 
    }).populate('author', 'username firstName lastName profilePicture bio');
    
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    // Increment view count
    post.views += 1;
    await post.save();
    
    // Get related posts
    const relatedPosts = await BlogPost.find({
      _id: { $ne: post._id }, // Exclude current post
      published: true,
      $or: [
        { language: post.language },
        { categories: { $in: post.categories } },
        { tags: { $in: post.tags } }
      ]
    })
    .sort({ publishedAt: -1 })
    .limit(3)
    .select('title slug excerpt featuredImage publishedAt views');
    
    res.json({
      post,
      relatedPosts
    });
  } catch (error) {
    console.error('Get blog post error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/blog/articles
// @desc    Create a new blog post
// @access  Private
router.post('/articles', protect, async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      featuredImage,
      categories,
      tags,
      language,
      difficulty,
      metaDescription,
      published
    } = req.body;
    
    // Create new blog post
    const newPost = await BlogPost.create({
      title,
      content,
      excerpt,
      author: req.user._id,
      featuredImage,
      categories,
      tags,
      language,
      difficulty,
      metaDescription: metaDescription || excerpt.substring(0, 155),
      published: published || false,
      publishedAt: published ? new Date() : null
    });
    
    // If successful, return the new post
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Create blog post error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/blog/sitemap
// @desc    Generate sitemap data for SEO
// @access  Public
router.get('/sitemap', async (req, res) => {
  try {
    // Get all published posts
    const posts = await BlogPost.find({ published: true })
      .select('slug updatedAt')
      .sort({ publishedAt: -1 });
    
    // Format for sitemap
    const sitemapEntries = posts.map(post => ({
      url: `/blog/${post.slug}`,
      lastmod: post.updatedAt.toISOString().split('T')[0]
    }));
    
    // Add static pages
    const staticPages = [
      { url: '/', lastmod: new Date().toISOString().split('T')[0] },
      { url: '/blog', lastmod: new Date().toISOString().split('T')[0] },
      { url: '/auth', lastmod: new Date().toISOString().split('T')[0] }
    ];
    
    res.json({
      entries: [...staticPages, ...sitemapEntries]
    });
  } catch (error) {
    console.error('Sitemap generation error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
