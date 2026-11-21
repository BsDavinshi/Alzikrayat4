const mongoose = require('mongoose');
const Album = require('../models/Album');
const Photo = require('../models/Photo');
const User = require('../models/User');
const { formatPhotoSummary } = require('./homeController');

const resolveRequestUserId = (req) => req.headers['x-user-id'] || (req.body && req.body.userId) || null;

// Helper to enrich albums with coverFile and photoCount
const enrichAlbums = async (albums) => {
  return Promise.all(
    albums.map(async (album) => {
      const [photoCount, coverPhoto] = await Promise.all([
        Photo.countDocuments({ albumId: album._id }),
        Photo.findOne({ albumId: album._id }).sort({ dateTime: -1 }).select('fileName')
      ]);
      return {
        ...album.toObject(),
        photoCount,
        coverFile: coverPhoto ? coverPhoto.fileName : null
      };
    })
  );
};

// GET /api/albums
const getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.userId && mongoose.Types.ObjectId.isValid(req.query.userId)) {
      filter.userId = req.query.userId;
    }

    const albums = await Album.find(filter)
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 });

    const enriched = await enrichAlbums(albums);
    res.status(200).json(enriched);
  } catch (err) {
    next(err);
  }
};

// GET /api/albums/:id
const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const viewerId = req.headers['x-user-id'] || null;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid album ID' });
    }

    const album = await Album.findById(id).populate('userId', 'firstName lastName');
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    const photosRaw = await Photo.find({ albumId: id })
      .populate('userId', 'firstName lastName occupation')
      .populate('albumId', 'title')
      .sort({ dateTime: -1 });

    const photos = await formatPhotoSummary(photosRaw, viewerId);

    res.status(200).json({
      album: {
        ...album.toObject(),
        photoCount: photos.length
      },
      photos
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/albums
const create = async (req, res, next) => {
  try {
    const userId = resolveRequestUserId(req);
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'You must be logged in to create an album' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'You must be logged in to create an album' });
    }

    const { title, description } = req.body;
    const album = await Album.create({
      userId,
      title,
      description: description || ''
    });

    await album.populate('userId', 'firstName lastName');
    res.status(201).json({
      ...album.toObject(),
      photoCount: 0,
      coverFile: null
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/albums/:id
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = resolveRequestUserId(req);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid album ID' });
    }
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'Login required' });
    }

    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    if (album.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only delete your own albums' });
    }

    // Keep the photos, just detach them from the deleted album
    await Photo.updateMany({ albumId: id }, { $set: { albumId: null } });
    await Album.findByIdAndDelete(id);

    res.status(200).json({ message: 'Album deleted successfully', id });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, remove, enrichAlbums };
