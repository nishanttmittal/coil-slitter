export default function WeightCheckPanel({ result, coilWidth, halfWeight }) {
  if (!result || result.error) return null

  const W = Number(coilWidth) || 1
  const allSlits = [...(result.pass1 || []), ...(result.pass2 || [])]
  const uniqueWidths = [...new Set(allSlits.map(s => Math.round(Number(s.width))))]
  const widestSlit = Math.max(0, ...uniqueWidths)
  const maxAllowedWeight = widestSlit > 0 && W > 0 ? Math.floor(6000 * W / widestSlit) : 0
  const totalWeight = halfWeight * 2
  const weightTooHigh = totalWeight > 0 && maxAllowedWeight > 0 && totalWeight > maxAllowedWeight

  return (
    <div className={`rounded-xl border-2 p-5 ${weightTooHigh ? 'bg-red-50 border-red-400' : 'bg-green-50 border-green-400'}`}>
      <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
        Weight Check — 3 t / slit coil limit
      </div>

      <div className="flex flex-wrap items-center gap-6 mb-4">
        <div>
          <div className="text-xs text-gray-500">Your coil weight</div>
          <div className={`text-2xl font-bold font-mono ${weightTooHigh ? 'text-red-600' : 'text-gray-800'}`}>
            {totalWeight > 0
              ? `${(totalWeight / 1000).toFixed(3)} t`
              : <span className="text-gray-300 text-lg">Not entered</span>}
          </div>
        </div>

        <div className="text-2xl text-gray-300">vs</div>

        <div>
          <div className="text-xs text-gray-500">
            Max allowed
            {widestSlit > 0 && <span className="text-gray-400 ml-1">(widest slit: {widestSlit} mm)</span>}
          </div>
          <div className={`text-2xl font-bold font-mono ${weightTooHigh ? 'text-red-600' : 'text-green-700'}`}>
            {maxAllowedWeight > 0 ? `${(maxAllowedWeight / 1000).toFixed(3)} t` : '—'}
          </div>
        </div>

        {totalWeight > 0 && maxAllowedWeight > 0 && (
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold border-4 ${
            weightTooHigh ? 'bg-red-100 border-red-400 text-red-600' : 'bg-green-100 border-green-400 text-green-600'
          }`}>
            {weightTooHigh ? '✗' : '✓'}
          </div>
        )}

        {totalWeight > 0 && maxAllowedWeight > 0 && (
          <div className={`text-sm font-semibold px-4 py-2 rounded-lg ${
            weightTooHigh ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {weightTooHigh
              ? `⚠ ${((totalWeight - maxAllowedWeight) / 1000).toFixed(2)} t too heavy`
              : '✓ All slit coils under 3 t'}
          </div>
        )}
      </div>

      {halfWeight > 0 && uniqueWidths.length > 0 && (
        <>
          <div className="text-xs font-semibold text-gray-500 mb-2">
            Weight per slit coil piece (per pass — half coil length):
          </div>
          <div className="flex flex-wrap gap-2">
            {uniqueWidths.sort((a, b) => b - a).map(w => {
              const wt = (w / W) * halfWeight
              const over = wt > 3000
              return (
                <div key={w} className={`text-xs px-3 py-1.5 rounded-lg font-mono font-semibold border ${
                  over ? 'bg-red-100 border-red-300 text-red-700' : 'bg-white border-gray-200 text-gray-700'
                }`}>
                  {w} mm → {wt >= 1000 ? `${(wt / 1000).toFixed(3)} t` : `${wt.toFixed(0)} kg`} {over ? '⚠' : '✓'}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
