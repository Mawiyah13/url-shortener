import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    urlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Url',
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    ip: {
      type: String,
      default: 'Anonymous',
    },
    userAgent: {
      type: String,
    },
    browser: {
      type: String,
      default: 'Unknown',
    },
    os: {
      type: String,
      default: 'Unknown',
    },
    device: {
      type: String,
      default: 'Desktop', // Desktop, Mobile, Tablet, Bot
    },
    referrer: {
      type: String,
      default: 'Direct',
    },
  },
  {
    timestamps: false, // Timestamps not needed as we use explicit timestamp field
  }
);

const Analytics = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);
export default Analytics;
