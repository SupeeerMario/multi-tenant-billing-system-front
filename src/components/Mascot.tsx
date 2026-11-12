type Props = { color: string; busy: boolean }

export function Mascot({ color, busy }: Props) {
  return (
    <svg className="mascot" width="56" height="64" viewBox="0 0 56 64" fill="none" aria-hidden="true">
      <g className={busy ? 'antenna spinning' : 'antenna'}>
        <path d="M28 14V6" stroke="var(--muted)" strokeWidth="2" />
        <circle cx="28" cy="5" r="3" fill={color} />
      </g>
      <rect x="8" y="14" width="40" height="30" rx="10" fill="#14171d" stroke="var(--border-2)" strokeWidth="1.5" />
      <g className="eyes">
        <rect x="17" y="24" width="7" height="10" rx="3.5" fill={color} />
        <rect x="32" y="24" width="7" height="10" rx="3.5" fill={color} />
      </g>
      <rect x="18" y="47" width="20" height="13" rx="5" fill="#14171d" stroke="var(--border-2)" strokeWidth="1.5" />
    </svg>
  )
}
