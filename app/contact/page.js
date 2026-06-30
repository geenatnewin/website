'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Contact() {
  const [submitState, setSubmitState] = useState('idle')

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
      <div className="page active">
        <Link href="/" className="back-btn visible">
          <span className="back-arrow">←</span> Back
        </Link>
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
                <a href="https://www.instagram.com/ng.navin/" target="_blank" rel="noopener noreferrer" className="contact-value">
                  ng.navin
                </a>
              </div>
            </div>
            <div className="contact-divider" />
            <p className="contact-form-title">Get in touch</p>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-field">
                <label className="form-label" htmlFor="c-name">Name</label>
                <input className="form-input" type="text" id="c-name" name="name" placeholder="Your name" required />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="c-email">Email</label>
                <input className="form-input" type="email" id="c-email" name="email" placeholder="your@email.com" required />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="c-msg">Message</label>
                <textarea className="form-textarea" id="c-msg" name="message" placeholder="Tell me about your project…" required />
              </div>
              <button className="form-submit" type="submit" disabled={submitState === 'sending'}>
                {submitState === 'sending' ? 'Sending…' : 'Send'}
              </button>
              {submitState === 'success' && <p className="form-success">Message sent - I&apos;ll be in touch soon!</p>}
              {submitState === 'error' && <p className="form-error">Something went wrong. Please try again.</p>}
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
