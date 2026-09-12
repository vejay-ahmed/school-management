const express = require('express');
const router = express.Router();
const News = require('../models/News');
const Event = require('../models/Event');

router.get('/home', async (req, res) => {
  try {
    const featuredNews = await News.find({ isPublished: true })
      .sort({ createdAt: -1 }).limit(3).populate('author', 'name');
    const upcomingEvents = await Event.find({ isPublished: true, startDate: { $gte: new Date() } })
      .sort({ startDate: 1 }).limit(4).populate('createdBy', 'name');
    const featuredEvent = await Event.findOne({ isPublished: true, featured: true })
      .sort({ startDate: 1 }).populate('createdBy', 'name');
    res.json({ featuredNews, upcomingEvents, featuredEvent });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/about', async (req, res) => {
  try {
    const aboutData = {
      name: 'Excellence Academy',
      motto: 'Empowering Future Leaders',
      established: 1995,
      description: 'Excellence Academy is a premier educational institution committed to providing quality education and holistic development of students.',
      mission: 'To provide an inclusive, innovative, and inspiring learning environment.',
      vision: 'To be a leading educational institution recognized for academic excellence.',
      values: ['Excellence', 'Integrity', 'Innovation', 'Respect', 'Responsibility', 'Compassion'],
      stats: { students: '2000+', teachers: '150+', years: '30+', successRate: '98%' },
      facilities: ['Science Labs', 'Computer Labs', 'Library', 'Sports Complex', 'Art Studios', 'Auditorium'],
      achievements: ['Best School 2023', '100% Pass Rate', 'Science Olympiad Winners']
    };
    res.json(aboutData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/subjects', async (req, res) => {
  try {
    const subjects = [
      { name: 'English', code: 'ENG', category: 'Core' },
      { name: 'Mathematics', code: 'MATH', category: 'Core' },
      { name: 'Science', code: 'SCI', category: 'Core' },
      { name: 'Social Studies', code: 'SS', category: 'Core' },
      { name: 'Physics', code: 'PHY', category: 'Science' },
      { name: 'Chemistry', code: 'CHEM', category: 'Science' },
      { name: 'Biology', code: 'BIO', category: 'Science' },
      { name: 'Computer Science', code: 'CS', category: 'Technology' },
      { name: 'Information Technology', code: 'IT', category: 'Technology' },
      { name: 'History', code: 'HIST', category: 'Humanities' },
      { name: 'Geography', code: 'GEO', category: 'Humanities' },
      { name: 'Economics', code: 'ECON', category: 'Humanities' },
      { name: 'Political Science', code: 'POLI', category: 'Humanities' },
      { name: 'Psychology', code: 'PSY', category: 'Humanities' },
      { name: 'Sociology', code: 'SOC', category: 'Humanities' },
      { name: 'Spanish', code: 'SPAN', category: 'Language' },
      { name: 'French', code: 'FREN', category: 'Language' },
      { name: 'Arabic', code: 'ARAB', category: 'Language' },
      { name: 'Art & Design', code: 'ART', category: 'Arts' },
      { name: 'Music', code: 'MUS', category: 'Arts' },
      { name: 'Physical Education', code: 'PE', category: 'Sports' },
      { name: 'Business Studies', code: 'BUS', category: 'Commerce' },
      { name: 'Accounting', code: 'ACCT', category: 'Commerce' },
      { name: 'Islamic Studies', code: 'ISL', category: 'Religion' },
      { name: 'Statistics', code: 'STAT', category: 'Mathematics' },
      { name: 'Environmental Science', code: 'ENV', category: 'Science' },
      { name: 'Home Economics', code: 'HE', category: 'Vocational' }
    ];
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/classes', async (req, res) => {
  try {
    const classes = [
      { name: 'Grade 9', value: '9', sections: ['A', 'B', 'C', 'D'] },
      { name: 'Grade 10', value: '10', sections: ['A', 'B', 'C', 'D'] },
      { name: 'Grade 11', value: '11', sections: ['A', 'B', 'C'] },
      { name: 'Grade 12', value: '12', sections: ['A', 'B', 'C'] }
    ];
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Public news route
router.get('/news', async (req, res) => {
  try {
    const { category, limit, page } = req.query;
    let filter = { isPublished: true };
    if (category) filter.category = category;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;
    const news = await News.find(filter).populate('author', 'name')
      .sort({ createdAt: -1 }).skip(skip).limit(limitNum);
    const total = await News.countDocuments(filter);
    res.json({ news, pagination: { current: pageNum, total: Math.ceil(total / limitNum), count: total } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Public single news route
router.get('/news/:id', async (req, res) => {
  try {
    const newsItem = await News.findById(req.params.id).populate('author', 'name');
    if (!newsItem || !newsItem.isPublished) return res.status(404).json({ message: 'News not found' });
    res.json(newsItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Public events route
router.get('/events', async (req, res) => {
  try {
    const { category, upcoming, limit } = req.query;
    let filter = { isPublished: true };
    if (category) filter.category = category;
    if (upcoming === 'true') filter.startDate = { $gte: new Date() };
    const events = await Event.find(filter).populate('createdBy', 'name')
      .sort({ startDate: 1 }).limit(parseInt(limit) || 20);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Public single event route
router.get('/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name');
    if (!event || !event.isPublished) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
