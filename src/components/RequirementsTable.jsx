import { COLORS, uid } from '../utils/constants'

export default function RequirementsTable({ requirements, onChange }) {
  const set = (id, field, val) =>
    onChange(requirements.map(r => r.id === id ? { ...r, [field]: val } : r))
  const remove = (id) => onChange(requirements.filter(r => r.id !== id))
  const add = () => onChange([...requirements, { id: uid(), width: '', qty: 1, flexible: false }])

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-gray-100">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Slit Requirements — enter all sizes here
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Set <strong>Min Qty</strong> for sizes you must produce.
          Enable <strong>Fill</strong> to let the optimizer add extra pieces of that size to reduce waste.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide bg-slate-50">
              <th className="py-2.5 px-3 text-left w-8"></th>
              <th className="py-2.5 px-3 text-left">Width (mm)</th>
              <th className="py-2.5 px-3 text-left">Min Qty Required</th>
              <th className="py-2.5 px-4 text-center">Use as Fill</th>
              <th className="w-10 no-print"></th>
            </tr>
          </thead>
          <tbody>
            {requirements.map((r, i) => (
              <tr key={r.id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-3">
                  <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                </td>
                <td className="py-2 px-3">
                  <input
                    type="number" min="1" value={r.width} placeholder="e.g. 300"
                    onChange={e => set(r.id, 'width', e.target.value)}
                    className="w-28 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => set(r.id, 'qty', Math.max(0, Number(r.qty) - 1))}
                      className="w-7 h-7 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center justify-center no-print"
                    >−</button>
                    <input
                      type="number" min="0" value={r.qty}
                      onChange={e => set(r.id, 'qty', e.target.value)}
                      className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                    <button
                      onClick={() => set(r.id, 'qty', Number(r.qty) + 1)}
                      className="w-7 h-7 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center justify-center no-print"
                    >+</button>
                  </div>
                </td>
                <td className="py-2 px-4 text-center">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <div
                      onClick={() => set(r.id, 'flexible', !r.flexible)}
                      className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${r.flexible ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${r.flexible ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className={`text-xs font-medium ${r.flexible ? 'text-blue-600' : 'text-gray-400'}`}>
                      {r.flexible ? 'Fill' : 'Fixed'}
                    </span>
                  </label>
                </td>
                <td className="py-2 px-2 no-print">
                  <button
                    onClick={() => remove(r.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors text-xl leading-none"
                    title="Remove"
                  >×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-3 no-print">
        <button
          onClick={add}
          className="text-sm px-4 py-2 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors"
        >
          + Add Size
        </button>
        <span className="text-xs text-gray-400">
          {requirements.filter(r => !r.flexible && Number(r.qty) > 0).length} fixed ·{' '}
          {requirements.filter(r => r.flexible).length} fill sizes
        </span>
      </div>
    </div>
  )
}
