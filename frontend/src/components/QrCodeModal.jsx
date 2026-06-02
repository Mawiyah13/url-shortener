import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export const QrCodeModal = ({ isOpen, onClose, shortUrl, title }) => {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current && shortUrl) {
      QRCode.toCanvas(
        canvasRef.current,
        shortUrl,
        {
          width: 256,
          margin: 2,
          color: {
            dark: '#1e1b4b',   // Deep indigo contrast color
            light: '#ffffff'   // Crisp white
          }
        },
        (error) => {
          if (error) console.error('QR Code Generation Error:', error);
        }
      );
    }
  }, [isOpen, shortUrl]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `qrcode_${title || 'short_link'}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} className="animate-fade-in" onClick={onClose}>
      <div style={styles.modal} className="glass-card animate-slide-up" onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.headerTitle}>QR Code Generator</h3>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div style={styles.body}>
          <p style={styles.description}>Scan this QR code with any mobile device to immediately visit the redirected destination link.</p>
          
          <div style={styles.qrContainer}>
            <canvas ref={canvasRef} style={styles.canvas}></canvas>
          </div>

          <div style={styles.linkDisplay}>
            <span style={styles.linkText}>{shortUrl}</span>
            <button onClick={handleCopyLink} style={styles.actionIconBtn} title="Copy Short Link">
              {copied ? <Check size={16} style={{ color: '#10b981' }} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} className="btn-secondary" style={styles.btn}>Cancel</button>
          <button onClick={handleDownload} className="btn-primary" style={styles.btn}>
            <Download size={16} />
            <span>Download PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
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
  modal: {
    maxWidth: '440px',
    width: '100%',
    padding: '30px',
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '12px',
  },
  headerTitle: {
    fontSize: '20px',
    color: '#ffffff',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '16px',
  },
  description: {
    fontSize: '14px',
    color: '#94a3b8',
    lineHeight: '1.5',
  },
  qrContainer: {
    background: '#ffffff',
    padding: '16px',
    borderRadius: '16px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
    display: 'inline-block',
  },
  canvas: {
    display: 'block',
    borderRadius: '8px',
  },
  linkDisplay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    background: 'rgba(0, 0, 0, 0.2)',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  linkText: {
    fontSize: '13px',
    fontFamily: 'monospace',
    color: '#67e8f9',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginRight: '8px',
  },
  actionIconBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  },
  footer: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
    justifyContent: 'flex-end',
  },
  btn: {
    padding: '10px 18px',
    fontSize: '14px',
  }
};
export default QrCodeModal;
