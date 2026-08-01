// Yönetim paneli açık tema paletini tek yerde toplar.
// Sitenin krem/terra paletiyle uyumlu ama panel beyaz zeminli.

export const T = {
  bg: '#faf8f5',        // sayfa zemini
  panel: '#ffffff',     // kart / tablo zemini
  side: '#f3efe8',      // sol menü
  sideActive: '#ffffff',
  border: '#e4ddd1',
  borderSoft: '#efe9df',
  text: '#2c2419',
  muted: '#7d7264',
  faint: '#a89c8c',
  terra: '#b5734a',
  terraSoft: '#f6ece3',
  wine: '#8b2635',
  green: '#4f7a52',
  greenSoft: '#eaf1ea',
  amber: '#9a6b1f',
  amberSoft: '#faf0dc',
  danger: '#b03030',
} as const

export const card: React.CSSProperties = {
  background: T.panel,
  border: `1px solid ${T.border}`,
  borderRadius: 10,
}

export const input: React.CSSProperties = {
  width: '100%',
  height: 36,
  padding: '0 10px',
  fontSize: '0.85rem',
  color: T.text,
  background: T.panel,
  border: `1px solid ${T.border}`,
  borderRadius: 6,
  outline: 'none',
}

export const label: React.CSSProperties = {
  display: 'block',
  fontSize: '0.7rem',
  color: T.muted,
  marginBottom: 5,
  letterSpacing: '0.04em',
}

export const btn: React.CSSProperties = {
  height: 36,
  padding: '0 14px',
  fontSize: '0.82rem',
  color: T.text,
  background: T.panel,
  border: `1px solid ${T.border}`,
  borderRadius: 6,
  cursor: 'pointer',
}

export const btnPrimary: React.CSSProperties = {
  ...btn,
  background: T.terra,
  borderColor: T.terra,
  color: '#fff',
}

export const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  fontSize: '0.7rem',
  fontWeight: 500,
  color: T.muted,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  borderBottom: `1px solid ${T.border}`,
  background: '#fbf9f6',
}

export const td: React.CSSProperties = {
  padding: '11px 12px',
  fontSize: '0.85rem',
  color: T.text,
  borderBottom: `1px solid ${T.borderSoft}`,
  verticalAlign: 'middle',
}
