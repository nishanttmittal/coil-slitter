export default function PatternBar({ slits, coilWidth, colorMap }) {
  const W = Number(coilWidth) || 1
  const used = slits.reduce((s, x) => s + Math.round(Number(x.width)) * x.qty, 0)
  const waste = W - used

  const segments = []
  slits.forEach(s => {
    for (let q = 0; q < s.qty; q++) {
      segments.push({
        width: Math.round(Number(s.width)),
        color: colorMap.get(s.id) || '#94A3B8',
        isFill: q >= s.reqQty,
      })
    }
  })
  if (waste > 0)
    segments.push({ width: waste, color: '#CBD5E1', isFill: false, isWaste: true })

  return (
    <div>
      <div className="w-full h-12 flex rounded-lg overflow-hidden border border-gray-200 mb-1">
        {segments.map((seg, i) => (
          <div
            key={i}
            style={{
              width: `${(seg.width / W) * 100}%`,
              backgroundColor: seg.color,
              opacity: seg.isFill ? 0.5 : 1,
              minWidth: 1,
            }}
            className="flex items-center justify-center cursor-default"
            title={`${seg.width} mm${seg.isWaste ? ' (waste)' : seg.isFill ? ' (fill)' : ''}`}
          >
            {(seg.width / W) > 0.06 && (
              <span className={`text-xs font-bold select-none drop-shadow-sm ${seg.isWaste ? 'text-gray-500' : 'text-white'}`}>
                {seg.width}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 font-mono">
        <span>0</span><span>{Math.round(W / 2)}</span><span>{W} mm</span>
      </div>
    </div>
  )
}
