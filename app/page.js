'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export default function Home() {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')

    video.play().catch(() => {
      video.addEventListener('loadeddata', () => {
        video.currentTime = 0.001
      }, { once: true })
    })
  }, [])

  return (
    <div className="page active" id="home">
      <div className="bg-media">
        <video ref={videoRef} muted loop playsInline preload="auto" autoPlay>
          <source src="https://pub-095a05fb51af4a3b83d5e05b40b59ff4.r2.dev/vcftest.mp4" type="video/mp4" />
        </video>
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
