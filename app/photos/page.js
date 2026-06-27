'use client'

import { useState } from 'react'
import Link from 'next/link'

const photoItems = [
  { label: 'Portrait Session',   sub: 'Portrait · 2024',     height: 'ph-tall'  },
  { label: 'Editorial Spread',   sub: 'Editorial · 2024',    height: 'ph-mid'   },
  { label: 'Landscape Series',   sub: 'Landscape · 2024',    height: 'ph-tall'  },
  { label: 'Commercial Product', sub: 'Commercial · 2024',   height: 'ph-wide'  },
  { label: 'Wedding Editorial',  sub: 'Wedding · 2023',      height: 'ph-short' },
  { label: 'Architecture Study', sub: 'Architecture · 2023', height: 'ph-mid'   },
  { label: 'Concert Coverage',   sub: 'Concert · 2023',      height: 'ph-tall'  },
  { label: 'Fashion Shoot',      sub: 'Fashion · 2023',      height: 'ph-wide'  },
  { label: 'Street Series',      sub: 'Street · 2023',       height: 'ph-short' },
]

const PlaceholderIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)

export default function Photos() {
  const [lightboxSrc, setLightboxSrc] = useState(null)

  return (
    <>
      <Link href="/" className="back-btn visible">
        <span className="back-arrow">←</span> Back
      </Link>

      <div className="page active">
        <div className="subpage">
          <div className="sp-header">
            <h1 className="sp-title">Photos</h1>
          </div>
          <div id="photos-inner">
            <div className="masonry">
              {photoItems.map((item, i) => (
                <div key={i} className="masonry-item" onClick={() => setLightboxSrc(null)}>
                  <div className={`media-placeholder ${item.height}`}>
                    <PlaceholderIcon />
                    <span>{item.sub}</span>
                  </div>
                  <div className="item-overlay">
                    <div className="item-meta">
                      <p className="item-label">{item.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {lightboxSrc && (
        <div className="lightbox open" onClick={(e) => { if (e.target === e.currentTarget) setLightboxSrc(null) }}>
          <div className="lightbox-inner">
            <button className="lightbox-close" onClick={() => setLightboxSrc(null)}>✕</button>
            <img src={lightboxSrc} alt="" />
          </div>
        </div>
      )}
    </>
  )
}
