import { useState } from 'react';
import { apiRequest } from '../utils/api';

function LoginForm({ onAuthSuccess, lastLogin, idPrefix = 'login' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setSubmitting(true);
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: { email: email.trim(), password }
      });
      onAuthSuccess(data);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {lastLogin && (
        <div className="last-login-note d-flex align-items-center gap-2 mb-3">
          <i className="bi bi-clock-history" />
          <span>
            Last login from this computer was <strong>{lastLogin}</strong>
          </span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger py-2 small d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor={`${idPrefix}-email`} className="form-label">
            Email address
          </label>
          <input
            type="email"
            className="form-control"
            id={`${idPrefix}-email`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={100}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>

        <div className="mb-3">
          <label htmlFor={`${idPrefix}-password`} className="form-label">
            Password
          </label>
          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              id={`${idPrefix}-password`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              maxLength={72}
              autoComplete="current-password"
              placeholder="Your password"
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-accent w-100 py-2"
          disabled={submitting}
        >
          <i className="bi bi-box-arrow-in-right" />{' '}
          {submitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </>
  );
}

export default LoginForm;
