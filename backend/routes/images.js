import express from 'express';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import authMiddleware from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import Image from '../models/Image.js';
import Folder from '../models/Folder.js';

const router = express.Router();
router.use(authMiddleware);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const hasCloudinaryConfig =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

function uploadToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    Readable.from(buffer).pipe(uploadStream);
  });
}

// GET /api/images?folderId={id}
router.get('/', async (req, res) => {
  try {
    const { folderId } = req.query;
    const userId = req.user._id;

    if (!folderId || !mongoose.Types.ObjectId.isValid(folderId)) {
      return res.status(400).json({ error: 'INVALID_ID', message: 'Valid folderId is required' });
    }

    const folder = await Folder.findOne({ _id: folderId, owner: userId });
    if (!folder) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Folder not found or access denied' });
    }

    const images = await Image.find({ folder: folderId, owner: userId }).sort({ createdAt: -1 });

    res.json({ data: images, message: 'Images retrieved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to get images' });
  }
});

// POST /api/images/upload
router.post('/upload', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(422).json({ errors: [{ field: 'image', message: 'File size must be less than 10MB' }] });
      }
      return res.status(422).json({ errors: [{ field: 'image', message: err.message }] });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { name, folderId } = req.body;
    const userId = req.user._id;

    if (!name || name.trim().length === 0) {
      return res.status(422).json({ errors: [{ field: 'name', message: 'Image name is required' }] });
    }

    if (!folderId || !mongoose.Types.ObjectId.isValid(folderId)) {
      return res.status(422).json({ errors: [{ field: 'folderId', message: 'Valid folderId is required' }] });
    }

    if (!req.file) {
      return res.status(422).json({ errors: [{ field: 'image', message: 'Image file is required' }] });
    }

    if (!hasCloudinaryConfig) {
      return res.status(503).json({
        error: 'UPLOAD_UNAVAILABLE',
        message: 'Cloudinary is not configured on the backend. Check CLOUDINARY_* values in backend/.env and restart the server.',
      });
    }

    const folder = await Folder.findOne({ _id: folderId, owner: userId });
    if (!folder) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Folder not found or access denied' });
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: `nestdrive/${userId}`,
      resource_type: 'image',
    });

    const image = await Image.create({
      name: name.trim(),
      owner: userId,
      folder: folderId,
      cloudinaryUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
      size: result.bytes,
      mimeType: req.file.mimetype,
    });

    res.status(201).json({ data: image, message: 'Image uploaded successfully' });
  } catch (err) {
    console.error(err);
    const statusCode = err?.http_code && err.http_code >= 400 ? err.http_code : 500;
    res.status(statusCode).json({
      error: 'UPLOAD_FAILED',
      message: err?.message ? `Failed to upload image: ${err.message}` : 'Failed to upload image',
    });
  }
});

// DELETE /api/images/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'INVALID_ID', message: 'Invalid image ID' });
    }

    const image = await Image.findOne({ _id: id, owner: userId });
    if (!image) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Image not found or access denied' });
    }

    await cloudinary.uploader.destroy(image.cloudinaryPublicId);
    await Image.deleteOne({ _id: id });

    res.json({ data: null, message: 'Image deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to delete image' });
  }
});

export default router;
