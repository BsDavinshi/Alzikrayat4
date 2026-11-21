const User = require('../models/User');
const Photo = require('../models/Photo');
const Comment = require('../models/Comment');
const Album = require('../models/Album');

const formatPhotoSummary = async (photos, viewerId = null) => {
  const photoIds = photos.map((p) => p._id);
  const commentCounts = await Comment.aggregate([
    { $match: { photoId: { $in: photoIds } } },
    { $group: { _id: '$photoId', count: { $sum: 1 } } }
  ]);
  const countMap = new Map(commentCounts.map((c) => [c._id.toString(), c.count]));

  return photos.map((p) => {
    const obj = p.toObject();
    const likesArr = obj.likes || [];
    return {
      ...obj,
      likeCount: likesArr.length,
      commentCount: countMap.get(obj._id.toString()) || 0,
      likedByViewer: viewerId ? likesArr.some((id) => id.toString() === viewerId.toString()) : false
    };
  });
};

// GET /api/home
const getHomeData = async (req, res, next) => {
  try {
    const viewerId = req.headers['x-user-id'] || null;

    const [members, photosCount, commentsCount, albumsCount] = await Promise.all([
      User.countDocuments(),
      Photo.countDocuments(),
      Comment.countDocuments(),
      Album.countDocuments()
    ]);

    const latestRaw = await Photo.find()
      .populate('userId', 'firstName lastName occupation')
      .populate('albumId', 'title')
      .sort({ dateTime: -1 })
      .limit(8);

    const latestPhotos = await formatPhotoSummary(latestRaw, viewerId);

    // Top 5 most loved / recent photos for Polaroids
    const heroPhotos = [...latestPhotos]
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, 5);

    // Top contributors
    const contributorAgg = await Photo.aggregate([
      { $group: { _id: '$userId', photoCount: { $sum: 1 } } },
      { $sort: { photoCount: -1 } },
      { $limit: 4 }
    ]);

    const contributorUsers = await User.find({
      _id: { $in: contributorAgg.map((c) => c._id) }
    }).select('firstName lastName occupation');

    const userMap = new Map(contributorUsers.map((u) => [u._id.toString(), u]));
    const topContributors = contributorAgg
      .map((c) => {
        const u = userMap.get(c._id.toString());
        if (!u) return null;
        return {
          _id: u._id,
          firstName: u.firstName,
          lastName: u.lastName,
          occupation: u.occupation,
          photoCount: c.photoCount
        };
      })
      .filter(Boolean);

    res.status(200).json({
      statistics: {
        members,
        photos: photosCount,
        comments: commentsCount,
        albums: albumsCount
      },
      heroPhotos,
      latestPhotos: latestPhotos.slice(0, 4),
      topContributors
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getHomeData, formatPhotoSummary };
