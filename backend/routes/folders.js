import express from 'express';
import mongoose from 'mongoose';
import Folder from '../models/Folder.js';
import Image from '../models/Image.js';
import authMiddleware from '../middleware/auth.js';
import { calculateFolderSize } from '../utils/folderSize.js';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();
router.use(authMiddleware);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/folders?parentId=null|{id}
router.get('/', async (req, res) => {
  try {
    const { parentId } = req.query;
    const userId = req.user._id;

    const parentFilter = parentId === 'null' || parentId === undefined || parentId === ''
      ? null
      : parentId;

    if (parentFilter !== null && !mongoose.Types.ObjectId.isValid(parentFilter)) {
      return res.status(400).json({ error: 'INVALID_ID', message: 'Invalid parentId' });
    }

    const folders = await Folder.find({ owner: userId, parent: parentFilter }).sort({ createdAt: -1 });

    // Compute totalSize and child counts for each folder
    const foldersWithSize = await Promise.all(
      folders.map(async (folder) => {
        const { totalSize, imageCount } = await calculateFolderSize(folder._id, userId);
        const childFolderCount = await Folder.countDocuments({ owner: userId, parent: folder._id });
        const depth = folder.ancestors.length;
        return {
          ...folder.toObject(),
          totalSize,
          imageCount,
          childFolderCount,
          depth,
        };
      })
    );

    res.json({ data: foldersWithSize, message: 'Folders retrieved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to get folders' });
  }
});

// POST /api/folders
router.post('/', async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const userId = req.user._id;

    if (!name || name.trim().length === 0) {
      return res.status(422).json({ errors: [{ field: 'name', message: 'Folder name is required' }] });
    }

    let ancestors = [];
    let parent = null;

    if (parentId && parentId !== 'null') {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ error: 'INVALID_ID', message: 'Invalid parentId' });
      }

      const parentFolder = await Folder.findOne({ _id: parentId, owner: userId });
      if (!parentFolder) {
        return res.status(403).json({ error: 'FORBIDDEN', message: 'Parent folder not found or access denied' });
      }

      ancestors = [...parentFolder.ancestors, parentFolder._id];
      parent = parentFolder._id;
    }

    const folder = await Folder.create({
      name: name.trim(),
      owner: userId,
      parent,
      ancestors,
    });

    res.status(201).json({ data: folder, message: 'Folder created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to create folder' });
  }
});

// GET /api/folders/:id/ancestors
router.get('/:id/ancestors', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'INVALID_ID', message: 'Invalid folder ID' });
    }

    const folder = await Folder.findOne({ _id: id, owner: userId });
    if (!folder) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Folder not found or access denied' });
    }

    const ancestorFolders = await Folder.find({
      _id: { $in: folder.ancestors },
      owner: userId,
    }).select('_id name');

    // Sort ancestors in order (root to parent)
    const orderedAncestors = folder.ancestors
      .map((aid) => ancestorFolders.find((af) => af._id.equals(aid)))
      .filter(Boolean);

    // Include current folder at end
    const breadcrumb = [...orderedAncestors, { _id: folder._id, name: folder.name }];

    res.json({ data: breadcrumb, message: 'Ancestors retrieved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to get ancestors' });
  }
});

// PUT /api/folders/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'INVALID_ID', message: 'Invalid folder ID' });
    }

    if (!name || name.trim().length === 0) {
      return res.status(422).json({ errors: [{ field: 'name', message: 'Folder name is required' }] });
    }

    const folder = await Folder.findOne({ _id: id, owner: userId });
    if (!folder) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Folder not found or access denied' });
    }

    folder.name = name.trim();
    await folder.save();

    res.json({ data: folder, message: 'Folder renamed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to rename folder' });
  }
});

// DELETE /api/folders/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'INVALID_ID', message: 'Invalid folder ID' });
    }

    const folder = await Folder.findOne({ _id: id, owner: userId });
    if (!folder) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Folder not found or access denied' });
    }

    // Find all descendant folders including self
    const descendantFolders = await Folder.find({
      $or: [{ _id: folder._id }, { ancestors: folder._id }],
      owner: userId,
    }).select('_id');

    const descendantIds = descendantFolders.map((f) => f._id);

    // Find all images in those folders
    const images = await Image.find({ folder: { $in: descendantIds }, owner: userId });

    // Delete from Cloudinary
    await Promise.all(
      images.map((img) =>
        cloudinary.uploader.destroy(img.cloudinaryPublicId).catch((e) =>
          console.error('Cloudinary delete error:', e.message)
        )
      )
    );

    // Delete images from DB
    await Image.deleteMany({ folder: { $in: descendantIds }, owner: userId });

    // Delete all folders
    await Folder.deleteMany({ _id: { $in: descendantIds }, owner: userId });

    res.json({ data: null, message: 'Folder and all contents deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to delete folder' });
  }
});

export default router;
