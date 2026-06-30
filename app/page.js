'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export default function Home() {
  const videoRef = useRef(null)
  const posterRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    const poster = posterRef.current
    if (!video) return
    video.muted = true
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')

    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    if (!isMobile) {
      if (poster) poster.style.display = 'none'
      video.play().catch(() => {})
      return
    }

    const onTouch = () => {
      video.play().catch(() => {})
      if (poster) {
        poster.style.opacity = '0'
        poster.addEventListener('transitionend', () => { poster.style.display = 'none' }, { once: true })
      }
    }

    document.addEventListener('touchstart', onTouch, { once: true })
    return () => document.removeEventListener('touchstart', onTouch)
  }, [])

  return (
    <div className="page active" id="home">
      <div className="bg-media">
        <video ref={videoRef} muted loop playsInline preload="auto" autoPlay>
          <source src="https://pub-095a05fb51af4a3b83d5e05b40b59ff4.r2.dev/vcftest.mp4" type="video/mp4" />
        </video>
        <img
          ref={posterRef}
          src="/poster.jpg"
          alt=""
          className="video-poster"
          aria-hidden="true"
        />
        <div className="video-block-overlay" />
      </div>
      <div className="home-logo">Navin Nguyen</div>
      <nav className="home-nav">
        <Link className="home-nav-item nav-large" href="/photos">Photos</Link>
        <Link className="home-nav-item nav-large" href="/videos">Videos</Link>
        <a className="home-nav-item" href="https://www.instagram.com/ng.navin/" target="_blank" rel="noopener noreferrer">Instagram</a>
        <Link className="home-nav-item" href="/contact">Contact</Link>
      </nav>
    </div>
  )
}
