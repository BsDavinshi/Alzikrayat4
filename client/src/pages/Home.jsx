import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import { avatarColor, initials } from '../utils/helpers';
import LoginRegisterCard from '../components/LoginRegisterCard';
import Polaroids from '../components/Polaroids';
import PhotoCard from '../components/PhotoCard';
import EmptyState from '../components/EmptyState';

function Home({ user, onAuthSuccess, lastLogin }) {
  const [homeData, setHomeData] = useState({
    statistics: { members: 0, photos: 0, comments: 0, albums: 0 },
    heroPhotos: [],
    latestPhotos: [],
    topContributors: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/home')
      .then((data) => setHomeData(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  const { statistics, heroPhotos, latestPhotos, topContributors } = homeData;
  const isGuest = !user;

  const statItems = [
    { value: statistics.members, label: 'Members', icon: 'bi-people' },
    { value: statistics.photos, label: 'Memories', icon: 'bi-camera' },
    { value: statistics.comments, label: 'Comments', icon: 'bi-chat-quote' },
    { value: statistics.albums, label: 'Albums', icon: 'bi-journal-album' }
  ];

  return (
    <>
      <section className="hero">
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="eyebrow">الذكريات · Alzikrayat</span>
              <h1 className="display-font hero-title mt-3">
                Keep the moments
                <br />
                that made you.
              </h1>
              <p className="lead hero-lead mt-3">
                Alzikrayat is a warm little corner of the web for sharing photographs and the stories behind them.
                Upload your memories, give them a vintage glow with our built-in filters, tag the friends who were
                there, and gather around each photo with comments.
              </p>
              <div className="d-flex flex-wrap gap-2 mt-4">
                <Link to="/gallery" className="btn btn-accent btn-lg">
                  <i className="bi bi-images" /> Explore the gallery
                </Link>
                {isGuest ? (
                  <a href="#login-register" className="btn btn-outline-secondary btn-lg d-lg-none">
                    Join now
                  </a>
                ) : (
                  <Link to="/upload" className="btn btn-outline-secondary btn-lg">
                    <i className="bi bi-cloud-arrow-up" /> Share a memory
                  </Link>
                )}
              </div>
            </div>

            <div className="col-lg-6">
              {isGuest ? (
                <LoginRegisterCard onAuthSuccess={onAuthSuccess} lastLogin={lastLogin} />
              ) : (
                <Polaroids heroPhotos={heroPhotos} />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="stats-band row row-cols-2 row-cols-md-4 g-0">
          {statItems.map((item) => (
            <div className="col stat-item" key={item.label}>
              <i className={`bi ${item.icon}`} />
              <div className="stat-value">{Number(item.value || 0).toLocaleString()}</div>
              <div className="stat-label">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {isGuest && heroPhotos.length > 0 && (
        <section className="container mt-5">
          <Polaroids heroPhotos={heroPhotos} isStrip />
        </section>
      )}

      <section className="container mt-5 pt-3">
        <div className="d-flex justify-content-between align-items-end mb-3 flex-wrap gap-2">
          <div>
            <span className="eyebrow">Fresh from the community</span>
            <h2 className="display-font h2 mb-0 mt-1">Latest memories</h2>
          </div>
          <Link to="/gallery" className="btn btn-sm btn-outline-secondary">
            See all <i className="bi bi-arrow-right" />
          </Link>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && latestPhotos.length === 0 && (
          <EmptyState
            message="No memories have been shared yet. Be the first!"
            user={user}
          />
        )}

        {!loading && !error && latestPhotos.length > 0 && (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
            {latestPhotos.map((photo) => (
              <div className="col" key={photo._id}>
                <PhotoCard photo={photo} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="container mt-5 pt-3">
        <div className="row g-4 features">
          <div className="col-md-6 col-lg-3">
            <div className="feature-card h-100">
              <i className="bi bi-magic" />
              <h3 className="h6 mt-3">Creative filters</h3>
              <p className="small text-body-secondary mb-0">
                Sepia, vintage, noir, emboss and more, computed pixel-by-pixel in your browser before upload.
              </p>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="feature-card h-100">
              <i className="bi bi-person-bounding-box" />
              <h3 className="h6 mt-3">Tag your people</h3>
              <p className="small text-body-secondary mb-0">
                Tag registered friends in a photo. Their profile shows every memory they appear in.
              </p>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="feature-card h-100">
              <i className="bi bi-grid-1x2" />
              <h3 className="h6 mt-3">Five display styles</h3>
              <p className="small text-body-secondary mb-0">
                Browse albums as 3 or 4 columns, list cards, masonry or a full-width slider.
              </p>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="feature-card h-100">
              <i className="bi bi-chat-heart" />
              <h3 className="h6 mt-3">Live conversations</h3>
              <p className="small text-body-secondary mb-0">
                Comments and likes appear instantly without reloading the page.
              </p>
            </div>
          </div>
        </div>
      </section>

      {topContributors.length > 0 && (
        <section className="container mt-5 pt-3">
          <span className="eyebrow">Storytellers</span>
          <h2 className="display-font h2 mt-1 mb-3">Top contributors</h2>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3">
            {topContributors.map((member) => (
              <div className="col" key={member._id}>
                <Link to={`/users/${member._id}`} className="member-chip">
                  <span
                    className="avatar"
                    style={{ background: avatarColor(member._id) }}
                  >
                    {initials(member.firstName, member.lastName)}
                  </span>
                  <span>
                    <strong>
                      {member.firstName} {member.lastName}
                    </strong>
                    <small className="d-block text-body-secondary">
                      {member.occupation || 'Member'} · {member.photoCount} photos
                    </small>
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default Home;
