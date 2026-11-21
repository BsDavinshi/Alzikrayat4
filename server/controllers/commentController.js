const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Photo = require('../models/Photo');
const User = require('../models/User');

const resolveRequestUserId = (req) => req.headers['x-user-id'] || (req.body && req.body.userId) || null;

// GET /api/photos/:id/comments
const getByPhoto = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid photo ID' });
    }

    const comments = await Comment.find({ photoId: id })
      .populate('userId', 'firstName lastName')
      .sort({ dateTime: 1 });

    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
};

// POST /api/photos/:id/comments
const create = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = resolveRequestUserId(req);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid photo ID' });
    }
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'You must be logged in to post a comment' });
    }

    const [photo, user] = await Promise.all([Photo.findById(id), User.findById(userId)]);
    if (!photo) return res.status(404).json({ message: 'Photo not found' });
    if (!user) return res.status(401).json({ message: 'You must be logged in to post a comment' });

    const newComment = await Comment.create({
      photoId: id,
      userId,
      comment
    });

    await newComment.populate('userId', 'firstName lastName');
    res.status(201).json(newComment);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/comments/:commentId
const remove = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = resolveRequestUserId(req);

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'Login required' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const photo = await Photo.findById(comment.photoId);
    const isCommentOwner = comment.userId.toString() === userId.toString();
    const isPhotoOwner = photo && photo.userId.toString() === userId.toString();

    if (!isCommentOwner && !isPhotoOwner) {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }

    await Comment.findByIdAndDelete(commentId);
    res.status(200).json({ message: 'Comment deleted', id: commentId });
  } catch (err) {
    next(err);
  }
};

module.exports = { getByPhoto, create, remove };
