import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { urlService } from '../services/urlService';
import { CustomChart } from '../components/CustomChart';
import { BarChart2, TrendingUp, Calendar, Globe, ArrowLeft, AlertTriangle } from 'lucide-react';

export const PublicStats = () => {
  const { shortCode } = useParams();

  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        setIsLoading(true);
        const data = await urlService.getPublicStats(shortCode);
        setStats(data);
      } catch (err) {
        console.error('Failed to load public stats:', err);
        if (err.message.includes('expired')) {
          setIsExpired(true);
        } else {
          setError(err.message || 'Stats could not be loaded for this short code.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicStats();
  }, [shortCode]);

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner"></div>
        <span style={{ color: '#94a3b8', fontSize: '14px', marginTop: '10px' }}>Fetching link stats...</span>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div style={styles.errorContainer} className="animate-fade-in">
        <div className="glass-card" style={styles.errorCard}>
          <AlertTriangle size={36} style={{ color: '#f59e0b' }} />
          <h3 style={{ color: '#ffffff', margin: '15px 0 10px 0' }}>Link Has Expired</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
            This short URL mapping ("/r/{shortCode}") had an expiration date set and is no longer active.
          </p>
          <Link to="/" className="btn-primary">
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div style={styles.errorContainer} className="animate-fade-in">
        <div className="glass-card" style={styles.errorCard}>
          <span style={{ fontSize: '36px' }}>🔍</span>
          <h3 style={{ color: '#ffffff', margin: '15px 0 10px 0' }}>Short Code Not Found</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
            The requested link stats could not be loaded. Verify that the short code is correct.
          </p>
          <Link to="/" className="btn-primary">
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const fullShortUrl = `http://localhost:5000/r/${stats.shortCode}`;

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Brand Header */}
      <header style={styles.header}>
        <div style={styles.brand}>
          <span style={styles.brandText}>Lynk<span style={styles.brandAccent}>Short</span></span>
          <span style={styles.badge}>Public Insights</span>
        </div>
        <h1 style={styles.title}>Short Link Statistics</h1>
        <div style={styles.linkRow}>
          <span style={styles.shortLabel}>Target short link: </span>
          <a href={fullShortUrl} target="_blank" rel="noopener noreferrer" style={styles.shortLink}>
            {fullShortUrl}
          </a>
        </div>
      </header>

      {/* Main Core Statistics Panel */}
      <div style={styles.statsRow} className="grid-cols-3">
        <div className="glass-card" style={styles.statCard}>
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>Total Visit Volume</span>
            <span style={styles.statValue} className="animate-slide-up">{stats.clicks} clicks</span>
          </div>
          <div style={{ ...styles.statIconWrapper, background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
            <BarChart2 size={22} />
          </div>
        </div>

        <div className="glass-card" style={styles.statCard} className="grid-cols-3-double-span">
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>Activation Date</span>
            <span style={styles.statValueText}>
              {new Date(stats.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div style={{ ...styles.statIconWrapper, background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
            <Calendar size={22} />
          </div>
        </div>
      </div>

      {/* Daily click trend chart */}
      <div className="glass-card animate-slide-up" style={styles.chartCard}>
        <div style={styles.chartHeader}>
          <TrendingUp size={18} style={{ color: '#ec4899', marginRight: '8px' }} />
          <h3 style={styles.chartTitle}>Daily Click Trend Activity (Last 7 Days)</h3>
        </div>
        <div style={styles.chartBody}>
          <CustomChart data={stats.dailyClicks} />
        </div>
      </div>

      {/* Footer disclaimer */}
      <footer style={styles.footer}>
        <p>This analytics data is securely processed and publicly shared by LynkShort. Individual visitor logs, IPs, and browser telemetries are completely protected.</p>
        <div style={{ marginTop: '20px' }}>
          <Link to="/" style={styles.dashboardLink}>
            <ArrowLeft size={14} style={{ marginRight: '6px' }} />
            <span>Create your own short link dashboard</span>
          </Link>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '40px auto 60px auto',
    padding: '0 24px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '35px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '14px',
  },
  brandText: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '22px',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-0.5px',
  },
  brandAccent: {
    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  badge: {
    background: 'rgba(6, 182, 212, 0.12)',
    border: '1px solid rgba(6, 182, 212, 0.25)',
    color: '#22d3ee',
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 8px',
    borderRadius: '12px',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: '32px',
    color: '#ffffff',
    marginBottom: '8px',
  },
  linkRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  shortLabel: {
    fontSize: '13px',
    color: '#94a3b8',
  },
  shortLink: {
    fontSize: '13px',
    color: '#67e8f9',
    textDecoration: 'none',
    fontWeight: '600',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '20px',
    marginBottom: '30px',
    '@media (maxWidth: 600px)': {
      gridTemplateColumns: '1fr',
    }
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 30px',
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  statLabel: {
    fontSize: '13px',
    color: '#94a3b8',
    fontWeight: '500',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#06b6d4',
    fontFamily: "'Outfit', sans-serif",
  },
  statValueText: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: "'Outfit', sans-serif",
  },
  statIconWrapper: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCard: {
    padding: '30px',
    marginBottom: '35px',
  },
  chartHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
  },
  chartTitle: {
    fontSize: '16px',
    color: '#ffffff',
  },
  chartBody: {
    width: '100%',
  },
  footer: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '12px',
    lineHeight: '1.6',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '30px',
  },
  dashboardLink: {
    display: 'inline-flex',
    alignItems: 'center',
    color: '#a855f7',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '13px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '100px 0',
    minHeight: '400px',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '50px 20px',
    minHeight: '400px',
  },
  errorCard: {
    maxWidth: '440px',
    width: '100%',
    padding: '40px 30px',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }
};
export default PublicStats;
