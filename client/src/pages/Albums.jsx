import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import AlbumCard from '../components/AlbumCard';

function Albums({ user }) {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/albums')
      .then((data) => setAlbums(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="container py-4 py-md-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
        <div>
          <span className="eyebrow">Collections</span>
          <h1 className="display-font h1 mt-1 mb-1">Albums</h1>
          <p className="text-body-secondary mb-0">
            Memories grouped by trip, season, celebration or anything you like.
          </p>
        </div>
        {user && (
          <Link to="/albums/create" className="btn btn-accent">
            <i className="bi bi-folder-plus" /> New album
          </Link>
        )}
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status" />
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && albums.length === 0 && (
        <div className="empty-state text-center py-5">
          <i className="bi bi-journal-album" />
          <p className="mt-3 text-body-secondary">No albums yet.</p>
        </div>
      )}

      {!loading && !error && albums.length > 0 && (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4">
          {albums.map((album) => (
            <div className="col" key={album._id}>
              <AlbumCard album={album} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Albums;
