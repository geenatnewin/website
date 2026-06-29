'use client'

import { useState } from 'react'
import Link from 'next/link'

const R2 = 'https://pub-095a05fb51af4a3b83d5e05b40b59ff4.r2.dev'

const eventVideos = [
  { src: `${R2}/bushbabyyy13.mp4`,       title: 'Bush Baby' },
  { src: `${R2}/bushbabyyy25.mp4`,       title: 'Bush Baby II' },
  { src: `${R2}/horizontal00185628.mp4`, title: 'Horizontal' },
]

const musicVideos = []

const PlayIcon = () => (
  <svg viewBox="0 0 12 12"><polygon points="2,1 11,6 2,11" fill="white"/></svg>
)

function VideoSection({ title, videos }) {
  const [lightbox, setLightbox] = useState(null)

  if (videos.length === 0) return (
    <div className="video-section">
      <h2 className="section-title">{title}</h2>
      <p className="section-empty">Coming soon</p>
    </div>
  )

  return (
    <div className="video-section">
      <h2 className="section-title">{title}</h2>
      <div className="video-grid">
        {videos.map((v, i) => (
          <div key={i} className="video-card" onClick={() => setLightbox(v.src)}>
            <div className="video-card-thumb">
              <video src={v.src} preload="metadata" muted playsInline />
              <div className="play-icon"><PlayIcon /></div>
            </div>
            <div className="video-card-info">
              <p className="video-card-title">{v.title}</p>
              <p className="video-card-sub">{title}</p>
            </div>
          </div>
        ))}
      </div>

      {lightbox && (
        <div className="lightbox open" onClick={(e) => { if (e.target === e.currentTarget) setLightbox(null) }}>
          <div className="lightbox-inner" style={{ maxWidth: '960px' }}>
            <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
            <video src={lightbox} controls autoPlay playsInline style={{ width: '100%', maxHeight: '85vh' }} />
          </div>
        </div>
      )}
    </div>
  )
}

export default function Videos() {
  return (
    <>
      <Link href="/" className="back-btn visible">
        <span className="back-arrow">←</span> Back
      </Link>

      <div className="page active">
        <div className="subpage">
          <div className="sp-header">
            <h1 className="sp-title">Videos</h1>
          </div>
          <div id="videos-inner">
            <VideoSection title="Event" videos={eventVideos} />
            <VideoSection title="Music" videos={musicVideos} />
          </div>
        </div>
      </div>
    </>
  )
}
