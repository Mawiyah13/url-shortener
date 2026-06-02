import validator from 'validator';
import Url from '../models/Url.js';
import mockDb from '../config/mockDb.js';
import generateShortCode from '../utils/generateCode.js';

// Reserved system paths that cannot be used as custom aliases
const RESERVED_ALIASES = ['api', 'r', 'auth', 'urls', 'analytics', 'dashboard', 'stats', 'login', 'register'];

// Helper to normalize/validate URLs
const cleanUrl = (url) => {
  let target = url.trim();
  if (!/^https?:\/\//i.test(target)) {
    target = 'http://' + target;
  }
  return target;
};

// @desc    Create a shortened URL
// @route   POST /api/urls
// @access  Private
export const createUrl = async (req, res, next) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;
    const userId = req.user._id;

    if (!originalUrl) {
      res.status(400);
      throw new Error('Original URL is required');
    }

    const normalizedUrl = cleanUrl(originalUrl);

    // Validate URL structure
    if (!validator.isURL(normalizedUrl, { require_protocol: true, require_tld: true })) {
      res.status(400);
      throw new Error('Please enter a valid HTTP/HTTPS URL');
    }

    // Check link expiry date
    let expirationDate = null;
    if (expiresAt) {
      expirationDate = new Date(expiresAt);
      if (isNaN(expirationDate.getTime())) {
        res.status(400);
        throw new Error('Invalid expiration date format');
      }
      if (expirationDate <= new Date()) {
        res.status(400);
        throw new Error('Expiration date must be in the future');
      }
    }

    let resolvedCode = '';

    // Handle Custom Alias request
    if (customAlias) {
      const aliasClean = customAlias.trim().toLowerCase();

      // Enforce custom alias length/characters
      if (aliasClean.length < 3 || aliasClean.length > 20) {
        res.status(400);
        throw new Error('Custom alias must be between 3 and 20 characters');
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(aliasClean)) {
        res.status(400);
        throw new Error('Custom alias can only contain alphanumeric characters, hyphens, and underscores');
      }

      // Block reserved words
      if (RESERVED_ALIASES.includes(aliasClean)) {
        res.status(400);
        throw new Error('This custom alias is reserved for system use');
      }

      // Check duplicate alias in DB
      let aliasTaken = false;
      if (global.isMockDB) {
        const byCode = await mockDb.urls.findOne({ shortCode: aliasClean });
        const byAlias = await mockDb.urls.findOne({ customAlias: aliasClean });
        aliasTaken = !!(byCode || byAlias);
      } else {
        const byCodeOrAlias = await Url.findOne({
          $or: [{ shortCode: aliasClean }, { customAlias: aliasClean }]
        });
        aliasTaken = !!byCodeOrAlias;
      }

      if (aliasTaken) {
        res.status(400);
        throw new Error('Custom alias is already in use. Please select a unique one.');
      }

      resolvedCode = aliasClean;
    } else {
      // Auto-generate code and check for collisions
      let unique = false;
      let attempts = 0;
      while (!unique && attempts < 10) {
        const testCode = generateShortCode(6).toLowerCase();
        let codeExists = false;

        if (global.isMockDB) {
          const byCode = await mockDb.urls.findOne({ shortCode: testCode });
          const byAlias = await mockDb.urls.findOne({ customAlias: testCode });
          codeExists = !!(byCode || byAlias);
        } else {
          const byCodeOrAlias = await Url.findOne({
            $or: [{ shortCode: testCode }, { customAlias: testCode }]
          });
          codeExists = !!byCodeOrAlias;
        }

        if (!codeExists) {
          resolvedCode = testCode;
          unique = true;
        }
        attempts++;
      }

      if (!unique) {
        res.status(500);
        throw new Error('Failed to generate a unique short code after multiple attempts');
      }
    }

    // Save mapping
    let newUrl = null;
    if (global.isMockDB) {
      newUrl = await mockDb.urls.create({
        userId,
        originalUrl: normalizedUrl,
        shortCode: resolvedCode,
        customAlias: customAlias ? resolvedCode : null,
        expiresAt: expirationDate
      });
    } else {
      newUrl = await Url.create({
        userId,
        originalUrl: normalizedUrl,
        shortCode: resolvedCode,
        ...(customAlias ? { customAlias: resolvedCode } : {}),
        expiresAt: expirationDate
      });
    }

    res.status(201).json(newUrl);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active URLs of logged-in user
// @route   GET /api/urls
// @access  Private
export const getMyUrls = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { search } = req.query;

    let urls = [];

    if (global.isMockDB) {
      urls = await mockDb.urls.find({ userId });
    } else {
      let query = { userId };

      if (search) {
        query.$or = [
          { originalUrl: { $regex: search, $options: 'i' } },
          { shortCode: { $regex: search, $options: 'i' } },
          { customAlias: { $regex: search, $options: 'i' } }
        ];
      }

      urls = await Url.find(query).sort({ createdAt: -1 });
    }

    // Manual filtering for search in mock db mode
    if (global.isMockDB && search) {
      const searchLower = search.toLowerCase();
      urls = urls.filter(u =>
        u.originalUrl.toLowerCase().includes(searchLower) ||
        u.shortCode.toLowerCase().includes(searchLower) ||
        (u.customAlias && u.customAlias.toLowerCase().includes(searchLower))
      );
    }

    res.json(urls);
  } catch (error) {
    next(error);
  }
};

// @desc    Get details for a specific URL
// @route   GET /api/urls/:id
// @access  Private
export const getUrlDetails = async (req, res, next) => {
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
      throw new Error('Unauthorized access to URL resource');
    }

    res.json(url);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a URL (Expiry, long URL, customAlias)
// @route   PUT /api/urls/:id
// @access  Private
export const updateUrl = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const urlId = req.params.id;
    const { originalUrl, customAlias, expiresAt } = req.body;

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
      throw new Error('Unauthorized access to URL resource');
    }

    const updateFields = {};

    // Validate original URL if being changed
    if (originalUrl) {
      const normalizedUrl = cleanUrl(originalUrl);
      if (!validator.isURL(normalizedUrl, { require_protocol: true, require_tld: true })) {
        res.status(400);
        throw new Error('Please enter a valid HTTP/HTTPS URL');
      }
      updateFields.originalUrl = normalizedUrl;
    }

    // Validate expiry date if being changed
    if (expiresAt !== undefined) {
      if (expiresAt === null) {
        updateFields.expiresAt = null;
      } else {
        const expirationDate = new Date(expiresAt);
        if (isNaN(expirationDate.getTime())) {
          res.status(400);
          throw new Error('Invalid expiration date format');
        }
        if (expirationDate <= new Date()) {
          res.status(400);
          throw new Error('Expiration date must be in the future');
        }
        updateFields.expiresAt = expirationDate;
      }
    }

    // Validate Custom Alias if being changed
    if (customAlias !== undefined) {
      if (customAlias === null || customAlias.trim() === '') {
        // If they want to remove the custom alias, we keep the original shortCode but clear customAlias field
        updateFields.customAlias = null;
      } else {
        const aliasClean = customAlias.trim().toLowerCase();

        if (aliasClean !== url.customAlias) {
          if (aliasClean.length < 3 || aliasClean.length > 20) {
            res.status(400);
            throw new Error('Custom alias must be between 3 and 20 characters');
          }

          if (!/^[a-zA-Z0-9_-]+$/.test(aliasClean)) {
            res.status(400);
            throw new Error('Custom alias can only contain alphanumeric characters, hyphens, and underscores');
          }

          if (RESERVED_ALIASES.includes(aliasClean)) {
            res.status(400);
            throw new Error('This custom alias is reserved for system use');
          }

          // Check duplicate
          let aliasTaken = false;
          if (global.isMockDB) {
            const byCode = await mockDb.urls.findOne({ shortCode: aliasClean });
            const byAlias = await mockDb.urls.findOne({ customAlias: aliasClean });
            aliasTaken = !!(byCode || byAlias);
          } else {
            const byCodeOrAlias = await Url.findOne({
              $or: [{ shortCode: aliasClean }, { customAlias: aliasClean }]
            });
            aliasTaken = !!byCodeOrAlias;
          }

          if (aliasTaken) {
            res.status(400);
            throw new Error('Custom alias is already in use. Please select a unique one.');
          }

          updateFields.customAlias = aliasClean;
          updateFields.shortCode = aliasClean; // Sync shortCode with custom alias
        }
      }
    }

    let updatedUrl = null;
    if (global.isMockDB) {
      updatedUrl = await mockDb.urls.findByIdAndUpdate(urlId, updateFields);
    } else {
      updatedUrl = await Url.findByIdAndUpdate(urlId, updateFields, { new: true, runValidators: true });
    }

    res.json(updatedUrl);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a URL mapping
// @route   DELETE /api/urls/:id
// @access  Private
export const deleteUrl = async (req, res, next) => {
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
      throw new Error('Unauthorized access to URL resource');
    }

    if (global.isMockDB) {
      await mockDb.urls.findByIdAndDelete(urlId);
    } else {
      await Url.findByIdAndDelete(urlId);
      // Delete child analytics
      await import('../models/Analytics.js').then(async (m) => {
        await m.default.deleteMany({ urlId });
      });
    }

    res.json({ message: 'URL mapping and associated stats successfully deleted.' });
  } catch (error) {
    next(error);
  }
};
