import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#EDEEF0',
          fontFamily: 'sans-serif',
        }}
      >
        <svg width={120} height={120} viewBox="0 0 128 128" style={{ marginBottom: 28 }}>
          <rect width="128" height="128" rx="30" fill="#1E3A8A" />
          <circle cx="64" cy="64" r="46" fill="none" stroke="#FFFFFF" strokeWidth="7" opacity="0.95" />
          <circle cx="64" cy="64" r="27" fill="none" stroke="#FFFFFF" strokeWidth="7" opacity="0.95" />
          <circle cx="64" cy="64" r="9" fill="#FFFFFF" />
          <circle cx="112" cy="16" r="17" fill="#1C9AD6" stroke="#EDEEF0" strokeWidth="5" />
        </svg>
        <div style={{ display: 'flex', fontSize: 64, fontWeight: 700 }}>
          <span style={{ color: '#1A1C20' }}>match</span>
          <span style={{ color: '#1E3A8A' }}>remote</span>
        </div>
        <div style={{ fontSize: 32, color: '#5B5F68', marginTop: 20, textAlign: 'center', maxWidth: 900 }}>
          Find remote work that actually fits your life
        </div>
      </div>
    ),
    { ...size }
  )
}
