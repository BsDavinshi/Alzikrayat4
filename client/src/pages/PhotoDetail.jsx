import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import {
  avatarColor,
  filterLabel,
  formatDate,
  initials,
  uploadUrl
} from '../utils/helpers';
import CommentForm from '../components/CommentForm';
import ConfirmModal from '../components/ConfirmModal';

function PhotoDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [photo, setPhoto] = useState(null);
  const [comments, setComments] = useState([]);
  const [neighbours, setNeighbours] = useState({ previous: null, next: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [likePop, setLikePop] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState('');

  const [confirmState, setConfirmState] = useState({
    show: false,
    message: '',
    onConfirm: null
  });

  useEffect(() => {
    setLoading(true);
    setError('');
    setZoomed(false);
    setLightboxOpen(false);

    apiRequest(`/photos/${id}`)
      .then((data) => {
        setPhoto(data.photo);
        setComments(data.comments || []);
        setNeighbours(data.neighbours || { previous: null, next: null });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Keyboard navigation (← / →) and Escape for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
      if (e.key === 'Escape' && lightboxOpen) {
        setLightboxOpen(false);
        return;
      }
      if (e.key === 'ArrowLeft' && neighbours.previous) {
        navigate(`/photos/${neighbours.previous}`);
      } else if (e.key === 'ArrowRight' && neighbours.next) {
        navigate(`/photos/${neighbours.next}`);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [neighbours, lightboxOpen, navigate]);

  const handleToggleLike = async () => {
    if (!user || !photo) return;
    try {
      const res = await apiRequest(`/photos/${photo._id}/like`, { method: 'POST' });
      setPhoto((prev) => ({
        ...prev,
        likedByViewer: res.liked,
        likeCount: res.likeCount
      }));
      if (res.liked) {
        setLikePop(true);
        setTimeout(() => setLikePop(false), 450);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUntag = async (targetUserId) => {
    try {
      const res = await apiRequest(`/photos/${photo._id}/tags/${targetUserId}`, {
        method: 'DELETE'
      });
      setPhoto((prev) => ({ ...prev, taggedUsers: res.taggedUsers }));
    } catch (err) {
      setError(err.message);
    }
  };

  const requestDeletePhoto = () => {
    setConfirmState({
      show: true,
      message: `Delete “${photo.title}” and all of its comments? This cannot be undone.`,
      onConfirm: async () => {
        setConfirmState((s) => ({ ...s, show: false }));
        try {
          await apiRequest(`/photos/${photo._id}`, { method: 'DELETE' });
          navigate('/gallery');
        } catch (err) {
          setError(err.message);
        }
      }
    });
  };

  const requestDeleteComment = (commentId) => {
    setConfirmState({
      show: true,
      message: 'Delete this comment?',
      onConfirm: async () => {
        setConfirmState((s) => ({ ...s, show: false }));
        try {
          await apiRequest(`/comments/${commentId}`, { method: 'DELETE' });
          setComments((prev) => prev.filter((c) => c._id !== commentId));
        } catch (err) {
          setError(err.message);
        }
      }
    });
  };

  const handleShare = async (type) => {
    const shareUrl = window.location.href;
    const shareTitle = photo.title;
    if (type === 'native' && navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url: shareUrl });
      } catch {
        // user cancelled
      }
      return;
    }
    if (type === 'copy') {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedNotice('Link copied!');
        setTimeout(() => setCopiedNotice(''), 2500);
      } catch {
        setCopiedNotice('Could not copy link');
      }
      return;
    }
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(`${shareTitle} — Alzikrayat`);
    const links = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`
    };
    if (links[type]) window.open(links[type], '_blank', 'noopener');
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading photo...</span>
        </div>
      </div>
    );
  }

  if (error || !photo) {
    return (
      <section className="container py-5">
        <div className="alert alert-danger">{error || 'Photo not found'}</div>
        <Link to="/gallery" className="btn btn-outline-secondary btn-sm">
          Back to Gallery
        </Link>
      </section>
    );
  }

  const author = photo.userId || {};
  const ownerId = author._id || photo.userId;
  const isOwner = Boolean(user && ownerId && user._id === ownerId);
  const authorName = author.firstName
    ? `${author.firstName} ${author.lastName}`
    : 'Member';
  const imageUrl = uploadUrl(photo.fileName);

  return (
    <section className="container py-4">
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small mb-0">
          <li className="breadcrumb-item">
            <Link to="/gallery">Gallery</Link>
          </li>
          {photo.albumId && (
            <li className="breadcrumb-item">
              <Link to={`/albums/${photo.albumId._id}`}>{photo.albumId.title}</Link>
            </li>
          )}
          <li className="breadcrumb-item active" aria-current="page">
            {photo.title}
          </li>
        </ol>
      </nav>

      <div className="row g-4">
        <div className="col-lg-8">
          <figure className="photo-stage mb-0">
            <button
              type="button"
              className="photo-stage-button"
              onClick={() => setLightboxOpen(true)}
              aria-label="Open full size"
            >
              <img src={imageUrl} alt={photo.title} id="mainPhoto" />
            </button>
            {neighbours.previous && (
              <Link
                className="stage-nav stage-nav-prev"
                to={`/photos/${neighbours.previous}`}
                aria-label="Newer photo"
              >
                <i className="bi bi-chevron-left" />
              </Link>
            )}
            {neighbours.next && (
              <Link
                className="stage-nav stage-nav-next"
                to={`/photos/${neighbours.next}`}
                aria-label="Older photo"
              >
                <i className="bi bi-chevron-right" />
              </Link>
            )}
            <figcaption className="photo-stage-hint small">
              <i className="bi bi-arrows-fullscreen" /> Click to view full size · use ← → to browse
            </figcaption>
          </figure>
        </div>

        <div className="col-lg-4">
          <aside className="photo-panel">
            {photo.filterName && photo.filterName !== 'none' && (
              <span className="filter-badge position-static mb-2">
                <i className="bi bi-magic" /> {filterLabel(photo.filterName)} filter
              </span>
            )}
            <h1 className="display-font h2 mb-3">{photo.title}</h1>

            <Link to={`/users/${ownerId}`} className="member-chip mb-3">
              <span
                className="avatar"
                style={{ background: avatarColor(ownerId) }}
              >
                {initials(author.firstName, author.lastName)}
              </span>
              <span>
                <strong>{authorName}</strong>
                <small className="d-block text-body-secondary">
                  {author.occupation || 'Member'}
                </small>
              </span>
            </Link>

            <dl className="photo-meta small">
              <dt>
                <i className="bi bi-calendar3" /> Uploaded
              </dt>
              <dd>{formatDate(photo.dateTime)}</dd>
              {photo.albumId && (
                <>
                  <dt>
                    <i className="bi bi-journal-album" /> Album
                  </dt>
                  <dd>
                    <Link to={`/albums/${photo.albumId._id}`}>
                      {photo.albumId.title}
                    </Link>
                  </dd>
                </>
              )}
            </dl>

            {photo.description && (
              <p className="photo-description" style={{ whiteSpace: 'pre-line' }}>
                {photo.description}
              </p>
            )}

            {photo.taggedUsers && photo.taggedUsers.length > 0 && (
              <div className="mb-3">
                <div className="small fw-semibold mb-2">
                  <i className="bi bi-person-bounding-box" /> In this memory
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {photo.taggedUsers.map((tagged) => (
                    <span className="tag-chip" key={tagged._id}>
                      <Link to={`/users/${tagged._id}`}>
                        {tagged.firstName} {tagged.lastName}
                      </Link>
                      {user && (user._id === tagged._id || isOwner) && (
                        <button
                          type="button"
                          className="tag-chip-remove"
                          onClick={() => handleUntag(tagged._id)}
                          aria-label="Remove tag"
                        >
                          <i className="bi bi-x" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="d-flex flex-wrap gap-2 photo-actions">
              {user ? (
                <button
                  type="button"
                  onClick={handleToggleLike}
                  className={`btn btn-like ${photo.likedByViewer ? 'is-liked' : ''} ${
                    likePop ? 'pop' : ''
                  }`}
                  aria-pressed={photo.likedByViewer}
                >
                  <i
                    className={`bi ${
                      photo.likedByViewer ? 'bi-heart-fill' : 'bi-heart'
                    }`}
                  />{' '}
                  <span>{photo.likeCount || 0}</span>
                </button>
              ) : (
                <Link className="btn btn-like" to="/login" title="Login to like">
                  <i className="bi bi-heart" /> {photo.likeCount || 0}
                </Link>
              )}

              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-share" /> Share
                </button>
                <ul className="dropdown-menu">
                  {typeof navigator !== 'undefined' && navigator.share && (
                    <li>
                      <button
                        className="dropdown-item"
                        type="button"
                        onClick={() => handleShare('native')}
                      >
                        <i className="bi bi-phone" /> Share…
                      </button>
                    </li>
                  )}
                  <li>
                    <button
                      className="dropdown-item"
                      type="button"
                      onClick={() => handleShare('twitter')}
                    >
                      <i className="bi bi-twitter-x" /> Post on X
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      type="button"
                      onClick={() => handleShare('facebook')}
                    >
                      <i className="bi bi-facebook" /> Facebook
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      type="button"
                      onClick={() => handleShare('whatsapp')}
                    >
                      <i className="bi bi-whatsapp" /> WhatsApp
                    </button>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      type="button"
                      onClick={() => handleShare('copy')}
                    >
                      <i className="bi bi-link-45deg" /> Copy link
                    </button>
                  </li>
                </ul>
              </div>

              <a
                className="btn btn-outline-secondary"
                href={imageUrl}
                download
                title="Download original"
              >
                <i className="bi bi-download" />
              </a>

              {isOwner && (
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={requestDeletePhoto}
                >
                  <i className="bi bi-trash3" /> Delete
                </button>
              )}
            </div>

            {copiedNotice && (
              <div className="small text-success mt-2">
                <i className="bi bi-check2" /> {copiedNotice}
              </div>
            )}

            <hr className="my-4" />

            <section id="comments" aria-labelledby="commentsHeading">
              <h2 className="h5 mb-3" id="commentsHeading">
                <i className="bi bi-chat-quote" /> Comments{' '}
                <span className="badge rounded-pill text-bg-secondary">
                  {comments.length}
                </span>
              </h2>

              {comments.length === 0 ? (
                <p className="text-body-secondary small">
                  No comments yet. Start the conversation!
                </p>
              ) : (
                <ul className="comment-list list-unstyled">
                  {comments.map((c) => {
                    const commenter = c.userId || {};
                    const commenterId = commenter._id || c.userId;
                    const canDelete =
                      user && (user._id === commenterId || isOwner);

                    return (
                      <li className="comment is-new" key={c._id}>
                        <Link
                          to={`/users/${commenterId}`}
                          className="avatar avatar-sm flex-shrink-0"
                          style={{ background: avatarColor(commenterId) }}
                        >
                          {initials(commenter.firstName, commenter.lastName)}
                        </Link>
                        <div className="comment-body flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start gap-2">
                            <div>
                              <Link
                                to={`/users/${commenterId}`}
                                className="fw-semibold"
                              >
                                {commenter.firstName} {commenter.lastName}
                              </Link>
                              <time className="small text-body-secondary ms-1">
                                {formatDate(c.dateTime)}
                              </time>
                            </div>
                            {canDelete && (
                              <button
                                type="button"
                                className="btn btn-link btn-sm text-danger p-0"
                                onClick={() => requestDeleteComment(c._id)}
                                aria-label="Delete comment"
                              >
                                <i className="bi bi-trash3" />
                              </button>
                            )}
                          </div>
                          <p
                            className="mb-0 comment-text"
                            style={{ whiteSpace: 'pre-line' }}
                          >
                            {c.comment}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {user ? (
                <CommentForm
                  photoId={photo._id}
                  onCommentAdded={(created) =>
                    setComments((prev) => [...prev, created])
                  }
                />
              ) : (
                <div className="alert alert-light border small mb-0">
                  <Link to="/login">Login</Link> or{' '}
                  <Link to="/register">register</Link> to join the conversation.
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>

      {/* Fullscreen Zoom Lightbox */}
      {lightboxOpen && (
        <div
          className="modal fade show d-block lightbox"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-fullscreen">
            <div className="modal-content">
              <button
                type="button"
                className="btn-close btn-close-white lightbox-close"
                onClick={() => setLightboxOpen(false)}
                aria-label="Close"
              />
              <div
                className="modal-body d-flex align-items-center justify-content-center p-0"
                onClick={() => setZoomed((z) => !z)}
              >
                <img
                  src={imageUrl}
                  alt={photo.title}
                  className="lightbox-image"
                  style={{
                    transform: zoomed ? 'scale(1.6)' : 'scale(1)',
                    cursor: zoomed ? 'zoom-out' : 'zoom-in'
                  }}
                />
              </div>
              <div className="lightbox-caption">
                {photo.title} — {authorName} ·{' '}
                <span className="text-white-50">click to zoom · Esc to close</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        show={confirmState.show}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((s) => ({ ...s, show: false }))}
      />
    </section>
  );
}

export default PhotoDetail;
