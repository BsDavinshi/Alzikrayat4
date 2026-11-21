import { Link } from 'react-router-dom';
import { uploadUrl } from '../utils/helpers';

function AlbumCard({ album }) {
  const authorName = album.userId
    ? `${album.userId.firstName} ${album.userId.lastName}`
    : 'Member';

  return (
    <Link to={`/albums/${album._id}`} className="album-card h-100">
      <div className="album-cover">
        {album.coverFile ? (
          <img src={uploadUrl(album.coverFile)} alt="" loading="lazy" />
        ) : (
          <div className="album-cover-empty">
            <i className="bi bi-journal-album" />
          </div>
        )}
        <span className="album-count">
          <i className="bi bi-images" /> {album.photoCount || 0}
        </span>
      </div>
      <div className="album-card-body">
        <h3 className="h6 mb-1">{album.title}</h3>
        <small className="text-body-secondary">by {authorName}</small>
      </div>
    </Link>
  );
}

export default AlbumCard;
