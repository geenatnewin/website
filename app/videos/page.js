import Link from 'next/link'

const videoItems = [
  { title: 'Brand Film',            sub: 'Commercial · 2024' },
  { title: 'Event Highlight Reel',  sub: 'Events · 2024'     },
  { title: 'Short Film',            sub: 'Narrative · 2023'  },
  { title: 'Music Video',           sub: 'Artist · 2023'     },
  { title: 'Documentary',           sub: 'Editorial · 2023'  },
  { title: 'Social Reel',           sub: 'Content · 2023'    },
]

const PlayIcon = () => (
  <svg viewBox="0 0 12 12"><polygon points="2,1 11,6 2,11" fill="white"/></svg>
)

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
    </>
  )
}
