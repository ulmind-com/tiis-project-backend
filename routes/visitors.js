const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Track a page visit (called from frontend on every navigation)
// @route   POST /api/visitors/track
// @access  Public
router.post('/track', async (req, res) => {
  try {
    const b = req.body;
    if (!b.visitorId) {
      return res.status(400).json({ message: 'visitorId is required' });
    }

    // Get IP
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.connection?.remoteAddress
      || req.socket?.remoteAddress
      || 'unknown';

    let visitor = await Visitor.findOne({ visitorId: b.visitorId });

    if (visitor) {
      // Returning visitor — update
      visitor.isReturning = true;
      visitor.visitCount += 1;
      visitor.lastVisit = new Date();
      visitor.totalPageViews += 1;
      visitor.bounced = visitor.totalPageViews <= 1;

      // Update fields that may change between visits
      if (b.cookieConsent) visitor.cookieConsent = b.cookieConsent;
      if (b.canvasFingerprint) visitor.canvasFingerprint = b.canvasFingerprint;
      if (b.batteryLevel !== undefined) visitor.batteryLevel = b.batteryLevel;
      if (b.batteryCharging !== undefined) visitor.batteryCharging = b.batteryCharging;
      if (b.connectionType) visitor.connectionType = b.connectionType;
      if (b.connectionSpeed) visitor.connectionSpeed = b.connectionSpeed;
      if (b.onlineStatus !== undefined) visitor.onlineStatus = b.onlineStatus;
      if (b.viewportSize) visitor.viewportSize = b.viewportSize;
      if (b.adBlockerDetected !== undefined) visitor.adBlockerDetected = b.adBlockerDetected;

      if (b.page) {
        visitor.pages.push({ path: b.page, title: b.pageTitle || '', timestamp: new Date() });
      }
      // Keep last 200 page visits
      if (visitor.pages.length > 200) {
        visitor.pages = visitor.pages.slice(-200);
      }
      await visitor.save();
    } else {
      // New visitor — store everything
      const pages = b.page ? [{ path: b.page, title: b.pageTitle || '', timestamp: new Date() }] : [];
      visitor = await Visitor.create({
        visitorId: b.visitorId,
        canvasFingerprint: b.canvasFingerprint || '',
        browser: b.browser || 'Unknown',
        browserVersion: b.browserVersion || '',
        os: b.os || 'Unknown',
        osVersion: b.osVersion || '',
        device: b.device || 'Unknown',
        deviceVendor: b.deviceVendor || '',
        deviceModel: b.deviceModel || '',
        screenResolution: b.screenResolution || '',
        screenColorDepth: b.screenColorDepth || 0,
        viewportSize: b.viewportSize || '',
        language: b.language || '',
        languages: b.languages || [],
        timezone: b.timezone || '',
        timezoneOffset: b.timezoneOffset || 0,
        cpuCores: b.cpuCores || 0,
        deviceMemory: b.deviceMemory || 0,
        maxTouchPoints: b.maxTouchPoints || 0,
        gpu: b.gpu || '',
        gpuVendor: b.gpuVendor || '',
        ip,
        connectionType: b.connectionType || '',
        connectionSpeed: b.connectionSpeed || '',
        batteryLevel: b.batteryLevel,
        batteryCharging: b.batteryCharging,
        referrer: b.referrer || '',
        referrerDomain: b.referrerDomain || '',
        utmSource: b.utmSource || '',
        utmMedium: b.utmMedium || '',
        utmCampaign: b.utmCampaign || '',
        utmTerm: b.utmTerm || '',
        utmContent: b.utmContent || '',
        cookiesEnabled: b.cookiesEnabled,
        doNotTrack: b.doNotTrack,
        adBlockerDetected: b.adBlockerDetected,
        onlineStatus: b.onlineStatus,
        pdfViewerEnabled: b.pdfViewerEnabled,
        webdriver: b.webdriver,
        platform: b.platform || '',
        userAgent: b.userAgent || '',
        plugins: b.plugins || [],
        cookieConsent: b.cookieConsent || 'pending',
        pages,
        totalPageViews: 1,
        firstVisit: new Date(),
        lastVisit: new Date(),
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Visitor track error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update engagement metrics for a page visit
// @route   PUT /api/visitors/engagement
// @access  Public
router.put('/engagement', async (req, res) => {
  try {
    const { visitorId, page, duration, scrollDepth, clicks } = req.body;
    if (!visitorId) return res.status(400).json({ message: 'visitorId required' });

    const visitor = await Visitor.findOne({ visitorId });
    if (!visitor) return res.status(200).json({ success: false });

    // Update the matching page visit with engagement data
    const pageVisits = visitor.pages;
    for (let i = pageVisits.length - 1; i >= 0; i--) {
      if (pageVisits[i].path === page) {
        pageVisits[i].duration = duration || 0;
        pageVisits[i].scrollDepth = scrollDepth || 0;
        pageVisits[i].clicks = clicks || 0;
        break;
      }
    }

    // Update aggregate metrics
    visitor.totalTimeSpent = (visitor.totalTimeSpent || 0) + (duration || 0);
    visitor.totalClicks = (visitor.totalClicks || 0) + (clicks || 0);

    // Recalculate avg scroll depth
    const scrollPages = pageVisits.filter(p => p.scrollDepth > 0);
    if (scrollPages.length > 0) {
      visitor.avgScrollDepth = Math.round(
        scrollPages.reduce((sum, p) => sum + p.scrollDepth, 0) / scrollPages.length
      );
    }

    visitor.bounced = visitor.totalPageViews <= 1 && (duration || 0) < 10;

    await visitor.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update cookie consent
// @route   PUT /api/visitors/consent
// @access  Public
router.put('/consent', async (req, res) => {
  try {
    const { visitorId, consent } = req.body;
    if (!visitorId) return res.status(400).json({ message: 'visitorId required' });
    await Visitor.findOneAndUpdate(
      { visitorId },
      { cookieConsent: consent || 'accepted' }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Link contact info from form submission to visitor
// @route   PUT /api/visitors/link-contact
// @access  Public
router.put('/link-contact', async (req, res) => {
  try {
    const { visitorId, name, email, phone, company } = req.body;
    if (!visitorId) return res.status(400).json({ message: 'visitorId required' });

    const updateData = {};
    if (name) updateData['contactInfo.name'] = name;
    if (email) updateData['contactInfo.email'] = email;
    if (phone) updateData['contactInfo.phone'] = phone;
    if (company) updateData['contactInfo.company'] = company;

    await Visitor.findOneAndUpdate({ visitorId }, { $set: updateData });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all visitors with pagination
// @route   GET /api/visitors
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [visitors, total] = await Promise.all([
      Visitor.find({})
        .sort({ lastVisit: -1 })
        .skip(skip)
        .limit(limit)
        .select('-pages -userAgent -plugins'),
      Visitor.countDocuments({}),
    ]);

    res.json({ visitors, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get visitor analytics summary
// @route   GET /api/visitors/analytics
// @access  Private/Admin
router.get('/analytics', protect, admin, async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7d = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalVisitors, todayVisitors, last7dVisitors, last30dVisitors,
      totalPageViews, deviceStats, browserStats, osStats, topPages,
      consentStats, returningCount, avgEngagement, bouncedCount,
      contactLinked,
    ] = await Promise.all([
      Visitor.countDocuments({}),
      Visitor.countDocuments({ lastVisit: { $gte: today } }),
      Visitor.countDocuments({ lastVisit: { $gte: last7d } }),
      Visitor.countDocuments({ lastVisit: { $gte: last30d } }),
      Visitor.aggregate([{ $group: { _id: null, total: { $sum: '$totalPageViews' } } }]),
      Visitor.aggregate([{ $group: { _id: '$device', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Visitor.aggregate([{ $group: { _id: '$browser', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]),
      Visitor.aggregate([{ $group: { _id: '$os', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]),
      Visitor.aggregate([
        { $unwind: '$pages' },
        { $group: { _id: '$pages.path', views: { $sum: 1 } } },
        { $sort: { views: -1 } }, { $limit: 10 },
      ]),
      Visitor.aggregate([{ $group: { _id: '$cookieConsent', count: { $sum: 1 } } }]),
      Visitor.countDocuments({ isReturning: true }),
      Visitor.aggregate([{
        $group: {
          _id: null,
          avgTime: { $avg: '$totalTimeSpent' },
          avgScroll: { $avg: '$avgScrollDepth' },
          avgClicks: { $avg: '$totalClicks' },
        }
      }]),
      Visitor.countDocuments({ bounced: true }),
      Visitor.countDocuments({ 'contactInfo.email': { $exists: true, $ne: '' } }),
    ]);

    // Daily visitors for last 7 days
    const dailyVisitors = await Visitor.aggregate([
      { $match: { lastVisit: { $gte: last7d } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastVisit' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalVisitors, todayVisitors, last7dVisitors, last30dVisitors,
      totalPageViews: totalPageViews[0]?.total || 0,
      deviceStats, browserStats, osStats, topPages,
      consentStats,
      returningVisitors: returningCount,
      newVisitors: totalVisitors - returningCount,
      dailyVisitors,
      avgTimeSpent: Math.round(avgEngagement[0]?.avgTime || 0),
      avgScrollDepth: Math.round(avgEngagement[0]?.avgScroll || 0),
      avgClicks: Math.round(avgEngagement[0]?.avgClicks || 0),
      bounceRate: totalVisitors > 0 ? Math.round((bouncedCount / totalVisitors) * 100) : 0,
      contactLinked,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single visitor details
// @route   GET /api/visitors/:id
// @access  Private/Admin
router.get('/:id', protect, admin, async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' });
    res.json(visitor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
