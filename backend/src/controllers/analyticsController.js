import mongoose from 'mongoose';
import Url from '../models/Url.js';
import Analytics from '../models/Analytics.js';
import mockDb from '../config/mockDb.js';

// Helper to fill missing dates in 7-day trend with 0s
const fillDailyClickGaps = (data, daysCount = 7) => {
  const result = {};
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    result[dateStr] = 0;
  }

  data.forEach(item => {
    // MongoDB aggregation might yield date strings or date objects
    let dateKey = '';
    if (typeof item._id === 'string') {
      dateKey = item._id;
    } else if (item._id instanceof Date) {
      dateKey = item._id.toISOString().split('T')[0];
    } else if (item._id && item._id.year) {
      // Handles custom grouping outputs if any
      const month = String(item._id.month).padStart(2, '0');
      const day = String(item._id.day).padStart(2, '0');
      dateKey = `${item._id.year}-${month}-${day}`;
    }
    
    if (dateKey && result[dateKey] !== undefined) {
      result[dateKey] = item.count;
    }
  });

  return Object.keys(result).map(date => ({
    _id: date,
    count: result[date]
  })).sort((a, b) => a._id.localeCompare(b._id));
};

// @desc    Get detailed analytics for a URL
// @route   GET /api/analytics/:id
// @access  Private
export const getUrlAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const urlId = req.params.id;

    let url = null;
    if (global.isMockDB) {
      url = await mockDb.urls.findById(urlId);
    } else {
      url = await Url.findById(urlId);
    }

    if (!url) {
      res.status(404);
      throw new Error('URL mapping not found');
    }

    if (url.userId.toString() !== userId.toString()) {
      res.status(403);
      throw new Error('Unauthorized access to URL analytics');
    }

    if (global.isMockDB) {
      const stats = await mockDb.analytics.aggregateStats(urlId);
      return res.json({
        url,
        stats
      });
    }

    // Mongoose MongoDB Aggregations
    const objId = new mongoose.Types.ObjectId(urlId);

    // 1. Group Clicks by Day (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyClicksGroup = await Analytics.aggregate([
      {
        $match: {
          urlId: objId,
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dailyClicks = fillDailyClickGaps(dailyClicksGroup, 7);

    // 2. Group by Browser
    const browsers = await Analytics.aggregate([
      { $match: { urlId: objId } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 3. Group by OS
    const os = await Analytics.aggregate([
      { $match: { urlId: objId } },
      { $group: { _id: '$os', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 4. Group by Device
    const devices = await Analytics.aggregate([
      { $match: { urlId: objId } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 5. Group by Referrer
    const referrers = await Analytics.aggregate([
      { $match: { urlId: objId } },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      url,
      stats: {
        dailyClicks,
        browsers,
        os,
        devices,
        referrers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public statistics for a short URL (Safe, no PII/browsers exposed)
// @route   GET /api/analytics/public/:shortCode
// @access  Public
export const getPublicStats = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    let url = null;
    if (global.isMockDB) {
      url = await mockDb.urls.findOne({ shortCode });
    } else {
      url = await Url.findOne({ shortCode });
    }

    if (!url) {
      res.status(404);
      throw new Error('Short URL not found');
    }

    // Check if expired
    if (url.expiresAt && new Date(url.expiresAt) <= new Date()) {
      return res.status(410).json({
        message: 'This short link has expired.',
        originalUrl: url.originalUrl,
        expired: true
      });
    }

    if (global.isMockDB) {
      const allStats = await mockDb.analytics.aggregateStats(url._id);
      return res.json({
        clicks: url.clicks,
        createdAt: url.createdAt,
        shortCode: url.shortCode,
        dailyClicks: allStats.dailyClicks
      });
    }

    // MongoDB Mongoose Fetch
    const objId = url._id;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyClicksGroup = await Analytics.aggregate([
      {
        $match: {
          urlId: objId,
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dailyClicks = fillDailyClickGaps(dailyClicksGroup, 7);

    res.json({
      clicks: url.clicks,
      createdAt: url.createdAt,
      shortCode: url.shortCode,
      dailyClicks
    });
  } catch (error) {
    next(error);
  }
};
