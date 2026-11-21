import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import GalleryView from '../components/GalleryView';
import StyleSwitcher from '../components/StyleSwitcher';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';

function AlbumDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [album, setAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [galleryStyle, setGalleryStyle] = useState(
    () => localStorage.getItem('alz-gallery-style') || 'grid3'
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiRequest(`/albums/${id}`)
      .then((data) => {
        setAlbum(data.album);
        setPhotos(data.photos || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStyleChange = (nextStyle) => {
    setGalleryStyle(nextStyle);
    try {
      localStorage.setItem('alz-gallery-style', nextStyle);
    } catch {
      // ignore
    }
  };

  const handleDeleteAlbum = async () => {
    setShowConfirm(false);
    try {
      await apiRequest(`/albums/${id}`, { method: 'DELETE' });
      navigate('/albums');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" role="status" />
      </div>
    );
  }

  if (error || !album) {
    return (
      <section className="container py-5">
        <div className="alert alert-danger">{error || 'Album not found'}</div>
        <Link to="/albums" className="btn btn-outline-secondary btn-sm">
          Back to Albums
        </Link>
      </section>
    );
  }

  const owner = album.userId || {};
  const ownerId = owner._id || album.userId;
  const isOwner = Boolean(user && ownerId && user._id === ownerId);

  return (
    <section className="container py-4 py-md-5">
      <div className="page-header d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3 mb-4">
        <div>
          <span className="eyebrow">Album</span>
          <h1 className="display-font h1 mt-1 mb-1">{album.title}</h1>
          <p className="text-body-secondary mb-1">
            by{' '}
            <Link to={`/users/${ownerId}`}>
              {owner.firstName} {owner.lastName}
            </Link>{' '}
            · {photos.length} photo{photos.length === 1 ? '' : 's'}
          </p>
          {album.description && (
            <p className="mb-0" style={{ maxWidth: '44rem', whiteSpace: 'pre-line' }}>
              {album.description}
            </p>
          )}
        </div>

        <div className="d-flex flex-wrap gap-2 align-items-center">
          <StyleSwitcher galleryStyle={galleryStyle} onChange={handleStyleChange} />
          {isOwner && (
            <>
              <Link
                to={`/upload?album=${album._id}`}
                className="btn btn-sm btn-accent"
              >
                <i className="bi bi-plus-lg" /> Add photo
              </Link>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => setShowConfirm(true)}
                aria-label="Delete album"
              >
                <i className="bi bi-trash3" />
              </button>
            </>
          )}
        </div>
      </div>

      {photos.length === 0 ? (
        <EmptyState message="This album is still empty." user={user} />
      ) : (
        <GalleryView photos={photos} galleryStyle={galleryStyle} />
      )}

      <ConfirmModal
        show={showConfirm}
        message={`Delete the album “${album.title}”? The photos themselves will be kept.`}
        onConfirm={handleDeleteAlbum}
        onCancel={() => setShowConfirm(false)}
      />
    </section>
  );
}

export default AlbumDetail;
