// An in-memory data store for Demo Mode
const store = {
  users: [],
  urls: [],
  analytics: []
};

// Auto-seed some analytics data for demonstration purposes if desired
const seedMockData = (userId) => {
  // If we already have seeded data, don't re-seed
  if (store.urls.length > 0) return;

  const demoUrlId1 = '60d0fe4f5311236168a10001';
  const demoUrlId2 = '60d0fe4f5311236168a10002';

  // Seed 2 URLs for the registered user
  store.urls.push(
    {
      _id: demoUrlId1,
      userId: userId,
      originalUrl: 'https://news.ycombinator.com',
      shortCode: 'ycomb',
      customAlias: 'ycomb',
      clicks: 142,
      expiresAt: null,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    },
    {
      _id: demoUrlId2,
      userId: userId,
      originalUrl: 'https://github.com/google/deepmind',
      shortCode: 'dmind',
      customAlias: null,
      clicks: 89,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expires in 30 days
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  );

  // Seed detailed analytics for the first URL (142 clicks total, let's generate some realistic distribute logs)
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
  const osList = ['Windows', 'macOS', 'Linux', 'iOS', 'Android'];
  const referrers = ['Twitter', 'LinkedIn', 'Reddit', 'GitHub', 'Direct'];
  const devices = ['Desktop', 'Mobile', 'Tablet'];

  for (let i = 0; i < 142; i++) {
    // Distribute timestamps over last 7 days
    const daysAgo = Math.floor(Math.random() * 8);
    const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 12 * 60 * 60 * 1000);

    store.analytics.push({
      _id: `anal1_${i}`,
      urlId: demoUrlId1,
      timestamp,
      ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      userAgent: 'Mozilla/5.0 ...',
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      os: osList[Math.floor(Math.random() * osList.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      referrer: referrers[Math.floor(Math.random() * referrers.length)]
    });
  }

  // Seed detailed analytics for the second URL (89 clicks)
  for (let i = 0; i < 89; i++) {
    const daysAgo = Math.floor(Math.random() * 5);
    const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 12 * 60 * 60 * 1000);

    store.analytics.push({
      _id: `anal2_${i}`,
      urlId: demoUrlId2,
      timestamp,
      ip: `10.0.0.${Math.floor(Math.random() * 254) + 1}`,
      userAgent: 'Mozilla/5.0 ...',
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      os: osList[Math.floor(Math.random() * osList.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      referrer: referrers[Math.floor(Math.random() * referrers.length)]
    });
  }

  console.log('🌱 [Mock DB] Successfully seeded demo analytical records!');
};

export const mockDb = {
  users: {
    findOne: async (query) => {
      return store.users.find(u => {
        if (query._id) return u._id.toString() === query._id.toString();
        if (query.email) return u.email.toLowerCase() === query.email.toLowerCase();
        if (query.username) return u.username.toLowerCase() === query.username.toLowerCase();
        return false;
      }) || null;
    },
    findById: async (id) => {
      return store.users.find(u => u._id.toString() === id.toString()) || null;
    },
    create: async (userData) => {
      const newUser = {
        _id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        ...userData,
        createdAt: new Date()
      };
      store.users.push(newUser);
      // Auto seed when a new user registers in mock mode
      seedMockData(newUser._id);
      return newUser;
    }
  },

  urls: {
    find: async (query) => {
      let results = store.urls.filter(u => {
        if (query.userId && u.userId.toString() !== query.userId.toString()) return false;
        return true;
      });
      // Handle simple sorting by latest
      return results.sort((a, b) => b.createdAt - a.createdAt);
    },
    findOne: async (query) => {
      return store.urls.find(u => {
        if (query._id) return u._id.toString() === query._id.toString();
        if (query.shortCode) return u.shortCode === query.shortCode;
        if (query.customAlias) return u.customAlias === query.customAlias;
        return false;
      }) || null;
    },
    findById: async (id) => {
      return store.urls.find(u => u._id.toString() === id.toString()) || null;
    },
    create: async (urlData) => {
      const newUrl = {
        _id: `url_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        clicks: 0,
        customAlias: null,
        expiresAt: null,
        ...urlData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      store.urls.push(newUrl);
      return newUrl;
    },
    findByIdAndUpdate: async (id, updateData, options) => {
      const idx = store.urls.findIndex(u => u._id.toString() === id.toString());
      if (idx === -1) return null;
      store.urls[idx] = {
        ...store.urls[idx],
        ...updateData,
        updatedAt: new Date()
      };
      return store.urls[idx];
    },
    findByIdAndDelete: async (id) => {
      const idx = store.urls.findIndex(u => u._id.toString() === id.toString());
      if (idx === -1) return null;
      const deleted = store.urls.splice(idx, 1)[0];
      // Also delete corresponding analytics records
      store.analytics = store.analytics.filter(a => a.urlId.toString() !== id.toString());
      return deleted;
    },
    incrementClicks: async (id) => {
      const url = store.urls.find(u => u._id.toString() === id.toString());
      if (url) {
        url.clicks += 1;
      }
      return url;
    }
  },

  analytics: {
    create: async (analyticData) => {
      const newAnalytic = {
        _id: `anal_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        ...analyticData,
        timestamp: new Date()
      };
      store.analytics.push(newAnalytic);
      return newAnalytic;
    },
    find: async (query) => {
      return store.analytics.filter(a => {
        if (query.urlId && a.urlId.toString() !== query.urlId.toString()) return false;
        return true;
      });
    },
    // Mock aggregation pipelines
    aggregateStats: async (urlId) => {
      const urlAnalytics = store.analytics.filter(a => a.urlId.toString() === urlId.toString());

      // 1. Group by Daily Click Trend (Last 7 days)
      const dailyTrend = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dailyTrend[dateStr] = 0;
      }

      urlAnalytics.forEach(a => {
        const dateStr = new Date(a.timestamp).toISOString().split('T')[0];
        if (dailyTrend[dateStr] !== undefined) {
          dailyTrend[dateStr]++;
        }
      });

      const trendData = Object.keys(dailyTrend).map(date => ({
        _id: date,
        count: dailyTrend[date]
      })).sort((a, b) => a._id.localeCompare(b._id));

      // Helper for value distributions
      const getDist = (field) => {
        const counts = {};
        urlAnalytics.forEach(a => {
          const val = a[field] || 'Unknown';
          counts[val] = (counts[val] || 0) + 1;
        });
        return Object.keys(counts).map(name => ({
          _id: name,
          count: counts[name]
        })).sort((a, b) => b.count - a.count);
      };

      return {
        dailyClicks: trendData,
        browsers: getDist('browser'),
        os: getDist('os'),
        devices: getDist('device'),
        referrers: getDist('referrer')
      };
    }
  }
};
export default mockDb;
