import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div style={styles.container} className="animate-fade-in">
      <div className="glass-card animate-slide-up" style={styles.card}>
        <div style={styles.iconWrapper}>
          <HelpCircle size={44} style={{ color: '#ec4899' }} />
        </div>
        <h1 style={styles.title}>404</h1>
        <h2 style={styles.subtitle}>Page Not Found</h2>
        <p style={styles.text}>The page you are trying to access does not exist, has been moved, or is temporarily unavailable.</p>
        <Link to="/" className="btn-primary" style={styles.btn}>
          <ArrowLeft size={16} />
          <span>Return Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: 'calc(100vh - 120px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    maxWidth: '460px',
    width: '100%',
    padding: '50px 30px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconWrapper: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'rgba(236, 72, 153, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
    boxShadow: '0 0 20px rgba(236, 72, 153, 0.2)',
  },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '64px',
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: '1',
    letterSpacing: '-2px',
    background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '22px',
    color: '#ffffff',
    margin: '8px 0 16px 0',
  },
  text: {
    fontSize: '14px',
    color: '#94a3b8',
    lineHeight: '1.6',
    marginBottom: '30px',
  },
  btn: {
    padding: '12px 24px',
  }
};
export default NotFound;
