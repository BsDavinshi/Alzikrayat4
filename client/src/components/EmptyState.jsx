import { Link } from 'react-router-dom';

function EmptyState({ message, user }) {
  return (
    <div className="empty-state text-center py-5">
      <i className="bi bi-camera" />
      <p className="mt-3 mb-3 text-body-secondary">{message}</p>
      {user ? (
        <Link to="/upload" className="btn btn-accent">
          <i className="bi bi-cloud-arrow-up" /> Upload a photo
        </Link>
      ) : (
        <Link to="/register" className="btn btn-accent">
          Join Alzikrayat
        </Link>
      )}
    </div>
  );
}

export default EmptyState;
