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
          background: '#FAFAF5',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 24 }}>🎯</div>
        <div style={{ fontSize: 64, fontWeight: 700, color: '#1A1614' }}>matchremote</div>
        <div style={{ fontSize: 32, color: '#5C5854', marginTop: 20, textAlign: 'center', maxWidth: 900 }}>
          Find remote work that actually fits your life
        </div>
      </div>
    ),
    { ...size }
  )
}
