'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'

const lifePhotos = [
  '4I0A2752.jpg','4I0A2762.jpg','4I0A2920.jpg','DSC05766.jpg',
  'DSC05777.jpg','IMG_0007.jpg','IMG_0095.jpg','IMG_0099.jpg',
]

const musicPhotos = [
  '4I0A3050.jpg','4I0A3078.jpg','4I0A3269.jpg',
  '4I0A4054.jpg','4I0A4131.jpg','4I0A4187.jpg','4I0A4243.jpg',
  '4I0A4269.jpg','4I0A4270.jpg','4I0A4620.jpg','4I0A4775-2.jpg',
  '4I0A4881.jpg','4I0A5352.jpg','4I0A5356.jpg','4I0A5385.jpg',
  '4I0A5412.jpg','4I0A5420.jpg','4I0A5498.jpg','4I0A5538.jpg',
  '4I0A5596.jpg','4I0A5605.jpg','4I0A5842.jpg',
  '4I0A5870.jpg','4I0A5904.jpg','4I0A5972.jpg','4I0A6048.jpg',
  '4I0A6117.jpg','4I0A6119.jpg','4I0A6124.jpg','DSC06058.jpg',
  'IMG_3276.jpg','IMG_3288.jpg','IMG_3340.jpg',
]

function Carousel({ title, folder, files, active, onActivate, onOpenLightbox }) {
  const trackRef = useRef(null)
  const [index, setIndex] = useState(0)

  const goTo = useCallback((next) => {
    const clamped = Math.max(0, Math.min(next, files.length - 1))
    setIndex(clamped)
    const track = trackRef.current
    if (!track) return
    const items = track.querySelectorAll('.carousel-item')
    if (items[clamped]) {
      items[clamped].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
    }
  }, [files.length])

  useEffect(() => {
    if (!active) return
    const onKey = (e) => {
      if (e.key === 'ArrowRight') goTo(index + 1)
      if (e.key === 'ArrowLeft')  goTo(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, index, goTo])

  const images = files.map(f => `/media/pics/${folder}/${f}`)

  return (
    <div className="carousel-section" onClick={onActivate}>
      <h2 className={`section-title${active ? ' section-title-active' : ''}`}>{title}</h2>
      <div className="carousel-wrap">
        <button
          className="carousel-arrow carousel-arrow-left"
          onClick={(e) => { e.stopPropagation(); onActivate(); goTo(index - 1) }}
          aria-label="Previous"
        >&#8592;</button>

        <div className="carousel-track" ref={trackRef}>
          {files.map((file, i) => (
            <div
              key={i}
              className={`carousel-item${i === index ? ' carousel-item-active' : ''}`}
              onClick={(e) => { e.stopPropagation(); onActivate(); goTo(i); onOpenLightbox(i, images) }}
            >
              <img src={images[i]} alt="" loading="lazy" />
            </div>
          ))}
        </div>

        <button
          className="carousel-arrow carousel-arrow-right"
          onClick={(e) => { e.stopPropagation(); onActivate(); goTo(index + 1) }}
          aria-label="Next"
        >&#8594;</button>
      </div>
      <div className="carousel-counter">{index + 1} / {files.length}</div>
    </div>
  )
}

export default function Photos() {
  const [lightbox, setLightbox] = useState(null)
  const [activeSection, setActiveSection] = useState('life')
  const touchStartX = useRef(null)

  const lightboxPrev = useCallback(() => {
    setLightbox(l => l && l.index > 0 ? { ...l, index: l.index - 1 } : l)
  }, [])

  const lightboxNext = useCallback(() => {
    setLightbox(l => l && l.index < l.images.length - 1 ? { ...l, index: l.index + 1 } : l)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      setLightbox(l => {
        if (!l) return l
        if (e.key === 'Escape') return null
        if (e.key === 'ArrowRight') return l.index < l.images.length - 1 ? { ...l, index: l.index + 1 } : l
        if (e.key === 'ArrowLeft') return l.index > 0 ? { ...l, index: l.index - 1 } : l
        return l
      })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <div className="page active">
        <div className="back-bar">
          <Link href="/" className="back-btn visible">
            <span className="back-arrow">←</span> Back
          </Link>
        </div>
        <div className="subpage">
          <div className="sp-header">
            <h1 className="sp-title">Photos</h1>
          </div>
          <div id="photos-inner">
            <Carousel
              title="Event"
              folder="MUSIC"
              files={musicPhotos}
              active={activeSection === 'music'}
              onActivate={() => setActiveSection('music')}
              onOpenLightbox={(i, images) => setLightbox({ images, index: i })}
            />
            <Carousel
              title="Life"
              folder="LIFE"
              files={lifePhotos}
              active={activeSection === 'life'}
              onActivate={() => setActiveSection('life')}
              onOpenLightbox={(i, images) => setLightbox({ images, index: i })}
            />
          </div>
        </div>
      </div>

      {lightbox && (
        <div
          className="lightbox open"
          onClick={(e) => { if (e.target === e.currentTarget) setLightbox(null) }}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
          onTouchEnd={(e) => {
            const diff = touchStartX.current - e.changedTouches[0].clientX
            if (Math.abs(diff) > 50) { diff > 0 ? lightboxNext() : lightboxPrev() }
            touchStartX.current = null
          }}
        >
          <div className="lightbox-inner">
            {lightbox.index > 0 && (
              <button className="lightbox-prev" onClick={lightboxPrev}>&#8249;</button>
            )}
            {lightbox.index < lightbox.images.length - 1 && (
              <button className="lightbox-next" onClick={lightboxNext}>&#8250;</button>
            )}
            <img src={lightbox.images[lightbox.index]} alt="" />
          </div>
        </div>
      )}
    </>
  )
}
