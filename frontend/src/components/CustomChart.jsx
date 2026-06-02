import React from 'react';

export const CustomChart = ({ data = [], height = 220 }) => {
  // If no data or all counts are zero, show an empty state visualizer
  const totalClicks = data.reduce((acc, curr) => acc + curr.count, 0);
  const isEmpty = data.length === 0 || totalClicks === 0;

  if (isEmpty) {
    return (
      <div style={styles.emptyContainer}>
        <span style={styles.emptyIcon}>📊</span>
        <h4 style={styles.emptyTitle}>Awaiting Clicks</h4>
        <p style={styles.emptyText}>No click activities logged for this period yet. Share your short link to populate these stats!</p>
      </div>
    );
  }

  // Set SVG layout coordinates
  const svgWidth = 500;
  const svgHeight = height;
  const paddingX = 40;
  const paddingY = 30;

  // Compute graph bounds
  const graphWidth = svgWidth - paddingX * 2;
  const graphHeight = svgHeight - paddingY * 2;

  // Max value calculation for Y axis scaling
  const maxVal = Math.max(...data.map(d => d.count), 5); // Fallback min scale height of 5
  
  // Map points to SVG coordinates
  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1)) * graphWidth;
    // Y-axis goes from top (0) to bottom (height)
    const y = paddingY + graphHeight - (d.count / maxVal) * graphHeight;
    return { x, y, label: d._id, count: d.count };
  });

  // Construct SVG paths
  // Line Path: M x1 y1 L x2 y2 ...
  let linePath = '';
  let areaPath = '';

  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      linePath += ` L ${points[i].x} ${points[i].y}`;
    }

    // Area Path: Close line at the bottom
    areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingY + graphHeight} L ${points[0].x} ${paddingY + graphHeight} Z`;
  }

  // Generate date formats: "Jun 01" from "2026-06-01"
  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIdx = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        return `${monthNames[monthIdx]} ${day}`;
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div style={styles.chartWrapper}>
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height="100%" style={styles.svg}>
        <defs>
          {/* Gradient definitions for neon glowing line */}
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(263, 90%, 55%)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="hsl(263, 90%, 55%)" stopOpacity="0.00" />
          </linearGradient>
          
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(263, 90%, 50%)" />
            <stop offset="50%" stopColor="hsl(326, 90%, 60%)" />
            <stop offset="100%" stopColor="hsl(190, 90%, 50%)" />
          </linearGradient>
        </defs>

        {/* Y-Axis Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = paddingY + graphHeight * ratio;
          const valLabel = Math.round(maxVal * (1 - ratio));
          return (
            <g key={idx} opacity="0.3">
              <line 
                x1={paddingX} 
                y1={y} 
                x2={svgWidth - paddingX} 
                y2={y} 
                stroke="#475569" 
                strokeWidth="0.8" 
                strokeDasharray="4 4"
              />
              <text 
                x={paddingX - 10} 
                y={y + 4} 
                fill="#94a3b8" 
                fontSize="10" 
                textAnchor="end" 
                fontFamily="'Outfit', sans-serif"
              >
                {valLabel}
              </text>
            </g>
          );
        })}

        {/* Click Trend Area */}
        {points.length > 0 && (
          <path d={areaPath} fill="url(#areaGradient)" />
        )}

        {/* Click Trend Line */}
        {points.length > 0 && (
          <path 
            d={linePath} 
            fill="none" 
            stroke="url(#lineGradient)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        )}

        {/* Data points (Circles with tooltips) */}
        {points.map((pt, idx) => (
          <g key={idx} className="chart-dot-group">
            {/* Outer halo */}
            <circle 
              cx={pt.x} 
              cy={pt.y} 
              r="7" 
              fill="rgba(99, 102, 241, 0.25)" 
              opacity="0"
              style={{ transition: 'opacity 0.2s', cursor: 'pointer' }}
              className="chart-halo"
            />
            {/* Core dot */}
            <circle 
              cx={pt.x} 
              cy={pt.y} 
              r="4" 
              fill="#ffffff" 
              stroke="hsl(263, 90%, 50%)" 
              strokeWidth="2" 
              style={{ cursor: 'pointer' }}
            />
            {/* Click Count tooltip pop */}
            <g style={{ pointerEvents: 'none' }}>
              <rect
                x={pt.x - 18}
                y={pt.y - 30}
                width="36"
                height="18"
                rx="4"
                fill="#0f172a"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
                opacity="0.85"
              />
              <text
                x={pt.x}
                y={pt.y - 18}
                fill="#ffffff"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="'Outfit', sans-serif"
              >
                {pt.count}
              </text>
            </g>

            {/* X-axis labels */}
            {idx % (points.length > 7 ? 2 : 1) === 0 && (
              <text 
                x={pt.x} 
                y={svgHeight - paddingY + 16} 
                fill="#94a3b8" 
                fontSize="10" 
                textAnchor="middle" 
                fontFamily="'Outfit', sans-serif"
              >
                {formatDateLabel(pt.label)}
              </text>
            )}
          </g>
        ))}
      </svg>

      <style dangerouslySetInnerHTML={{ __html: `
        .chart-dot-group:hover .chart-halo {
          opacity: 1 !important;
        }
      `}} />
    </div>
  );
};

const styles = {
  chartWrapper: {
    width: '100%',
    position: 'relative',
    background: 'rgba(0, 0, 0, 0.15)',
    borderRadius: '16px',
    padding: '16px 12px 6px 12px',
    border: '1px solid rgba(255, 255, 255, 0.03)',
  },
  svg: {
    display: 'block',
    overflow: 'visible',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '40px 20px',
    background: 'rgba(0, 0, 0, 0.15)',
    borderRadius: '16px',
    border: '1px dashed rgba(255,255,255,0.08)',
  },
  emptyIcon: {
    fontSize: '36px',
    marginBottom: '10px',
    filter: 'grayscale(0.3)',
  },
  emptyTitle: {
    fontSize: '16px',
    color: '#ffffff',
    marginBottom: '6px',
  },
  emptyText: {
    fontSize: '13px',
    color: '#94a3b8',
    maxWidth: '300px',
    lineHeight: '1.4',
  }
};
export default CustomChart;
