'use client'

import { useEffect, useState } from 'react'

export default function PageFade({ children, id }) {
  const [active, setActive] = useState(false)
  useEffect(() => { setActive(true) }, [])

  return (
    <div className={`page${active ? ' active' : ''}`} id={id}>
      {children}
    </div>
  )
}
