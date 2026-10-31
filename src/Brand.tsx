import { motion } from 'framer-motion';

type LogoProps = { size?: number; compact?: boolean; monochrome?: boolean };

export function BrandOrb({ size = 48 }: { size?: number }) {
  const id = `orb-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="brand-orb">
      <defs>
        <radialGradient id={id} cx="30%" cy="24%" r="80%">
          <stop offset="0%" stopColor="#d4ff4f" />
          <stop offset="58%" stopColor="#12c27a" />
          <stop offset="100%" stopColor="#0a5c3a" />
        </radialGradient>
        <linearGradient id={`${id}-shine`} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#fff" stopOpacity=".52" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill={`url(#${id})`} />
      <ellipse cx="23" cy="15" rx="15" ry="7" fill={`url(#${id}-shine)`} opacity=".42" />
      <path d="M17 39c3-13 17-20 31-20-2 14-10 27-23 27-5 0-8-3-8-7Z" fill="#fff" />
      <path d="M20 43 41 25M27 37l-1-8m8 1 7 3m-12 8 8 3" fill="none" stroke="#15935b" strokeWidth="2" strokeLinecap="round" />
      <circle cx="26" cy="29" r="2" fill="#15935b" />
      <circle cx="40" cy="31" r="2" fill="#15935b" />
      <circle cx="33" cy="40" r="2" fill="#15935b" />
    </svg>
  );
}

export function EcoGridLogo({ size = 42, compact = false, monochrome = false }: LogoProps) {
  return (
    <div className={`brand-lockup ${compact ? 'brand-lockup-compact' : ''}`} aria-label="EcoGrid">
      <BrandOrb size={size} />
      {!compact && (
        <span className={`brand-wordmark ${monochrome ? 'brand-monochrome' : ''}`}>
          Eco<span>Grid</span>
        </span>
      )}
    </div>
  );
}

export function GreenToken({ size = 24, animate = false }: { size?: number; animate?: boolean }) {
  const id = `token-${size}`;
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      aria-label="Зелен токен"
      role="img"
      className={`green-token ${size >= 40 ? 'token-shine' : ''}`}
      animate={animate ? { rotateY: [0, 360] } : undefined}
      transition={{ duration: 0.6 }}
    >
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop stopColor="#12c27a" />
          <stop offset="1" stopColor="#0a8f56" />
        </linearGradient>
      </defs>
      <circle cx="36" cy="36" r="33" fill={`url(#${id})`} stroke="#fff" strokeWidth="3" />
      <circle cx="36" cy="36" r="27" fill="none" stroke="#fff" strokeOpacity=".36" strokeWidth="1.5" strokeDasharray="2 3" />
      <path d="M24 37c2-9 12-14 25-14-2 11-8 22-18 22-4 0-7-3-7-8Z" fill="#d4ff4f" />
      <path d="m27 43 17-17m-11 11-1-7m7 0 5 3" fill="none" stroke="#0a5c3a" strokeWidth="2" strokeLinecap="round" />
      {size >= 24 && <text x="36" y="55" textAnchor="middle" fill="#fff" fillOpacity=".86" fontSize="8" fontWeight="800" fontFamily="Manrope, sans-serif">Eco</text>}
    </motion.svg>
  );
}

export function TabEmblem({ icon, accent, tint = 'lime' }: { icon: React.ReactNode; accent: React.ReactNode; tint?: string }) {
  return (
    <motion.div
      className={`tab-emblem tint-${tint}`}
      initial={{ scale: 0.7, rotate: -8, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      key={String(icon)}
    >
      {icon}
      <span className="emblem-accent">{accent}</span>
    </motion.div>
  );
}
