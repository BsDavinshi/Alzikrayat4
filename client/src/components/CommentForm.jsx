import { useState } from 'react';
import { apiRequest } from '../utils/api';

const MAX_LENGTH = 1000;

function CommentForm({ photoId, onCommentAdded }) {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submitComment = async () => {
    const trimmed = comment.trim();
    if (!trimmed || submitting) return;

    setError('');
    try {
      setSubmitting(true);
      const created = await apiRequest(`/photos/${photoId}/comments`, {
        method: 'POST',
        body: { comment: trimmed }
      });
      setComment('');
      if (onCommentAdded) onCommentAdded(created);
    } catch (err) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitComment();
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      submitComment();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      {error && <div className="alert alert-danger py-1 small mb-2">{error}</div>}
      <label htmlFor="commentText" className="visually-hidden">
        Your comment
      </label>
      <textarea
        className="form-control"
        id="commentText"
        rows="2"
        required
        maxLength={MAX_LENGTH}
        placeholder="Write a comment…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="d-flex justify-content-between align-items-center mt-2">
        <small className="text-body-secondary">
          {comment.length}/{MAX_LENGTH} · Ctrl+Enter to send
        </small>
        <button
          type="submit"
          className="btn btn-accent btn-sm"
          disabled={submitting || !comment.trim()}
        >
          <i className="bi bi-send" /> {submitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}

export default CommentForm;
