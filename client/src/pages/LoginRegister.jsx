import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

function LoginRegister({ mode = 'login', user, onAuthSuccess, lastLogin }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/gallery');
    }
  }, [user, navigate]);

  const handleComplete = (data) => {
    onAuthSuccess(data);
    navigate('/gallery');
  };

  if (mode === 'register') {
    return (
      <section className="auth-shell container py-5">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-7 col-xl-6">
            <div className="card auth-card shadow-sm">
              <div className="card-body p-4 p-md-5">
                <h1 className="display-font h3 mb-1">Create your account</h1>
                <p className="text-body-secondary small mb-4">
                  Already a member? <Link to="/login">Login here</Link>.
                </p>
                <RegisterForm onAuthSuccess={handleComplete} />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-shell container py-5">
      <div className="row justify-content-center align-items-center g-5">
        <div className="col-lg-5 d-none d-lg-block">
          <h1 className="display-font display-5 mb-3">Welcome back.</h1>
          <p className="lead text-body-secondary">
            Your memories are waiting. Log in to upload new photos, leave comments and tag the people you love.
          </p>
          <ul className="list-unstyled auth-perks mt-4">
            <li>
              <i className="bi bi-cloud-arrow-up" /> Upload photos with creative filters
            </li>
            <li>
              <i className="bi bi-people" /> Tag friends who appear in your memories
            </li>
            <li>
              <i className="bi bi-chat-heart" /> Comment and like instantly
            </li>
          </ul>
        </div>
        <div className="col-md-8 col-lg-5">
          <div className="card auth-card shadow-sm">
            <div className="card-body p-4 p-md-5">
              <h2 className="h4 mb-1">Login</h2>
              <p className="text-body-secondary small mb-4">
                Don&apos;t have an account? <Link to="/register">Register here</Link>.
              </p>
              <LoginForm onAuthSuccess={handleComplete} lastLogin={lastLogin} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LoginRegister;
