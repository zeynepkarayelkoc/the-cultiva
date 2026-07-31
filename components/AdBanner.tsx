'use client'

import { useEffect, useRef } from 'react'

// ─────────────────────────────────────────────────
// Google AdSense Publisher ID'ni buraya yaz:
// AdSense hesabın onaylandıktan sonra
// https://adsense.google.com → Ads → Ad units
// Her alan için farklı bir slot ID alacaksın.
// ─────────────────────────────────────────────────
const PUBLISHER_ID = 'ca-pub-XXXXXXXXXXXXXXXX'  // ← buraya yaz

type AdFormat = 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal'

interface AdBannerProps {
  slot: string          // AdSense slot ID
  format?: AdFormat
  className?: string
  style?: React.CSSProperties
  label?: boolean       // "Reklam" etiketi göster
}

declare global {
  interface Window {
    adsbygoogle: { [key: string]: unknown }[]
  }
}

export default function AdBanner({
  slot,
  format = 'auto',
  className,
  style,
  label = true,
}: AdBannerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const adsbygoogle = (window.adsbygoogle = window.adsbygoogle || [])
      adsbygoogle.push({})
    } catch {
      // AdSense script henüz yüklenmemiş
    }
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem',
        ...style,
      }}
    >
      {label && (
        <span style={{
          fontSize: '0.55rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(42,31,24,0.3)',
        }}>
          reklam
        </span>
      )}
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
