import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { apiRequest } from './utils/api';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Gallery from './pages/Gallery';
import UploadPhoto from './pages/UploadPhoto';
import PhotoDetail from './pages/PhotoDetail';
import Albums from './pages/Albums';
import CreateAlbum from './pages/CreateAlbum';
import AlbumDetail from './pages/AlbumDetail';
import UserProfile from './pages/UserProfile';
import EditProfile from './pages/EditProfile';
import LoginRegister from './pages/LoginRegister';

const loadStoredUser = () => {
  try {
    const token = localStorage.getItem('alzikrayat_token');
    const raw = localStorage.getItem('alzikrayat_user');
    return token && raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

function App() {
  const [user, setUser] = useState(loadStoredUser);
  const [lastLogin, setLastLogin] = useState(
    () => localStorage.getItem('alzikrayat_last_login') || ''
  );

  // Verify stored JWT on app load and clear session if expired/unauthorized
  useEffect(() => {
    const token = localStorage.getItem('alzikrayat_token');
    if (token) {
      apiRequest('/auth/me')
        .then((res) => {
          setUser(res.user);
          localStorage.setItem('alzikrayat_user', JSON.stringify(res.user));
        })
        .catch(() => {
          setUser(null);
          localStorage.removeItem('alzikrayat_token');
          localStorage.removeItem('alzikrayat_user');
        });
    }

    const handleUnauthorized = () => setUser(null);
    window.addEventListener('alzikrayat:unauthorized', handleUnauthorized);
    return () =>
      window.removeEventListener('alzikrayat:unauthorized', handleUnauthorized);
  }, []);

  const handleAuthSuccess = ({ user: loggedInUser, token }) => {
    localStorage.setItem('alzikrayat_token', token);
    localStorage.setItem('alzikrayat_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    const timestamp = new Date().toLocaleString();
    setLastLogin(timestamp);
    localStorage.setItem('alzikrayat_last_login', timestamp);
  };

  const handleProfileUpdated = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('alzikrayat_user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    localStorage.removeItem('alzikrayat_token');
    localStorage.removeItem('alzikrayat_user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <a className="visually-hidden-focusable skip-link" href="#main-content">
        Skip to content
      </a>
      <Navbar user={user} onLogout={handleLogout} />
      <main id="main-content" className="flex-grow-1">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                user={user}
                onAuthSuccess={handleAuthSuccess}
                lastLogin={lastLogin}
              />
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/gallery" element={<Gallery user={user} />} />
          <Route path="/photos" element={<Gallery user={user} />} />
          <Route path="/upload" element={<UploadPhoto user={user} />} />
          <Route path="/photo/create" element={<UploadPhoto user={user} />} />
          <Route path="/photos/:id" element={<PhotoDetail user={user} />} />
          <Route path="/albums" element={<Albums user={user} />} />
          <Route path="/albums/create" element={<CreateAlbum user={user} />} />
          <Route path="/albums/:id" element={<AlbumDetail user={user} />} />
          <Route path="/users/:id" element={<UserProfile user={user} />} />
          <Route
            path="/profile/edit"
            element={
              <EditProfile user={user} onProfileUpdated={handleProfileUpdated} />
            }
          />
          <Route
            path="/login"
            element={
              <LoginRegister
                mode="login"
                user={user}
                onAuthSuccess={handleAuthSuccess}
                lastLogin={lastLogin}
              />
            }
          />
          <Route
            path="/register"
            element={
              <LoginRegister
                mode="register"
                user={user}
                onAuthSuccess={handleAuthSuccess}
                lastLogin={lastLogin}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
