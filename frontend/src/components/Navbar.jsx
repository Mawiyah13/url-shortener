import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Link2, LogOut, User, Database } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAuthenticated, demoMode } = useAuth();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-nav" style={styles.nav}>
      <div style={styles.navContainer}>
        <Link to="/" style={styles.brand}>
          <div style={styles.logoWrapper}>
            <Link2 size={22} style={styles.logoIcon} />
          </div>
          <span style={styles.brandText}>Lynk<span style={styles.brandAccent}>Short</span></span>
        </Link>

        {demoMode && (
          <div style={styles.demoBadge} title="MongoDB is offline. Dynamic data is running in-memory and will reset on server boot.">
            <Database size={13} />
            <span>Demo Mode (Mock DB)</span>
          </div>
        )}

        <div style={styles.navLinks}>
          {isAuthenticated ? (
            <div style={styles.userSection}>
              <div style={styles.userInfo}>
                <User size={16} style={styles.userIcon} />
                <span style={styles.username}>{user?.username}</span>
              </div>
              <button onClick={handleLogoutClick} style={styles.logoutBtn} className="btn-secondary" title="Sign Out">
                <LogOut size={16} />
                <span style={styles.logoutText}>Sign Out</span>
              </button>
            </div>
          ) : (
            <div style={styles.authLinks}>
              <Link to="/login" style={styles.loginLink}>Sign In</Link>
              <Link to="/register" className="btn-primary" style={styles.signupBtn}>Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(17, 24, 39, 0.7)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '12px 24px',
    marginBottom: '30px',
  },
  navContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },
  logoWrapper: {
    background: 'linear-gradient(135deg, hsl(263, 90%, 50%), hsl(190, 90%, 50%))',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
  },
  logoIcon: {
    color: '#ffffff',
  },
  brandText: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '20px',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-0.5px',
  },
  brandAccent: {
    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  demoBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(245, 158, 11, 0.12)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    color: '#fbbf24',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    animation: 'pulse 2s infinite',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#e2e8f0',
  },
  userIcon: {
    color: '#a855f7',
  },
  username: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: '600',
    fontSize: '14px',
  },
  logoutBtn: {
    padding: '8px 14px',
    fontSize: '13px',
    height: 'auto',
    borderRadius: '8px',
  },
  logoutText: {
    '@media (maxWidth: 600px)': {
      display: 'none',
    }
  },
  authLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  loginLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'color 0.2s',
  },
  signupBtn: {
    padding: '8px 16px',
    fontSize: '13px',
    borderRadius: '8px',
    boxShadow: 'none',
  }
};
export default Navbar;
