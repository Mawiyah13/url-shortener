import React, { useState, useEffect } from 'react';
import { urlService } from '../services/urlService';
import { useAuth } from '../context/AuthContext';
import { QrCodeModal } from '../components/QrCodeModal';
import {
  Plus, Search, Copy, Check, BarChart2, QrCode, Trash2, Edit2,
  Calendar, Link2, ExternalLink, RefreshCw, AlertCircle, X, HelpCircle
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();

  const [urls, setUrls] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [activeQrUrl, setActiveQrUrl] = useState('');
  const [activeQrTitle, setActiveQrTitle] = useState('');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUrl, setEditingUrl] = useState(null);
  const [editOriginalUrl, setEditOriginalUrl] = useState('');
  const [editCustomAlias, setEditCustomAlias] = useState('');
  const [editExpiresAt, setEditExpiresAt] = useState('');
  const [editError, setEditError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [copiedStates, setCopiedStates] = useState({});

  useEffect(() => {
    fetchUrls();
  }, [search]);

  const fetchUrls = async () => {
    try {
      setIsLoading(true);
      const data = await urlService.getAll(search);
      setUrls(data);
    } catch (err) {
      console.error('Error fetching URLs:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!originalUrl) {
      setFormError('Original URL is required');
      return;
    }

    setIsCreating(true);
    try {
      const newUrl = await urlService.create(
        originalUrl,
        customAlias ? customAlias.trim() : null,
        expiresAt ? new Date(expiresAt).toISOString() : null
      );

      setFormSuccess(`Link successfully shortened! Short code: ${newUrl.shortCode}`);
      setOriginalUrl('');
      setCustomAlias('');
      setExpiresAt('');

      fetchUrls();

      setTimeout(() => setFormSuccess(''), 5000);
    } catch (err) {
      setFormError(err.message || 'Failed to shorten URL');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (window.confirm(`Are you sure you want to permanently delete the short link "/r/${code}" and all associated click statistics?`)) {
      try {
        await urlService.delete(id);
        setUrls(prev => prev.filter(u => u._id !== id));
      } catch (err) {
        alert(err.message || 'Failed to delete URL');
      }
    }
  };

  const handleCopy = (id, shortCode) => {
    const fullShortUrl = `${import.meta.env.VITE_REDIRECT_BASE}/${shortCode}`;
    navigator.clipboard.writeText(fullShortUrl);
    setCopiedStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const handleOpenQr = (shortCode, title) => {
    const fullShortUrl = `${import.meta.env.VITE_REDIRECT_BASE}/${shortCode}`;
    setActiveQrUrl(fullShortUrl);
    setActiveQrTitle(shortCode);
    setQrModalOpen(true);
  };

  const handleOpenEdit = (urlItem) => {
    setEditingUrl(urlItem);
    setEditOriginalUrl(urlItem.originalUrl);
    setEditCustomAlias(urlItem.customAlias || '');
    setEditExpiresAt(urlItem.expiresAt ? new Date(urlItem.expiresAt).toISOString().split('T')[0] : '');
    setEditError('');
    setEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setEditError('');
    setIsUpdating(true);

    try {
      const updateFields = {
        originalUrl: editOriginalUrl,
        customAlias: editCustomAlias.trim() ? editCustomAlias.trim() : null,
        expiresAt: editExpiresAt ? new Date(editExpiresAt).toISOString() : null
      };

      await urlService.update(editingUrl._id, updateFields);
      setEditModalOpen(false);
      fetchUrls();
    } catch (err) {
      setEditError(err.message || 'Failed to update URL');
    } finally {
      setIsUpdating(false);
    }
  };

  const totalClicks = urls.reduce((acc, curr) => acc + curr.clicks, 0);
  const totalLinks = urls.length;

  const activeLinks = urls.filter(u => {
    if (!u.expiresAt) return true;
    return new Date(u.expiresAt) > new Date();
  }).length;

  const expiredLinks = totalLinks - activeLinks;

  return (
    <div style={styles.container} className="animate-fade-in">
      <header style={styles.header}>
        <h1 style={styles.title}>Shorten, Share & Track</h1>
        <p style={styles.subtitle}>Create elegant short links, generate instant scan QR codes, and monitor real-time analytical click metrics.</p>
      </header>

      <section style={styles.statsGrid} className="grid-cols-3">
        <div className="glass-card" style={styles.statCard}>
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>Total Links</span>
            <span style={styles.statValue}>{totalLinks}</span>
          </div>
          <div style={{ ...styles.statIconWrapper, background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
            <Link2 size={24} />
          </div>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>Total Click Volume</span>
            <span style={styles.statValue}>{totalClicks}</span>
          </div>
          <div style={{ ...styles.statIconWrapper, background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
            <BarChart2 size={24} />
          </div>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>Link Expirations</span>
            <span style={styles.statValue}>
              <span style={{ color: '#10b981' }}>{activeLinks}</span>
              <span style={{ color: '#94a3b8', fontSize: '14px', margin: '0 4px' }}>/</span>
              <span style={{ color: '#ef4444' }}>{expiredLinks}</span>
            </span>
          </div>
          <div style={{ ...styles.statIconWrapper, background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
            <Calendar size={24} />
          </div>
        </div>
      </section>

      <section className="glass-card animate-slide-up" style={styles.creatorCard}>
        <h3 style={styles.cardTitle}>Create New Short Link</h3>

        {formError && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{formError}</span>
          </div>
        )}

        {formSuccess && (
          <div className="alert alert-success">
            <Check size={18} />
            <span>{formSuccess}</span>
          </div>
        )}

        <form onSubmit={handleCreate} style={styles.creatorForm}>
          <div style={styles.formGrid}>
            <div className="form-group" style={{ flex: '2 1 300px' }}>
              <label className="form-label">Destination URL</label>
              <div style={styles.inputWrapper}>
                <Link2 size={16} style={styles.inputIcon} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://your-super-long-destination-url.com/path"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  style={styles.inputPadding}
                />
              </div>
            </div>

            <div className="form-group" style={{ flex: '1 1 150px' }}>
              <label className="form-label" style={styles.labelWithHelp}>
                Custom Alias
                <span style={styles.helpText} title="Custom short code suffix. Optional.">(Optional)</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. promo2026"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ flex: '1 1 150px' }}>
              <label className="form-label" style={styles.labelWithHelp}>
                Expiry Date
                <span style={styles.helpText} title="When the link stops working. Optional.">(Optional)</span>
              </label>
              <input
                type="date"
                className="form-control"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Min is tomorrow
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={styles.createBtn} disabled={isCreating}>
            {isCreating ? (
              <div className="spinner" style={{ width: '18px', height: '18px' }}></div>
            ) : (
              <>
                <Plus size={18} />
                <span>Shorten URL</span>
              </>
            )}
          </button>
        </form>
      </section>

      <section className="glass-card animate-slide-up" style={styles.listingSection}>
        <div style={styles.listingHeader}>
          <h3 style={styles.cardTitle}>My Active Short Links</h3>
          <div style={styles.searchWrapper}>
            <Search size={16} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search links..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
            {search && (
              <button style={styles.clearSearchBtn} onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div style={styles.loadingContainer}>
            <div className="spinner"></div>
            <span style={{ color: '#94a3b8', fontSize: '14px', marginTop: '10px' }}>Loading short links...</span>
          </div>
        ) : urls.length === 0 ? (
          <div style={styles.emptyContainer}>
            <span style={{ fontSize: '32px' }}>🔗</span>
            <h4>No Short Links Found</h4>
            <p>You haven't generated any short codes matching your search filter yet. Enter a long URL above to get started!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Short Code</th>
                  <th>Destination URL</th>
                  <th>Clicks</th>
                  <th>Expiration</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((item) => {
                  const fullShortUrl = `${import.meta.env.VITE_REDIRECT_BASE}/${item.shortCode}`;
                  const isExpired = item.expiresAt && new Date(item.expiresAt) <= new Date();

                  return (
                    <tr key={item._id}>
                      <td style={styles.codeCell}>
                        <div style={styles.codeFlex}>
                          <span style={styles.codeText}>/{item.shortCode}</span>
                          <button onClick={() => handleCopy(item._id, item.shortCode)} style={styles.actionBtnIcon} title="Copy Link">
                            {copiedStates[item._id] ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                          </button>
                          <a href={fullShortUrl} target="_blank" rel="noopener noreferrer" style={styles.actionBtnIcon} title="Visit Redirect">
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </td>
                      <td style={styles.destCell} title={item.originalUrl}>
                        <span style={styles.urlTruncate}>{item.originalUrl}</span>
                      </td>
                      <td>
                        <span style={styles.clicksBadge}>{item.clicks} clicks</span>
                      </td>
                      <td>
                        {item.expiresAt ? (
                          isExpired ? (
                            <span className="badge-status error">Expired</span>
                          ) : (
                            <span className="badge-status success">
                              {new Date(item.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          )
                        ) : (
                          <span style={{ color: '#64748b', fontSize: '13px' }}>Permanent</span>
                        )}
                      </td>
                      <td style={styles.actionsCell}>
                        <div style={styles.btnGroup}>
                          <a href={`/analytics/${item._id}`} style={styles.actionBtn} className="btn-secondary" title="View Detailed Analytics">
                            <BarChart2 size={14} />
                            <span>Stats</span>
                          </a>

                          <button onClick={() => handleOpenQr(item.shortCode, item.shortCode)} style={styles.actionBtn} className="btn-secondary" title="QR Code">
                            <QrCode size={14} />
                          </button>

                          <button onClick={() => handleOpenEdit(item)} style={styles.actionBtn} className="btn-secondary" title="Edit Settings">
                            <Edit2 size={14} />
                          </button>

                          <button onClick={() => handleDelete(item._id, item.shortCode)} style={styles.actionBtnDanger} className="btn-danger" title="Delete Permanent">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <QrCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        shortUrl={activeQrUrl}
        title={activeQrTitle}
      />

      {editModalOpen && (
        <div style={styles.modalOverlay} className="animate-fade-in" onClick={() => setEditModalOpen(false)}>
          <div style={styles.editModal} className="glass-card animate-slide-up" onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Edit Short Link Settings</h3>
              <button style={styles.modalCloseBtn} onClick={() => setEditModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {editError && (
              <div className="alert alert-error" style={{ margin: '0 0 20px 0' }}>
                <AlertCircle size={18} />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label className="form-label">Destination URL</label>
                <input
                  type="text"
                  className="form-control"
                  value={editOriginalUrl}
                  onChange={(e) => setEditOriginalUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Custom Alias (short suffix)</label>
                <input
                  type="text"
                  className="form-control"
                  value={editCustomAlias}
                  onChange={(e) => setEditCustomAlias(e.target.value)}
                  placeholder="e.g. promo2026"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '25px' }}>
                <label className="form-label">Expiry Date (Leave empty for permanent)</label>
                <input
                  type="date"
                  className="form-control"
                  value={editExpiresAt}
                  onChange={(e) => setEditExpiresAt(e.target.value)}
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                />
              </div>

              <div style={styles.modalFooter}>
                <button type="button" className="btn-secondary" onClick={() => setEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isUpdating}>
                  {isUpdating ? <div className="spinner" style={{ width: '16px', height: '16px' }}></div> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto 50px auto',
    padding: '0 24px',
  },
  header: {
    marginBottom: '35px',
    textAlign: 'center',
  },
  title: {
    fontSize: '36px',
    color: '#ffffff',
    marginBottom: '10px',
    letterSpacing: '-1px',
    background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '16px',
    color: '#94a3b8',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6',
  },
  statsGrid: {
    marginBottom: '35px',
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
    fontSize: '14px',
    color: '#94a3b8',
    fontWeight: '500',
    fontFamily: "'Outfit', sans-serif",
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: "'Outfit', sans-serif",
  },
  statIconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorCard: {
    padding: '30px',
    marginBottom: '35px',
  },
  cardTitle: {
    fontSize: '18px',
    color: '#ffffff',
    marginBottom: '20px',
  },
  creatorForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: '#64748b',
  },
  inputPadding: {
    paddingLeft: '40px',
  },
  labelWithHelp: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helpText: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: 'normal',
  },
  createBtn: {
    alignSelf: 'flex-start',
    padding: '12px 30px',
  },
  listingSection: {
    padding: '30px 0',
  },
  listingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 30px 20px 30px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    flexWrap: 'wrap',
    gap: '16px',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    maxWidth: '300px',
    width: '100%',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: '#64748b',
  },
  searchInput: {
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '10px',
    padding: '10px 36px 10px 36px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    transition: 'all 0.2s',
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 0',
  },
  emptyContainer: {
    textAlign: 'center',
    padding: '80px 30px',
    color: '#94a3b8',
  },
  codeCell: {
    width: '240px',
    fontWeight: '600',
  },
  codeFlex: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  codeText: {
    fontFamily: "'Outfit', sans-serif",
    color: '#a855f7',
    fontSize: '15px',
  },
  actionBtnIcon: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    transition: 'all 0.2s',
  },
  destCell: {
    maxWidth: '300px',
  },
  urlTruncate: {
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: '#e2e8f0',
    fontSize: '13px',
  },
  clicksBadge: {
    background: 'rgba(6, 182, 212, 0.08)',
    border: '1px solid rgba(6, 182, 212, 0.2)',
    color: '#22d3ee',
    padding: '4px 10px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '12px',
    fontFamily: "'Outfit', sans-serif",
  },
  actionsCell: {
    textAlign: 'right',
  },
  btnGroup: {
    display: 'flex',
    gap: '6px',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    padding: '6px 12px',
    fontSize: '12px',
    borderRadius: '6px',
    height: 'auto',
    color: '#94a3b8'
  },

  actionBtnDanger: {
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(12, 15, 23, 0.8)',
    backdropFilter: 'blur(8px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  editModal: {
    maxWidth: '500px',
    width: '100%',
    padding: '30px',
    borderRadius: '24px',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '12px',
  },
  modalTitle: {
    fontSize: '20px',
    color: '#ffffff',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
  },
  modalFooter: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  }
};
export default Dashboard;
