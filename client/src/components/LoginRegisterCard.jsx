import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

function LoginRegisterCard({ onAuthSuccess, lastLogin }) {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="card auth-card shadow-sm login-register" id="login-register">
      <div className="card-header bg-transparent border-0 pt-4 px-4">
        <ul className="nav nav-pills nav-fill gap-2" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'login' ? 'active' : ''}`}
              type="button"
              role="tab"
              onClick={() => setActiveTab('login')}
            >
              <i className="bi bi-box-arrow-in-right" /> Login
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'register' ? 'active' : ''}`}
              type="button"
              role="tab"
              onClick={() => setActiveTab('register')}
            >
              <i className="bi bi-person-plus" /> Register
            </button>
          </li>
        </ul>
      </div>
      <div className="card-body p-4">
        {activeTab === 'login' ? (
          <LoginForm
            idPrefix="home-login"
            onAuthSuccess={onAuthSuccess}
            lastLogin={lastLogin}
          />
        ) : (
          <RegisterForm
            idPrefix="home-register"
            onAuthSuccess={onAuthSuccess}
          />
        )}
      </div>
    </div>
  );
}

export default LoginRegisterCard;
