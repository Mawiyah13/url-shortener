import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { urlService } from '../services/urlService';
import { CustomChart } from '../components/CustomChart';
import {
  ArrowLeft, Calendar, Link2, ExternalLink, BarChart2,
  TrendingUp, Globe, Monitor, Share2, Shield
} from 'lucide-react';

export const AnalyticsPage = () => {
  const { id } = useParams();

  const [urlInfo, setUrlInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const data = await urlService.getAnalytics(id);
        setUrlInfo(data.url);
        setStats(data.stats);
      } catch (err) {
        console.error('Failed to load analytics:', err);
        setError(err.message || 'Failed to retrieve analytics record');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [id]);

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner"></div>
        <span style={{ color: '#94a3b8', fontSize: '14px', marginTop: '10px' }}>Analyzing click records...</span>
      </div>
    );
  }

  if (error || !urlInfo || !stats) {
    return (
      <div style={styles.errorContainer} className="animate-fade-in">
        <div className="glass-card" style={styles.errorCard}>
          <span style={{ fontSize: '32px' }}>⚠️</span>
          <h3 style={{ color: '#ffffff', margin: '10px 0' }}>Analytics Error</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>{error || 'Unable to load statistics for this short link.'}</p>
          <Link to="/" className="btn-primary">
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const renderDistributionBars = (items = [], accentColor = 'hsl(263, 90%, 50%)') => {
    const total = items.reduce((acc, curr) => acc + curr.count, 0);
    if (total === 0) {
      return <div style={styles.noDataText}>No visitor logs recorded.</div>;
    }

    return (
      <div style={styles.distContainer}>
        {items.slice(0, 5).map((item, idx) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={idx} style={styles.distRow}>
              <div style={styles.distTextRow}>
                <span style={styles.distName}>{item._id || 'Unknown'}</span>
                <span style={styles.distValue}>{item.count} clicks ({pct}%)</span>
              </div>
              <div style={styles.barTrack}>
                <div
                  style={{
                    ...styles.barFill,
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${accentColor} 0%, hsl(326, 90%, 60%) 100%)`,
                    boxShadow: `0 0 8px ${accentColor}`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const fullShortUrl = `${import.meta.env.VITE_REDIRECT_BASE}/${urlInfo.shortCode}`;
  return (
    <div style={styles.container} className="animate-fade-in">
      <Link to="/" style={styles.backBtn} className="btn-secondary">
        <ArrowLeft size={16} />
        <span>Back to Dashboard</span>
      </Link>

      <header style={styles.hero}>
        <div style={styles.heroLeft}>
          <div style={styles.heroIconWrapper}>
            <BarChart2 size={24} style={{ color: '#a855f7' }} />
          </div>
          <div>
            <h2 style={styles.heroTitle}>Link Analytics Dashboard</h2>
            <div style={styles.shortLinkWrapper}>
              <span style={styles.shortLabel}>Shortened Link:</span>
              <a href={fullShortUrl} target="_blank" rel="noopener noreferrer" style={styles.shortLink}>
                {fullShortUrl}
                <ExternalLink size={12} style={{ marginLeft: '4px' }} />
              </a>
            </div>
          </div>
        </div>

        <div style={styles.heroRight}>
          <a href={`/stats/${urlInfo.shortCode}`} target="_blank" rel="noopener noreferrer" style={styles.shareBtn} className="btn-primary">
            <Share2 size={16} />
            <span>Public Stats View</span>
          </a>
        </div>
      </header>

      <div className="glass-card" style={styles.metaCard}>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Original Destination URL</span>
          <a href={urlInfo.originalUrl} target="_blank" rel="noopener noreferrer" style={styles.metaUrlLink}>
            {urlInfo.originalUrl}
            <ExternalLink size={13} style={{ marginLeft: '4px' }} />
          </a>
        </div>

        <div style={styles.metaSubRow}>
          <div style={styles.metaSubItem}>
            <span style={styles.metaLabel}>Creation Date</span>
            <span style={styles.metaValue}>
              <Calendar size={13} style={{ color: '#64748b', marginRight: '6px' }} />
              {new Date(urlInfo.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <div style={styles.metaSubItem}>
            <span style={styles.metaLabel}>Total Accumulated Click Count</span>
            <span style={styles.clickHighlight}>{urlInfo.clicks} visits</span>
          </div>
        </div>
      </div>

      <div className="glass-card animate-slide-up" style={styles.chartCard}>
        <div style={styles.cardHeader}>
          <TrendingUp size={18} style={{ color: '#ec4899', marginRight: '8px' }} />
          <h3 style={styles.cardTitle}>Daily Clicks Activity (Last 7 Days)</h3>
        </div>
        <div style={styles.chartBody}>
          <CustomChart data={stats.dailyClicks} />
        </div>
      </div>

      <section style={styles.distGrid}>
        <div style={styles.distGridRow}>
          <div className="glass-card" style={styles.gridCard}>
            <div style={styles.cardHeader}>
              <Globe size={18} style={{ color: '#06b6d4', marginRight: '8px' }} />
              <h3 style={styles.cardTitle}>Top Browsers</h3>
            </div>
            <div style={styles.gridCardBody}>
              {renderDistributionBars(stats.browsers, '#06b6d4')}
            </div>
          </div>

          <div className="glass-card" style={styles.gridCard}>
            <div style={styles.cardHeader}>
              <Monitor size={18} style={{ color: '#6366f1', marginRight: '8px' }} />
              <h3 style={styles.cardTitle}>Operating Systems</h3>
            </div>
            <div style={styles.gridCardBody}>
              {renderDistributionBars(stats.os, '#6366f1')}
            </div>
          </div>
        </div>

        <div style={styles.distGridRow}>
          <div className="glass-card" style={styles.gridCard}>
            <div style={styles.cardHeader}>
              <Share2 size={18} style={{ color: '#f59e0b', marginRight: '8px' }} />
              <h3 style={styles.cardTitle}>Referral Sources</h3>
            </div>
            <div style={styles.gridCardBody}>
              {renderDistributionBars(stats.referrers, '#f59e0b')}
            </div>
          </div>

          <div className="glass-card" style={styles.gridCard}>
            <div style={styles.cardHeader}>
              <Shield size={18} style={{ color: '#10b981', marginRight: '8px' }} />
              <h3 style={styles.cardTitle}>Device Platforms</h3>
            </div>
            <div style={styles.gridCardBody}>
              {renderDistributionBars(stats.devices, '#10b981')}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto 50px auto',
    padding: '0 24px',
  },
  backBtn: {
    padding: '8px 16px',
    fontSize: '13px',
    borderRadius: '8px',
    marginBottom: '20px',
    alignSelf: 'flex-start',
  },
  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  heroLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  heroIconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'rgba(168, 85, 247, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: '24px',
    color: '#ffffff',
  },
  shortLinkWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '4px',
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
    display: 'inline-flex',
    alignItems: 'center',
  },
  heroRight: {
    display: 'flex',
  },
  shareBtn: {
    padding: '10px 18px',
    fontSize: '14px',
    borderRadius: '10px',
  },
  metaCard: {
    padding: '24px 30px',
    marginBottom: '30px',
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '16px',
  },
  metaLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  metaUrlLink: {
    color: '#e2e8f0',
    fontSize: '15px',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    wordBreak: 'break-all',
    transition: 'color 0.2s',
  },
  metaSubRow: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '20px',
  },
  metaSubItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  metaValue: {
    fontSize: '14px',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
  },
  clickHighlight: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#06b6d4',
    fontFamily: "'Outfit', sans-serif",
  },
  chartCard: {
    padding: '30px',
    marginBottom: '30px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '16px',
    color: '#ffffff',
  },
  chartBody: {
    width: '100%',
  },
  distGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  distGridRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    '@media (maxWidth: 800px)': {
      gridTemplateColumns: '1fr',
    }
  },
  gridCard: {
    padding: '24px 30px',
  },
  gridCardBody: {
    marginTop: '10px',
  },
  distContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  distRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  distTextRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
  },
  distName: {
    color: '#e2e8f0',
    fontWeight: '500',
  },
  distValue: {
    color: '#94a3b8',
  },
  barTrack: {
    width: '100%',
    height: '6px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '10px',
  },
  noDataText: {
    color: '#64748b',
    fontSize: '13px',
    textAlign: 'center',
    padding: '20px 0',
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
  }
};
export default AnalyticsPage;
