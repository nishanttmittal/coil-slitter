export default function PrintMetaPanel({ meta, onChange, onPrint, disabled }) {
  const set = (field, val) => onChange({ ...meta, [field]: val })
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="bg-white rounded-xl shadow p-5 no-print">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Print for Supplier
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Fill in job details then print — these appear on the supplier document
          </p>
        </div>
        <button
          onClick={onPrint}
          disabled={disabled}
          className={`px-5 py-2.5 text-sm rounded-lg font-semibold shadow transition-colors flex items-center gap-2 ${
            disabled
              ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
              : 'bg-blue-700 text-white hover:bg-blue-800'
          }`}
        >
          🖨 Print / Save PDF
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-500">Job Reference</span>
          <input
            type="text"
            value={meta.jobRef}
            placeholder="e.g. CSO-001"
            onChange={e => set('jobRef', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-500">Supplier Name</span>
          <input
            type="text"
            value={meta.supplier}
            placeholder="e.g. ABC Steel Works"
            onChange={e => set('supplier', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-52 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-500">Date</span>
          <input
            type="date"
            value={meta.date || today}
            onChange={e => set('date', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </label>

        <label className="flex flex-col gap-1.5 flex-1 min-w-52">
          <span className="text-xs font-semibold text-gray-500">Notes / Remarks</span>
          <input
            type="text"
            value={meta.notes}
            placeholder="Special instructions, grade, delivery date..."
            onChange={e => set('notes', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
          />
        </label>
      </div>
    </div>
  )
}
