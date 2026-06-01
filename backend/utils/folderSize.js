import mongoose from 'mongoose';
import Folder from '../models/Folder.js';
import Image from '../models/Image.js';

export async function calculateFolderSize(folderId, userId) {
  const folderObjectId = new mongoose.Types.ObjectId(folderId);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Step 1: Find all descendant folder IDs including self
  const folders = await Folder.find({
    $or: [{ _id: folderObjectId }, { ancestors: folderObjectId }],
    owner: userObjectId,
  }).select('_id');

  const descendantIds = folders.map((f) => f._id);

  // Step 2: Sum image sizes
  const result = await Image.aggregate([
    {
      $match: {
        folder: { $in: descendantIds },
        owner: userObjectId,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$size' },
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    totalSize: result.length > 0 ? result[0].total : 0,
    imageCount: result.length > 0 ? result[0].count : 0,
  };
}
