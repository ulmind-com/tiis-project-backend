const mongoose = require('mongoose');

const PageVisitSchema = new mongoose.Schema({
  path: { type: String, required: true },
  title: { type: String },
  timestamp: { type: Date, default: Date.now },
  duration: { type: Number, default: 0 }, // seconds spent on page
  scrollDepth: { type: Number, default: 0 }, // percentage 0-100
  clicks: { type: Number, default: 0 },
});

const VisitorSchema = new mongoose.Schema({
  // Fingerprint / session ID
  visitorId: {
    type: String,
    required: true,
    index: true,
  },
  // Canvas fingerprint for more reliable identification
  canvasFingerprint: { type: String },

  // Device & browser info
  browser: { type: String },
  browserVersion: { type: String },
  os: { type: String },
  osVersion: { type: String },
  device: { type: String, enum: ['Desktop', 'Mobile', 'Tablet', 'Unknown'], default: 'Unknown' },
  deviceVendor: { type: String },
  deviceModel: { type: String },
  screenResolution: { type: String },
  screenColorDepth: { type: Number },
  viewportSize: { type: String },
  language: { type: String },
  languages: [{ type: String }], // All preferred languages
  timezone: { type: String },
  timezoneOffset: { type: Number },

  // Hardware
  cpuCores: { type: Number },
  deviceMemory: { type: Number }, // GB
  maxTouchPoints: { type: Number },
  gpu: { type: String }, // WebGL renderer
  gpuVendor: { type: String },

  // Network
  ip: { type: String },
  connectionType: { type: String }, // wifi, cellular, etc.
  connectionSpeed: { type: String }, // 4g, 3g, etc.
  isp: { type: String },

  // Battery
  batteryLevel: { type: Number },
  batteryCharging: { type: Boolean },

  // Location (from IP)
  country: { type: String },
  countryCode: { type: String },
  city: { type: String },
  region: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  postalCode: { type: String },

  // Referrer
  referrer: { type: String },
  referrerDomain: { type: String },

  // UTM
  utmSource: { type: String },
  utmMedium: { type: String },
  utmCampaign: { type: String },
  utmTerm: { type: String },
  utmContent: { type: String },

  // Browser capabilities
  cookiesEnabled: { type: Boolean },
  doNotTrack: { type: Boolean },
  adBlockerDetected: { type: Boolean },
  javaEnabled: { type: Boolean },
  onlineStatus: { type: Boolean },
  pdfViewerEnabled: { type: Boolean },
  webdriver: { type: Boolean }, // bot detection
  platform: { type: String },
  userAgent: { type: String },
  plugins: [{ type: String }],

  // Cookie consent
  cookieConsent: { type: String, enum: ['accepted', 'rejected', 'pending'], default: 'pending' },

  // Engagement metrics
  totalTimeSpent: { type: Number, default: 0 }, // total seconds across all visits
  avgScrollDepth: { type: Number, default: 0 },
  totalClicks: { type: Number, default: 0 },
  bounced: { type: Boolean, default: true }, // only 1 page = bounce

  // Pages visited in this session
  pages: [PageVisitSchema],

  // Linked contact info (from form submissions)
  contactInfo: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    company: { type: String },
  },

  // Session info
  totalPageViews: { type: Number, default: 0 },
  sessionDuration: { type: Number, default: 0 },
  isReturning: { type: Boolean, default: false },
  visitCount: { type: Number, default: 1 },

  // Timestamps
  firstVisit: { type: Date, default: Date.now },
  lastVisit: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Visitor', VisitorSchema);
