import type { ReactNode } from 'react'

/** Smooth wavy "seal" outline built from alternating radii. */
function sealPath(points: number, outer: number, inner: number, c = 50) {
  const step = (Math.PI * 2) / (points * 2)
  const pts = Array.from({ length: points * 2 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner
    return [c + r * Math.cos(i * step - Math.PI / 2), c + r * Math.sin(i * step - Math.PI / 2)]
  })
  // quadratic curves through midpoints give soft, hand-cut bumps
  const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const start = mid(pts[pts.length - 1], pts[0])
  let d = `M${start[0].toFixed(2)} ${start[1].toFixed(2)}`
  pts.forEach((p, i) => {
    const m = mid(p, pts[(i + 1) % pts.length])
    d += ` Q${p[0].toFixed(2)} ${p[1].toFixed(2)} ${m[0].toFixed(2)} ${m[1].toFixed(2)}`
  })
  return d + 'Z'
}

const outlines = {
  hero: sealPath(14, 49, 41),
  small: sealPath(11, 48, 41),
}

interface WavyStickerProps {
  children: ReactNode
  className?: string
  shape?: keyof typeof outlines
}

export default function WavySticker({ children, className = '', shape = 'hero' }: WavyStickerProps) {
  return (
    <div className={`relative grid place-items-center ${className}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full drop-shadow-[0_4px_6px_rgba(60,30,10,0.22)]" aria-hidden>
        <path d={outlines[shape]} fill="#FFFDF5" />
        <path d={outlines[shape]} fill="none" stroke="#F4BF45" strokeWidth="1.2" strokeDasharray="2 2.5" transform="translate(7 7) scale(.86)" />
      </svg>
      <span className="relative">{children}</span>
    </div>
  )
}
