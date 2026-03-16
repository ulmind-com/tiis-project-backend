const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Setup Cloudinary storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tiis_uploads', // Optional folder name in your Cloudinary account
    allowedFormats: ['jpeg', 'png', 'jpg', 'webp', 'pdf'], // Allow pdfs for CVs
    // Exclude transformation if you don't need automatic resizing/cropping
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB max
});

module.exports = upload;
