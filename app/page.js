'use client'

import { useState, useEffect } from 'react'

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

const videoItems = [
  { title: 'Brand Film',            sub: 'Commercial · 2024' },
  { title: 'Event Highlight Reel',  sub: 'Events · 2024'     },
  { title: 'Short Film',            sub: 'Narrative · 2023'  },
  { title: 'Music Video',           sub: 'Artist · 2023'     },
  { title: 'Documentary',           sub: 'Editorial · 2023'  },
  { title: 'Social Reel',           sub: 'Content · 2023'    },
]

const PlaceholderIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)

const PlayIcon = () => (
  <svg viewBox="0 0 12 12"><polygon points="2,1 11,6 2,11" fill="white"/></svg>
)

export default function Portfolio() {
  const [current, setCurrent] = useState('home')
  const [lightboxSrc, setLightboxSrc] = useState(null)
  const [submitState, setSubmitState] = useState('idle')
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') setLightboxSrc(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  function goTo(id) {
    setCurrent(id)
    const sp = document.querySelector(`#${id} .subpage`)
    if (sp) sp.scrollTop = 0
  }

  function openLightbox(src) {
    if (src) setLightboxSrc(src)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitState('sending')
    try {
      const res = await fetch('https://formspree.io/f/xzdlroyr', {
        method: 'POST',
        body: new FormData(e.target),
        headers: { Accept: 'application/json' },
      })
      if (res.ok) {
        setSubmitState('success')
        e.target.reset()
        setTimeout(() => setSubmitState('idle'), 4000)
      } else {
        setSubmitState('error')
      }
    } catch {
      setSubmitState('error')
    }
  }

  return (
    <>
      {/* Back button */}
      <button
        className={`back-btn${current !== 'home' ? ' visible' : ''}`}
        onClick={() => goTo('home')}
      >
        <span className="back-arrow">←</span> Back
      </button>

      {/* ── HOME ── */}
      <div className={`page${current === 'home' ? ' active' : ''}`} id="home">
        <div className="bg-media">
          <video autoPlay muted loop playsInline>
            <source src="https://pub-095a05fb51af4a3b83d5e05b40b59ff4.r2.dev/date2.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="home-logo">Navin Nguyen</div>
        <nav className="home-nav">
          <span className="home-nav-item nav-large" onClick={() => goTo('photos')}>Photos</span>
          <span className="home-nav-item nav-large" onClick={() => goTo('videos')}>Videos</span>
          <a className="home-nav-item" href="https://www.instagram.com/ng.navin/" target="_blank" rel="noopener noreferrer">Instagram</a>
          <span className="home-nav-item" onClick={() => goTo('contact')}>Contact</span>
        </nav>
      </div>

      {/* ── PHOTOS ── */}
      <div className={`page${current === 'photos' ? ' active' : ''}`} id="photos">
        <div className="subpage">
          <div className="sp-header">
            <h1 className="sp-title">Photos</h1>
          </div>
          <div id="photos-inner">
            <div className="masonry" id="photo-grid">
              {photoItems.map((item, i) => (
                <div
                  key={i}
                  className="masonry-item"
                  onClick={() => openLightbox(null)}
                >
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

      {/* ── VIDEOS ── */}
      <div className={`page${current === 'videos' ? ' active' : ''}`} id="videos">
        <div className="subpage">
          <div className="sp-header">
            <h1 className="sp-title">Videos</h1>
          </div>
          <div id="videos-inner">
            <div className="video-grid">
              {videoItems.map((item, i) => (
                <div key={i} className="video-card">
                  <div className="video-card-thumb">
                    <div className="vph" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
                    <div className="play-icon">
                      <PlayIcon />
                    </div>
                  </div>
                  <div className="video-card-info">
                    <p className="video-card-title">{item.title}</p>
                    <p className="video-card-sub">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTACT ── */}
      <div className={`page${current === 'contact' ? ' active' : ''}`} id="contact">
        <div className="subpage">
          <div className="sp-header">
            <h1 className="sp-title">Contact</h1>
          </div>
          <div id="contact-inner">
            <div className="contact-info-block">
              <div className="contact-row">
                <span className="contact-label">Email</span>
                <a href="mailto:inavinnguyen@gmail.com" className="contact-value">
                  inavinnguyen@gmail.com
                </a>
              </div>
              <div className="contact-row">
                <span className="contact-label">Instagram</span>
                <a
                  href="https://www.instagram.com/ng.navin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-value"
                >
                  ng.navin
                </a>
              </div>
            </div>
            <div className="contact-divider" />
            <p className="contact-form-title">Get in touch</p>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-field">
                <label className="form-label" htmlFor="c-name">Name</label>
                <input
                  className="form-input"
                  type="text"
                  id="c-name"
                  name="name"
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="c-email">Email</label>
                <input
                  className="form-input"
                  type="email"
                  id="c-email"
                  name="email"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="c-msg">Message</label>
                <textarea
                  className="form-textarea"
                  id="c-msg"
                  name="message"
                  placeholder="Tell me about your project…"
                  required
                />
              </div>
              <button
                className="form-submit"
                type="submit"
                disabled={submitState === 'sending'}
              >
                {submitState === 'sending' ? 'Sending…' : 'Send'}
              </button>
              {submitState === 'success' && (
                <p className="form-success">Message sent — I&apos;ll be in touch soon.</p>
              )}
              {submitState === 'error' && (
                <p className="form-error">Something went wrong. Please try again.</p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* ── LIGHTBOX ── */}
      {lightboxSrc && (
        <div
          className="lightbox open"
          onClick={(e) => { if (e.target === e.currentTarget) setLightboxSrc(null) }}
        >
          <div className="lightbox-inner">
            <button className="lightbox-close" onClick={() => setLightboxSrc(null)}>✕</button>
            <img src={lightboxSrc} alt="" />
          </div>
        </div>
      )}
    </>
  )
}
