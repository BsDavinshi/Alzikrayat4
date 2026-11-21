const mongoose = require('mongoose');
const User = require('../models/User');
const Photo = require('../models/Photo');
const Album = require('../models/Album');
const { formatPhotoSummary } = require('./homeController');
const { enrichAlbums } = require('./albumController');
const { toPublicUser } = require('./authController');

const resolveRequestUserId = (req) => req.headers['x-user-id'] || (req.body && req.body.userId) || null;

// GET /api/users/search?q=
const search = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.status(200).json([]);

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const users = await User.find({
      $or: [{ firstName: regex }, { lastName: regex }, { email: regex }]
    })
      .select('firstName lastName occupation')
      .limit(8);

    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
const getProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const viewerId = req.headers['x-user-id'] || null;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const [photosRaw, taggedRaw, albumsRaw] = await Promise.all([
      Photo.find({ userId: id })
        .populate('userId', 'firstName lastName occupation')
        .populate('albumId', 'title')
        .sort({ dateTime: -1 }),
      Photo.find({ taggedUsers: id })
        .populate('userId', 'firstName lastName occupation')
        .populate('albumId', 'title')
        .sort({ dateTime: -1 }),
      Album.find({ userId: id })
        .populate('userId', 'firstName lastName')
        .sort({ createdAt: -1 })
    ]);

    const [photos, taggedPhotos, albums] = await Promise.all([
      formatPhotoSummary(photosRaw, viewerId),
      formatPhotoSummary(taggedRaw, viewerId),
      enrichAlbums(albumsRaw)
    ]);

    const likesReceived = photos.reduce((sum, p) => sum + (p.likeCount || 0), 0);

    res.status(200).json({
      profile: {
        ...toPublicUser(user),
        photoCount: photos.length,
        albumCount: albums.length,
        taggedCount: taggedPhotos.length,
        likesReceived
      },
      photos,
      taggedPhotos,
      albums
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/me
const updateProfile = async (req, res, next) => {
  try {
    const userId = resolveRequestUserId(req);
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'Login required to edit profile' });
    }

    const { firstName, lastName, occupation, location, description } = req.body;
    const updated = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        occupation: occupation || '',
        location: location || '',
        description: description || ''
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: toPublicUser(updated)
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { search, getProfile, updateProfile };
