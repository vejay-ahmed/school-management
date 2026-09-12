const express = require('express');
const router = express.Router();
const News = require('../models/News');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/news/admin/all
// @desc    Get all news including unpublished (Admin only)
// NOTE: This must be BEFORE /:id route to avoid conflict
router.get('/admin/all', auth, authorize('admin'), async (req, res) => {
  try {
    const news = await News.find()
      .populate('author', 'name')
      .sort({ createdAt: -1 });

    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/news
// @desc    Get all published news (public)
router.get('/', async (req, res) => {
  try {
    const { category, limit, page } = req.query;
    let filter = { isPublished: true };
    if (category) filter.category = category;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const news = await News.find(filter)
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await News.countDocuments(filter);

    res.json({
      news,
      pagination: {
        current: pageNum,
        total: Math.ceil(total / limitNum),
        count: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/news/:id
// @desc    Get news by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const newsItem = await News.findById(req.params.id)
      .populate('author', 'name');

    if (!newsItem || !newsItem.isPublished) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json(newsItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/news
// @desc    Create news (Admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { title, content, excerpt, image, category, tags } = req.body;

    const news = new News({
      title,
      content,
      excerpt: excerpt || content.substring(0, 150) + '...',
      image,
      category,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      author: req.user._id
    });

    await news.save();
    await news.populate('author', 'name');

    res.status(201).json(news);
  } catch (error) {
    console.error('News creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/news/:id
// @desc    Update news (Admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('author', 'name');

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/news/:id
// @desc    Delete news (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
