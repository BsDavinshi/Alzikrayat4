import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import { avatarColor, initials } from '../utils/helpers';
import GalleryView from '../components/GalleryView';
import AlbumCard from '../components/AlbumCard';
import EmptyState from '../components/EmptyState';

function UserProfile({ user }) {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('photos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setActiveTab('photos');
    apiRequest(`/users/${id}`)
      .then((res) => setData(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" role="status" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <section className="container py-5">
        <div className="alert alert-danger">{error || 'Member not found'}</div>
        <Link to="/gallery" className="btn btn-outline-secondary btn-sm">
          Back to Gallery
        </Link>
      </section>
    );
  }

  const { profile, photos, taggedPhotos, albums } = data;
  const isOwnProfile = Boolean(user && user._id === profile._id);
  const joinedLabel = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      })
    : '';

  return (
    <>
      <section className="profile-hero">
        <div className="container py-5">
          <div className="d-flex flex-column flex-md-row align-items-md-center gap-4">
            <span
              className="avatar avatar-xl"
              style={{ background: avatarColor(profile._id) }}
            >
              {initials(profile.firstName, profile.lastName)}
            </span>

            <div className="flex-grow-1">
              <h1 className="display-font h2 mb-1">
                {profile.firstName} {profile.lastName}
              </h1>
              <div className="d-flex flex-wrap gap-3 text-body-secondary small">
                {profile.occupation && (
                  <span>
                    <i className="bi bi-briefcase" /> {profile.occupation}
                  </span>
                )}
                {profile.location && (
                  <span>
                    <i className="bi bi-geo-alt" /> {profile.location}
                  </span>
                )}
                {joinedLabel && (
                  <span>
                    <i className="bi bi-calendar-heart" /> Joined {joinedLabel}
                  </span>
                )}
              </div>
              {profile.description && (
                <p
                  className="mt-2 mb-0"
                  style={{ maxWidth: '44rem', whiteSpace: 'pre-line' }}
                >
                  {profile.description}
                </p>
              )}
            </div>

            {isOwnProfile && (
              <div className="d-flex gap-2">
                <Link to="/profile/edit" className="btn btn-outline-secondary">
                  <i className="bi bi-pencil" /> Edit profile
                </Link>
                <Link to="/upload" className="btn btn-accent">
                  <i className="bi bi-cloud-arrow-up" /> Upload
                </Link>
              </div>
            )}
          </div>

          <div className="profile-stats d-flex flex-wrap gap-4 mt-4">
            <div>
              <strong>{profile.photoCount}</strong> photos
            </div>
            <div>
              <strong>{profile.albumCount}</strong> albums
            </div>
            <div>
              <strong>{profile.taggedCount}</strong> tagged in
            </div>
            <div>
              <strong>{profile.likesReceived}</strong> likes received
            </div>
          </div>
        </div>
      </section>

      <section className="container py-4">
        <ul className="nav nav-underline mb-4" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'photos' ? 'active' : ''}`}
              type="button"
              role="tab"
              onClick={() => setActiveTab('photos')}
            >
              Photos ({photos.length})
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'tagged' ? 'active' : ''}`}
              type="button"
              role="tab"
              onClick={() => setActiveTab('tagged')}
            >
              Tagged in ({taggedPhotos.length})
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'albums' ? 'active' : ''}`}
              type="button"
              role="tab"
              onClick={() => setActiveTab('albums')}
            >
              Albums ({albums.length})
            </button>
          </li>
        </ul>

        {activeTab === 'photos' && (
          photos.length === 0 ? (
            <EmptyState
              message={
                isOwnProfile
                  ? 'You have not uploaded any photos yet.'
                  : 'No photos yet.'
              }
              user={user}
            />
          ) : (
            <GalleryView photos={photos} galleryStyle="grid4" />
          )
        )}

        {activeTab === 'tagged' && (
          taggedPhotos.length === 0 ? (
            <p className="text-body-secondary py-4 text-center">
              Nobody has tagged {profile.firstName} in a photo yet.
            </p>
          ) : (
            <GalleryView photos={taggedPhotos} galleryStyle="grid4" />
          )
        )}

        {activeTab === 'albums' && (
          albums.length === 0 ? (
            <p className="text-body-secondary py-4 text-center">No albums yet.</p>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4">
              {albums.map((album) => (
                <div className="col" key={album._id}>
                  <AlbumCard album={album} />
                </div>
              ))}
            </div>
          )
        )}
      </section>
    </>
  );
}

export default UserProfile;
