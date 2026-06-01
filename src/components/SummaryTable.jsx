import { COLORS } from '../utils/constants'

export default function SummaryTable({ requirements, result, coilWidth, halfWeight }) {
  const W = Number(coilWidth) || 1

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
        Combined Production Summary
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left pb-2 pr-2 w-5"></th>
              <th className="text-left pb-2">Width</th>
              <th className="text-center pb-2">Pass 1</th>
              <th className="text-center pb-2">Pass 2</th>
              <th className="text-center pb-2">Total Pieces</th>
              <th className="text-right pb-2">Wt / piece</th>
            </tr>
          </thead>
          <tbody>
            {requirements.filter(r => Number(r.width) > 0).map((r, i) => {
              const p1 = result.pass1.find(s => s.id === r.id)
              const p2 = result.pass2.find(s => s.id === r.id)
              const q1 = p1?.qty || 0
              const q2 = p2?.qty || 0
              const total = q1 + q2
              const pieceWt = halfWeight > 0 ? (Math.round(Number(r.width)) / W) * halfWeight : 0
              const over = pieceWt > 3000
              if (total === 0 && Number(r.qty) === 0 && !r.flexible) return null

              return (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 pr-2">
                    <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  </td>
                  <td className="py-2.5 font-mono text-gray-700">{r.width} mm</td>

                  <td className="py-2.5 text-center">
                    {q1 > 0 ? (
                      <span className="font-bold text-gray-800">
                        {q1}
                        {p1?.fillQty > 0 && (
                          <span className="text-xs text-blue-500 font-normal ml-1">
                            ({p1.reqQty}+{p1.fillQty}f)
                          </span>
                        )}
                      </span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>

                  <td className="py-2.5 text-center">
                    {q2 > 0 ? (
                      <span className="font-bold text-gray-800">
                        {q2}
                        {p2?.fillQty > 0 && (
                          <span className="text-xs text-blue-500 font-normal ml-1">
                            ({p2.reqQty}+{p2.fillQty}f)
                          </span>
                        )}
                      </span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>

                  <td className="py-2.5 text-center">
                    {total > 0
                      ? <span className="font-bold text-gray-800">{total}
                          {r.flexible && total > Number(r.qty) && (
                            <span className="ml-1 text-xs text-blue-500 font-normal">({r.qty} req)</span>
                          )}
                        </span>
                      : <span className="text-gray-300">—</span>}
                  </td>

                  <td className={`py-2.5 text-right font-mono font-semibold ${over ? 'text-red-600' : 'text-gray-600'}`}>
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
          <tfoot>
            <tr className="border-t-2 border-gray-200 bg-slate-50 font-semibold text-sm">
              <td /><td className="py-2.5 text-gray-500 text-xs uppercase">Total</td>
              <td className="py-2.5 text-center text-gray-700">
                {result.used1} mm
                <span className="block text-xs text-gray-400 font-normal">
                  waste: {result.waste1} mm ({((result.waste1 / W) * 100).toFixed(1)}%)
                </span>
              </td>
              <td className="py-2.5 text-center text-gray-700">
                {result.used2} mm
                <span className="block text-xs text-gray-400 font-normal">
                  waste: {result.waste2} mm ({((result.waste2 / W) * 100).toFixed(1)}%)
                </span>
              </td>
              <td className="py-2.5 text-center text-gray-700">
                {result.pass1.reduce((s, r) => s + r.qty, 0) +
                 result.pass2.reduce((s, r) => s + r.qty, 0)} pcs
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
