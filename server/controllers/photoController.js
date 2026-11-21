const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Photo = require('../models/Photo');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Album = require('../models/Album');
const { formatPhotoSummary } = require('./homeController');

const removeUploadedFile = (fileName) => {
  if (!fileName) return;
  const filePath = path.join(__dirname, '..', 'uploads', fileName);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Failed to delete image file:', err.message);
    }
  });
};

const resolveRequestUserId = (req) => req.headers['x-user-id'] || (req.body && req.body.userId) || null;

// GET /api/photos?q=&page=1&limit=12&albumId=
const getAll = async (req, res, next) => {
  try {
    const viewerId = req.headers['x-user-id'] || null;
    const searchTerm = (req.query.q || '').trim();
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(48, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const filter = {};

    if (req.query.albumId && mongoose.Types.ObjectId.isValid(req.query.albumId)) {
      filter.albumId = req.query.albumId;
    }

    if (searchTerm) {
      const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const matchingUsers = await User.find({
        $or: [{ firstName: regex }, { lastName: regex }]
      }).select('_id');
      const userIds = matchingUsers.map((u) => u._id);

      filter.$or = [
        { title: regex },
        { description: regex },
        { userId: { $in: userIds } }
      ];
    }

    const total = await Photo.countDocuments(filter);
    const pages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, pages);

    const photosRaw = await Photo.find(filter)
      .populate('userId', 'firstName lastName occupation')
      .populate('albumId', 'title')
      .sort({ dateTime: -1 })
      .skip((safePage - 1) * limit)
      .limit(limit);

    const items = await formatPhotoSummary(photosRaw, viewerId);

    res.status(200).json({
      items,
      total,
      page: safePage,
      pages,
      perPage: limit
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/photos/:id
const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const viewerId = req.headers['x-user-id'] || null;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid photo ID' });
    }

    const photo = await Photo.findById(id)
      .populate('userId', 'firstName lastName occupation')
      .populate('albumId', 'title')
      .populate('taggedUsers', 'firstName lastName');

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    const [comments, newerPhoto, olderPhoto] = await Promise.all([
      Comment.find({ photoId: id })
        .populate('userId', 'firstName lastName')
        .sort({ dateTime: 1 }),
      Photo.findOne({ dateTime: { $gt: photo.dateTime } })
        .sort({ dateTime: 1 })
        .select('_id'),
      Photo.findOne({ dateTime: { $lt: photo.dateTime } })
        .sort({ dateTime: -1 })
        .select('_id')
    ]);

    const photoObj = photo.toObject();
    const likesArr = photoObj.likes || [];

    res.status(200).json({
      photo: {
        ...photoObj,
        likeCount: likesArr.length,
        likedByViewer: viewerId ? likesArr.some((uid) => uid.toString() === viewerId.toString()) : false
      },
      comments,
      neighbours: {
        previous: newerPhoto ? newerPhoto._id : null,
        next: olderPhoto ? olderPhoto._id : null
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/photos
const create = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please select an image file to upload' });
    }

    const userId = resolveRequestUserId(req);
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      removeUploadedFile(req.file.filename);
      return res.status(401).json({ message: 'You must be logged in to upload photos' });
    }

    const user = await User.findById(userId);
    if (!user) {
      removeUploadedFile(req.file.filename);
      return res.status(401).json({ message: 'You must be logged in to upload photos' });
    }

    const { title, description, filterName } = req.body;
    let albumId = null;
    if (req.body.albumId && req.body.albumId !== '0' && mongoose.Types.ObjectId.isValid(req.body.albumId)) {
      const album = await Album.findOne({ _id: req.body.albumId, userId });
      if (album) albumId = album._id;
    }

    let taggedUsers = [];
    if (req.body.taggedUsers) {
      let rawTags = req.body.taggedUsers;
      if (typeof rawTags === 'string') {
        try {
          rawTags = JSON.parse(rawTags);
        } catch {
          rawTags = rawTags.split(',').map((s) => s.trim()).filter(Boolean);
        }
      }
      if (Array.isArray(rawTags)) {
        taggedUsers = [...new Set(rawTags.filter((uid) => mongoose.Types.ObjectId.isValid(uid)))];
      }
    }

    const photo = await Photo.create({
      userId,
      albumId,
      fileName: req.file.filename,
      title,
      description: description || '',
      filterName: filterName || 'none',
      taggedUsers
    });

    await photo.populate('userId', 'firstName lastName occupation');
    await photo.populate('albumId', 'title');
    await photo.populate('taggedUsers', 'firstName lastName');

    res.status(201).json({
      ...photo.toObject(),
      likeCount: 0,
      commentCount: 0,
      likedByViewer: false
    });
  } catch (err) {
    if (req.file) removeUploadedFile(req.file.filename);
    next(err);
  }
};

// DELETE /api/photos/:id
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid photo ID' });
    }

    const userId = resolveRequestUserId(req);
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'You must be logged in to delete a photo' });
    }

    const photo = await Photo.findById(id);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    if (photo.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only delete your own photos' });
    }

    await Comment.deleteMany({ photoId: id });
    await Photo.findByIdAndDelete(id);
    removeUploadedFile(photo.fileName);

    res.status(200).json({ message: 'Photo deleted successfully', id });
  } catch (err) {
    next(err);
  }
};

// POST /api/photos/:id/like
const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = resolveRequestUserId(req);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid photo ID' });
    }
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'Please log in to like photos' });
    }

    const photo = await Photo.findById(id);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    const alreadyLiked = photo.likes.some((uid) => uid.toString() === userId.toString());
    if (alreadyLiked) {
      photo.likes = photo.likes.filter((uid) => uid.toString() !== userId.toString());
    } else {
      photo.likes.push(userId);
    }
    await photo.save();

    res.status(200).json({
      liked: !alreadyLiked,
      likeCount: photo.likes.length
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/photos/:id/tags/:targetUserId
const untagUser = async (req, res, next) => {
  try {
    const { id, targetUserId } = req.params;
    const userId = resolveRequestUserId(req);

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'Login required' });
    }

    const photo = await Photo.findById(id);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    const isOwner = photo.userId.toString() === userId.toString();
    const isSelf = targetUserId.toString() === userId.toString();
    if (!isOwner && !isSelf) {
      return res.status(403).json({ message: 'Not allowed to remove this tag' });
    }

    photo.taggedUsers = photo.taggedUsers.filter((uid) => uid.toString() !== targetUserId.toString());
    await photo.save();
    await photo.populate('taggedUsers', 'firstName lastName');

    res.status(200).json({ taggedUsers: photo.taggedUsers });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, remove, toggleLike, untagUser };
