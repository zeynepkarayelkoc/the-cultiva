'use client'
import { useEffect, useRef, useState } from 'react'

export default function WelcomeScreen() {
  const [visible, setVisible] = useState(false)
  const [uiReady, setUiReady] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const seen = localStorage.getItem('cultiva_welcome_seen')
    if (seen) return
    setVisible(true)
    const t = setTimeout(() => setUiReady(true), 1400)

    // ── CANVAS: Parıltılar + Sparkles ──
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let W = canvas.width = window.innerWidth
    let H = canvas.height = window.innerHeight
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight }
    window.addEventListener('resize', resize)

    // Ambient parçacıklar
    const ambient = Array.from({ length: 40 }, () => ({
      x: Math.random() * 1920, y: Math.random() * 1080,
      vy: -(0.12 + Math.random() * 0.4),
      vx: (Math.random() - 0.5) * 0.2,
      life: Math.random(),
      r: 0.5 + Math.random() * 1.8,
      hue: 28 + Math.random() * 30,
    }))

    // Parlak yıldız parıltıları
    const sparkles = Array.from({ length: 18 }, (_, i) => ({
      x: 0.15 * W + Math.random() * 0.7 * W,
      y: 0.1 * H + Math.random() * 0.8 * H,
      size: 1.5 + Math.random() * 3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.8,
      hue: 35 + Math.random() * 25,
    }))

    // Işık huzmeleri (lens flare benzeri)
    const flares = Array.from({ length: 5 }, () => ({
      x: 0.3 * W + Math.random() * 0.4 * W,
      y: 0.2 * H + Math.random() * 0.5 * H,
      r: 60 + Math.random() * 100,
      phase: Math.random() * Math.PI * 2,
      speed: 0.008 + Math.random() * 0.012,
    }))

    let sparks: any[] = []
    let t2 = 0
    let raf: number

    const frame = () => {
      t2 += 0.016
      ctx.clearRect(0, 0, W, H)

      // Ambient
      ambient.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.life += 0.003
        if (p.life > 1 || p.y < -10) { p.x = Math.random() * W; p.y = H + 10; p.life = 0 }
        ctx.save()
        ctx.globalAlpha = Math.sin(p.life * Math.PI) * 0.35
        ctx.fillStyle = `hsl(${p.hue},65%,72%)`
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      })

      // Flares
      flares.forEach(f => {
        f.phase += f.speed
        const alpha = (Math.sin(f.phase) * 0.5 + 0.5) * 0.12
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r)
        grad.addColorStop(0, `rgba(255,210,100,${alpha})`)
        grad.addColorStop(1, 'rgba(255,180,60,0)')
        ctx.fillStyle = grad
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill()
      })

      // Sparkles (yıldız şekli)
      sparkles.forEach(s => {
        s.phase += s.speed * 0.04
        const alpha = (Math.sin(s.phase) * 0.5 + 0.5)
        const size = s.size * (0.6 + alpha * 0.8)
        ctx.save()
        ctx.globalAlpha = alpha * 0.9
        ctx.fillStyle = `hsl(${s.hue},90%,80%)`
        ctx.shadowColor = `hsl(${s.hue},100%,70%)`
        ctx.shadowBlur = 12
        // 4-pointed star
        ctx.beginPath()
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4
          const r = i % 2 === 0 ? size : size * 0.35
          i === 0 ? ctx.moveTo(s.x + Math.cos(angle) * r, s.y + Math.sin(angle) * r)
                  : ctx.lineTo(s.x + Math.cos(angle) * r, s.y + Math.sin(angle) * r)
        }
        ctx.closePath(); ctx.fill()
        ctx.restore()
      })

      // Mouse sparks
      sparks = sparks.filter(p => p.life > 0)
      sparks.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.07; p.vx *= 0.98; p.life -= p.decay
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.life * p.life)
        ctx.fillStyle = `hsl(${p.hue},100%,${60 + p.life * 30}%)`
        ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      })

      raf = requestAnimationFrame(frame)
    }
    frame()

    // Mouse sparks
    const spawnSparks = (e: MouseEvent) => {
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 1 + Math.random() * 3
        sparks.push({
          x: e.clientX, y: e.clientY,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1,
          life: 0.8 + Math.random() * 0.4, decay: 0.025 + Math.random() * 0.02,
          r: 1.5 + Math.random() * 2, hue: 32 + Math.random() * 28,
        })
      }
    }
    window.addEventListener('mousemove', spawnSparks)

    return () => {
      clearTimeout(t)
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', spawnSparks)
    }
  }, [])

  // 3D tilt efekti
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10
    const y = -((e.clientY - rect.top) / rect.height - 0.5) * 6
    setTilt({ x, y })
  }
  const handleMouseLeave = () => setTilt({ x: 0, y: 0 })

  const enter = () => {
    localStorage.setItem('cultiva_welcome_seen', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      ref={containerRef}
      onClick={enter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: '#0e0804', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        perspective: '1000px',
      }}
    >
      {/* Tablo — 3D tilt */}
      <div style={{
        position: 'absolute', inset: '-8%',
        backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/1280px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg')",
        backgroundSize: 'cover', backgroundPosition: '28% 38%',
        filter: 'sepia(0.45) contrast(1.1) brightness(0.62)',
        transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) scale(1.08)`,
        transition: 'transform 0.15s ease-out',
        transformStyle: 'preserve-3d',
        animation: 'paintDrift 20s ease-in-out infinite',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 110% 75% at 50% 45%, transparent 20%, rgba(6,3,1,0.65) 100%)',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%',
        background: 'linear-gradient(to top, rgba(8,4,1,1) 0%, rgba(8,4,1,0.7) 40%, transparent 100%)',
      }} />
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '25%',
        background: 'linear-gradient(to bottom, rgba(8,4,1,0.7) 0%, transparent 100%)',
      }} />

      {/* Canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }} />

      {/* UI */}
      <div style={{
        position: 'relative', zIndex: 5, textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem',
        opacity: uiReady ? 1 : 0,
        transform: `translateY(${uiReady ? 0 : 20}px) rotateX(${tilt.y * 0.3}deg)`,
        transition: 'opacity 1.2s ease, transform 1.2s ease',
      }}>
        {/* Logo */}
        <img
          src="/logo.png"
          alt="The Cultiva"
          style={{
            width: 'clamp(240px, 42vw, 560px)',
            height: 'auto',
            filter: 'invert(1) brightness(1.15) drop-shadow(0 0 50px rgba(220,170,80,0.8))',
            animation: uiReady ? 'fadeUp 1s ease forwards' : 'none',
          }}
        />

        <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase',
            color: 'rgba(255,240,200,0.7)',
            animation: uiReady ? 'fadeUp 1s ease 0.2s both' : 'none',
          }}>
            keşfetmeye başla
          </div>
          <button
            onClick={e => { e.stopPropagation(); enter() }}
            style={{
              fontFamily: "'Open Sans', sans-serif", fontSize: '0.85rem',
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: '#1a0f08', background: 'rgba(240,210,150,0.92)',
              border: 'none', padding: '1rem 3rem',
              borderRadius: 50, fontWeight: 600,
              boxShadow: '0 4px 30px rgba(0,0,0,0.5), 0 0 40px rgba(220,170,60,0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              animation: uiReady ? 'fadeUp 1s ease 0.35s both' : 'none',
            }}
            onMouseEnter={e => {
              const b = e.currentTarget
              b.style.transform = 'scale(1.07) translateY(-2px)'
              b.style.boxShadow = '0 8px 40px rgba(0,0,0,0.6), 0 0 60px rgba(220,170,60,0.5)'
            }}
            onMouseLeave={e => {
              const b = e.currentTarget
              b.style.transform = ''
              b.style.boxShadow = '0 4px 30px rgba(0,0,0,0.5), 0 0 40px rgba(220,170,60,0.3)'
            }}
          >
            keşfetmeye başla
          </button>
        </div>
      </div>

      {/* Alt yazı */}
      <div style={{
        position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
        fontSize: '0.58rem', letterSpacing: '0.25em', textTransform: 'uppercase',
        color: 'rgba(245,225,190,0.5)', zIndex: 6, whiteSpace: 'nowrap',
        opacity: uiReady ? 1 : 0, transition: 'opacity 1s ease 0.8s',
      }}>
        tıkla ya da kaydır
      </div>
    </div>
  )
}
