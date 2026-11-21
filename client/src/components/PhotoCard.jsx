import { Link } from 'react-router-dom';
import {
  avatarColor,
  filterLabel,
  formatDate,
  initials,
  timeAgo,
  uploadUrl
} from '../utils/helpers';

function PhotoCard({ photo, cardStyle = 'grid' }) {
  const photoUrl = `/photos/${photo._id}`;
  const author = photo.userId || {};
  const authorId = author._id || photo.userId;
  const authorName = author.firstName
    ? `${author.firstName} ${author.lastName}`
    : 'Unknown Member';

  const truncatedDescription =
    photo.description && photo.description.length > 180
      ? `${photo.description.slice(0, 180)}…`
      : photo.description;

  return (
    <article className={`photo-card photo-card-${cardStyle} h-100`}>
      <Link
        to={photoUrl}
        className={`photo-card-media${cardStyle === 'grid' ? ' ratio ratio-4x3' : ''}`}
      >
        <img
          src={uploadUrl(photo.fileName)}
          alt={photo.title}
          loading="lazy"
        />
        {photo.filterName && photo.filterName !== 'none' && (
          <span className="filter-badge">
            <i className="bi bi-magic" /> {filterLabel(photo.filterName)}
          </span>
        )}
      </Link>

      <div className="photo-card-body">
        <h3 className="photo-card-title">
          <Link to={photoUrl}>{photo.title}</Link>
        </h3>

        {cardStyle === 'list' && truncatedDescription && (
          <p className="photo-card-description">{truncatedDescription}</p>
        )}

        <div className="photo-card-meta">
          <Link
            to={`/users/${authorId}`}
            className="d-inline-flex align-items-center gap-1"
          >
            <span
              className="avatar avatar-xs"
              style={{ background: avatarColor(authorId) }}
            >
              {initials(author.firstName, author.lastName)}
            </span>
            {authorName}
          </Link>
          <span
            className="text-body-secondary"
            title={formatDate(photo.dateTime)}
          >
            {timeAgo(photo.dateTime)}
          </span>
        </div>

        <div className="photo-card-counts">
          <span title="Likes">
            <i className="bi bi-heart" /> {photo.likeCount ?? (photo.likes?.length || 0)}
          </span>
          <span title="Comments">
            <i className="bi bi-chat" /> {photo.commentCount ?? 0}
          </span>
        </div>
      </div>
    </article>
  );
}

export default PhotoCard;
