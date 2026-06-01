import { useState } from 'react'
import { COLORS, uid } from './utils/constants'
import { splitIntoTwoPasses } from './utils/optimizer'
import RequirementsTable from './components/RequirementsTable'
import PassPanel from './components/PassPanel'
import SummaryTable from './components/SummaryTable'
import WeightCheckPanel from './components/WeightCheckPanel'
import PrintMetaPanel from './components/PrintMetaPanel'
import PrintView from './components/PrintView'

const DEFAULT_REQS = [
  { id: uid(), width: 300, qty: 3, flexible: false },
  { id: uid(), width: 250, qty: 2, flexible: false },
  { id: uid(), width: 200, qty: 4, flexible: false },
  { id: uid(), width: 150, qty: 0, flexible: true },
  { id: uid(), width: 100, qty: 0, flexible: true },
]

const DEFAULT_META = { jobRef: '', supplier: '', date: '', notes: '' }

export default function App() {
  const [coil, setCoil] = useState({ width: '', weight: '', thickness: '' })
  const [requirements, setRequirements] = useState(DEFAULT_REQS)
  const [meta, setMeta] = useState(DEFAULT_META)

  const W = Number(coil.width) || 0
  const coilReady = W > 0
  const totalWeight = Number(coil.weight) || 0
  const thickness = Number(coil.thickness) || 1
  const halfWeight = totalWeight / 2

  const coilLength =
    totalWeight > 0 && W > 0 && thickness > 0
      ? (totalWeight * 1e6) / (7850 * W * thickness)
      : 0

  const result = coilReady ? splitIntoTwoPasses(requirements, W) : null
  const colorMap = new Map(requirements.map((r, i) => [r.id, COLORS[i % COLORS.length]]))

  const totalReqWidth = requirements
    .filter(r => Number(r.width) > 0 && Number(r.qty) > 0)
    .reduce((s, r) => s + Math.round(Number(r.width)) * Number(r.qty), 0)

  const setCoilField = (f, v) => setCoil(c => ({ ...c, [f]: v }))
  const hasResult = coilReady && result && !result.error

  return (
    <>
      {/* ── Screen UI ── */}
      <div className="screen-content min-h-screen bg-slate-100">

        {/* Header */}
        <header className="bg-blue-900 text-white px-6 py-4 shadow-xl no-print">
          <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-xl font-bold tracking-tight">🏭 Coil Slitting Optimizer</h1>
              <p className="text-blue-300 text-sm mt-0.5">
                Enter sizes once · auto-split into two passes · minimize waste
              </p>
            </div>
            <div className="text-right text-sm text-blue-200">
              {coilReady ? (
                <>
                  <div>Mother Coil: <strong className="text-white font-mono">{W} mm</strong></div>
                  <div>Total Weight: <strong className="text-white font-mono">
                    {totalWeight > 0 ? `${(totalWeight / 1000).toFixed(1)} t` : '—'}
                  </strong></div>
                </>
              ) : (
                <div className="text-amber-300 font-semibold animate-pulse">
                  ↓ Enter coil width to begin
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto p-4 space-y-4">

          {/* Coil Parameters */}
          <div className={`bg-white rounded-xl shadow p-5 ${!coilReady ? 'ring-2 ring-blue-400' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Mother Coil Parameters
              </h2>
              {!coilReady && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold animate-pulse">
                  Step 1 — Enter coil width
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-5 items-end">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                  Coil Width (mm) <span className="text-red-500">*</span>
                </span>
                <input
                  type="number" value={coil.width} min="1" step="1"
                  placeholder="e.g. 1250" autoFocus
                  onChange={e => setCoilField('width', e.target.value)}
                  className={`border-2 rounded-lg px-4 py-2.5 w-44 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono ${
                    coilReady ? 'border-blue-400 text-blue-700 bg-blue-50' : 'border-blue-300 text-gray-700'
                  }`}
                />
              </label>

              {[
                { label: 'Total Weight (kg)', field: 'weight',    step: 100, ph: '20000' },
                { label: 'Thickness (mm)',    field: 'thickness', step: 0.1, ph: '2.0'   },
              ].map(({ label, field, step, ph }) => (
                <label key={field} className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-500">{label}</span>
                  <input
                    type="number" value={coil[field]} step={step} min="0" placeholder={ph}
                    onChange={e => setCoilField(field, e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-36 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </label>
              ))}

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-500">Per-Pass Weight</span>
                <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-mono text-gray-700 w-36">
                  {halfWeight > 0 ? `${(halfWeight / 1000).toFixed(3)} t` : '—'}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-500">Est. Coil Length</span>
                <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-mono text-gray-700 w-36">
                  {coilLength > 0 ? `${coilLength.toFixed(0)} m` : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Requirements Table */}
          <RequirementsTable requirements={requirements} onChange={setRequirements} />

          {/* Width status banner */}
          {coilReady && totalReqWidth > 0 && (
            <div className={`text-sm font-semibold px-4 py-3 rounded-xl border ${
              totalReqWidth > 2 * W
                ? 'bg-red-100 text-red-700 border-red-300'
                : totalReqWidth > W
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-green-50 text-green-700 border-green-200'
            }`}>
              {totalReqWidth > 2 * W
                ? `⚠ Required ${totalReqWidth} mm exceeds 2 passes (${2 * W} mm) — reduce quantities`
                : totalReqWidth > W
                ? `ℹ Required ${totalReqWidth} mm > one pass (${W} mm) — will be split across both passes`
                : `✓ Required ${totalReqWidth} mm fits in one pass — fill sizes will reduce waste`}
            </div>
          )}

          {/* Error */}
          {result?.error && (
            <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4 text-red-700 font-semibold text-sm">
              ⚠ {result.error}
            </div>
          )}

          {/* Results */}
          {hasResult && (
            <>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Auto-Split Result</h2>
                  <div className="flex gap-2 text-xs">
                    <span className="bg-gray-700 text-white px-2 py-0.5 rounded">Solid = required</span>
                    <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded">Faded = fill</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PassPanel label="Pass 1 — First Half"  slits={result.pass1} coilWidth={W} halfWeight={halfWeight} colorMap={colorMap} />
                  <PassPanel label="Pass 2 — Second Half" slits={result.pass2} coilWidth={W} halfWeight={halfWeight} colorMap={colorMap} />
                </div>
              </div>

              <SummaryTable requirements={requirements} result={result} coilWidth={W} halfWeight={halfWeight} />
              <WeightCheckPanel result={result} coilWidth={W} halfWeight={halfWeight} />
            </>
          )}

          {/* Print for Supplier panel */}
          <PrintMetaPanel
            meta={meta}
            onChange={setMeta}
            onPrint={() => window.print()}
            disabled={!hasResult}
          />

          {/* Legend */}
          {coilReady && requirements.some(r => Number(r.width) > 0) && (
            <div className="bg-white rounded-xl shadow p-4">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Size Legend</div>
              <div className="flex flex-wrap gap-3">
                {requirements.filter(r => Number(r.width) > 0).map((r, i) => (
                  <div key={r.id} className="flex items-center gap-1.5 text-xs">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="font-mono text-gray-700">{r.width} mm</span>
                    {r.flexible && <span className="text-blue-500">(fill)</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pb-6" />
        </div>
      </div>

      {/* ── Print-only supplier document ── */}
      <PrintView
        coil={coil}
        requirements={requirements}
        result={result}
        meta={meta}
      />
    </>
  )
}
