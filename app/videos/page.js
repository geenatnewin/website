'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import PageFade from '../components/PageFade'

const R2 = 'https://pub-095a05fb51af4a3b83d5e05b40b59ff4.r2.dev'

const eventVideos = [
  { src: `${R2}/bushbabyyy13.mp4`,       title: 'Bush Baby B2B Sidney Charles'    },
  { src: `${R2}/bushbabyyy25.mp4`,       title: 'Bush Baby B2B Sidney Charles II' },
  { src: `${R2}/horizontal00185628.mp4`, title: 'Cloone' },
  { src: `${R2}/30k.mp4`,               title: 'PALACIO'      },
  { src: `${R2}/cover9.mp4`,            title: 'PALACIO II'   },
  { src: `${R2}/akilla.mp4`,            title: 'AKILLA'       },
  { src: `${R2}/akilla2.mp4`,           title: 'AKILLA II'    },
]

const musicVideos = []

const PlayIcon = () => (
  <svg viewBox="0 0 12 12"><polygon points="2,1 11,6 2,11" fill="white"/></svg>
)

function VideoThumb({ src }) {
  const ref = useRef(null)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const onMeta = () => { v.currentTime = 1 }
    v.addEventListener('loadedmetadata', onMeta)
    return () => v.removeEventListener('loadedmetadata', onMeta)
  }, [])

  return (
    <video
      ref={ref}
      src={src}
      preload="metadata"
      muted
      playsInline
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
    />
  )
}

function VideoSection({ title, videos, onPlay }) {
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
          <div
            key={i}
            className="video-card"
            onClick={() => onPlay(v.src)}
          >
            <div className="video-card-thumb">
              <VideoThumb src={v.src} />
              <div className="play-icon"><PlayIcon /></div>
            </div>
            <div className="video-card-info">
              <p className="video-card-title">{v.title}</p>
              <p className="video-card-sub">{title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Videos() {
  const [lightbox, setLightbox] = useState(null)

  return (
    <>
      <PageFade>
        <div className="back-bar">
          <Link href="/" className="back-btn visible">
            <span className="back-arrow">←</span> Back
          </Link>
        </div>
        <div className="subpage">
          <div className="sp-header">
            <h1 className="sp-title">Videos</h1>
          </div>
          <div id="videos-inner">
            <VideoSection title="Music" videos={eventVideos} onPlay={setLightbox} />
          </div>
        </div>
      </PageFade>

      {lightbox && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setLightbox(null) }}
        >
          <div style={{ position: 'relative', width: '100%', maxWidth: '960px' }}>
            <button
              onClick={() => setLightbox(null)}
              style={{
                position: 'absolute', top: '-2.5rem', right: 0,
                background: 'none', border: 'none', color: 'white',
                fontSize: '1.25rem', cursor: 'pointer', opacity: 0.6,
              }}
            >✕</button>
            <video
              key={lightbox}
              src={lightbox}
              controls
              autoPlay
              playsInline
              style={{ width: '100%', maxHeight: '80vh', display: 'block', background: '#000' }}
            />
          </div>
        </div>
      )}
    </>
  )
}
