import PatternBar from './PatternBar'

export default function PassPanel({ label, slits, coilWidth, halfWeight, colorMap }) {
  const W = Number(coilWidth) || 1
  const used = slits.reduce((s, r) => s + Math.round(Number(r.width)) * r.qty, 0)
  const waste = W - used
  const pieces = slits.reduce((s, r) => s + r.qty, 0)

  return (
    <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">{label}</h3>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
          waste === 0 ? 'bg-green-100 text-green-700' :
          waste < 0  ? 'bg-red-100 text-red-700' : 'bg-amber-50 text-amber-700'
        }`}>
          {waste < 0 ? `⚠ overflow ${Math.abs(waste)} mm` :
           waste === 0 ? '✓ zero waste' : `waste: ${waste} mm`}
        </span>
      </div>

      <PatternBar slits={slits} coilWidth={W} colorMap={colorMap} />

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
            <th className="text-left pb-1.5 pr-2 w-5"></th>
            <th className="text-left pb-1.5">Width</th>
            <th className="text-center pb-1.5">Qty</th>
            <th className="text-right pb-1.5">Wt / piece</th>
          </tr>
        </thead>
        <tbody>
          {slits.length === 0 && (
            <tr>
              <td colSpan={4} className="py-3 text-center text-gray-300 text-xs italic">
                No slits in this pass
              </td>
            </tr>
          )}
          {slits.map(s => {
            const pieceWt = halfWeight > 0 ? (Math.round(Number(s.width)) / W) * halfWeight : 0
            const over = pieceWt > 3000
            return (
              <tr key={s.id} className="border-b border-gray-50">
                <td className="py-1.5 pr-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colorMap.get(s.id) }} />
                </td>
                <td className="py-1.5 font-mono text-gray-700">{s.width} mm</td>
                <td className="py-1.5 text-center">
                  <span className="font-bold text-gray-800">{s.qty}</span>
                  {s.reqQty > 0 && s.fillQty > 0 && (
                    <span className="ml-1 text-xs text-gray-400">
                      ({s.reqQty}+<span className="text-blue-500">{s.fillQty}f</span>)
                    </span>
                  )}
                  {s.reqQty === 0 && s.fillQty > 0 && (
                    <span className="ml-1 text-xs text-blue-500">(fill)</span>
                  )}
                </td>
                <td className={`py-1.5 text-right font-mono font-semibold ${over ? 'text-red-600' : 'text-gray-600'}`}>
                  {pieceWt > 0
                    ? pieceWt >= 1000
                      ? `${(pieceWt / 1000).toFixed(3)} t`
                      : `${pieceWt.toFixed(0)} kg`
                    : '—'}
                  {over && ' ⚠'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="flex justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
        <span>Used: <strong className="text-gray-800">{used} / {W} mm</strong></span>
        <span>Pieces: <strong className="text-gray-800">{pieces}</strong></span>
        <span className={waste < 0 ? 'text-red-600 font-bold' : ''}>
          Waste: <strong>{Math.max(waste, 0)} mm ({((Math.max(waste, 0) / W) * 100).toFixed(1)}%)</strong>
        </span>
      </div>
    </div>
  )
}
