export default function PrintView({ coil, requirements, result, meta }) {
  if (!result || result.error) return null

  const W = Number(coil.width) || 1
  const totalWeight = Number(coil.weight) || 0
  const halfWeight = totalWeight / 2
  const thickness = Number(coil.thickness) || 1
  const coilLength =
    totalWeight > 0 && W > 0 && thickness > 0
      ? (totalWeight * 1e6) / (7850 * W * thickness)
      : 0

  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  const PassTable = ({ label, slits, passWeight }) => {
    const used = slits.reduce((s, r) => s + Math.round(Number(r.width)) * r.qty, 0)
    const waste = W - used
    const pieces = slits.reduce((s, r) => s + r.qty, 0)

    return (
      <div style={{ marginBottom: 24, pageBreakInside: 'avoid' }}>
        <div style={{ background: '#1e3a5f', color: '#fff', padding: '6px 10px', fontWeight: 'bold', fontSize: '11pt' }}>
          {label}
          {passWeight > 0 && (
            <span style={{ fontWeight: 'normal', fontSize: '9pt', marginLeft: 12 }}>
              (half-coil weight: {(passWeight / 1000).toFixed(3)} t)
            </span>
          )}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt' }}>
          <thead>
            <tr style={{ background: '#f0f4f8' }}>
              {['Sr.', 'Width (mm)', 'Qty', 'Total Width', 'Wt / Piece', 'Type'].map(h => (
                <th key={h} style={{ border: '1px solid #bbb', padding: '5px 8px', textAlign: 'center' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slits.map((s, i) => {
              const pieceWt = passWeight > 0 ? (Math.round(Number(s.width)) / W) * passWeight : 0
              const over = pieceWt > 3000
              const type = s.reqQty > 0 && s.fillQty > 0
                ? `Req(${s.reqQty}) + Fill(${s.fillQty})`
                : s.fillQty > 0 ? 'Fill' : 'Required'
              return (
                <tr key={s.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ border: '1px solid #bbb', padding: '4px 8px', textAlign: 'center' }}>{i + 1}</td>
                  <td style={{ border: '1px solid #bbb', padding: '4px 8px', textAlign: 'center', fontWeight: 'bold' }}>{s.width}</td>
                  <td style={{ border: '1px solid #bbb', padding: '4px 8px', textAlign: 'center', fontWeight: 'bold' }}>{s.qty}</td>
                  <td style={{ border: '1px solid #bbb', padding: '4px 8px', textAlign: 'center' }}>{Math.round(Number(s.width)) * s.qty} mm</td>
                  <td style={{ border: '1px solid #bbb', padding: '4px 8px', textAlign: 'center', color: over ? '#c00' : '#000', fontWeight: over ? 'bold' : 'normal' }}>
                    {pieceWt > 0
                      ? pieceWt >= 1000 ? `${(pieceWt / 1000).toFixed(3)} t` : `${pieceWt.toFixed(0)} kg`
                      : '—'}
                    {over && '  ⚠'}
                  </td>
                  <td style={{ border: '1px solid #bbb', padding: '4px 8px', textAlign: 'center', fontSize: '9pt', color: s.fillQty > 0 ? '#555' : '#000' }}>{type}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: '#e8f0fe', fontWeight: 'bold' }}>
              <td style={{ border: '1px solid #bbb', padding: '5px 8px', textAlign: 'center' }} colSpan={2}>TOTAL</td>
              <td style={{ border: '1px solid #bbb', padding: '5px 8px', textAlign: 'center' }}>{pieces} pcs</td>
              <td style={{ border: '1px solid #bbb', padding: '5px 8px', textAlign: 'center' }}>{used} mm</td>
              <td style={{ border: '1px solid #bbb', padding: '5px 8px' }} colSpan={2}></td>
            </tr>
            <tr style={{ background: '#fff8e1' }}>
              <td style={{ border: '1px solid #bbb', padding: '5px 8px', textAlign: 'center', color: '#888' }} colSpan={2}>WASTE / SCRAP</td>
              <td style={{ border: '1px solid #bbb', padding: '5px 8px', textAlign: 'center', color: '#888' }}>—</td>
              <td style={{ border: '1px solid #bbb', padding: '5px 8px', textAlign: 'center', color: waste > 0 ? '#b45309' : '#059669', fontWeight: 'bold' }}>
                {waste > 0 ? `${waste} mm (${((waste / W) * 100).toFixed(1)}%)` : '0 mm (Zero Waste) ✓'}
              </td>
              <td style={{ border: '1px solid #bbb', padding: '5px 8px' }} colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    )
  }

  const combinedWaste = result.waste1 + result.waste2
  const combinedWastePct = ((combinedWaste / (2 * W)) * 100).toFixed(1)
  const totalPieces =
    result.pass1.reduce((s, r) => s + r.qty, 0) +
    result.pass2.reduce((s, r) => s + r.qty, 0)

  return (
    <div className="print-view" style={{ fontFamily: 'Arial, sans-serif', fontSize: '11pt', color: '#111', lineHeight: 1.4 }}>

      {/* ── Document Header ── */}
      <div style={{ borderBottom: '3px solid #1e3a5f', paddingBottom: 10, marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '18pt', fontWeight: 'bold', color: '#1e3a5f', letterSpacing: 1 }}>
              COIL SLITTING ORDER
            </div>
            <div style={{ fontSize: '9pt', color: '#666', marginTop: 2 }}>
              Slitting Plan — For Supplier Use
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '10pt' }}>
            <div><strong>Date:</strong> {meta.date || today}</div>
            {meta.jobRef    && <div><strong>Job Ref:</strong> {meta.jobRef}</div>}
            {meta.supplier  && <div><strong>Supplier:</strong> {meta.supplier}</div>}
          </div>
        </div>
      </div>

      {/* ── Mother Coil Specs ── */}
      <div style={{ background: '#f0f4f8', border: '1px solid #bbb', borderRadius: 4, padding: '8px 12px', marginBottom: 16, fontSize: '10pt' }}>
        <strong style={{ fontSize: '10pt', textTransform: 'uppercase', letterSpacing: 0.5 }}>Mother Coil Specifications</strong>
        <div style={{ display: 'flex', gap: 32, marginTop: 6, flexWrap: 'wrap' }}>
          <span><strong>Width:</strong> {W} mm</span>
          {totalWeight > 0 && <span><strong>Total Weight:</strong> {(totalWeight / 1000).toFixed(3)} t ({totalWeight.toLocaleString()} kg)</span>}
          {thickness > 1 && <span><strong>Thickness:</strong> {thickness} mm</span>}
          {coilLength > 0 && <span><strong>Est. Length:</strong> {coilLength.toFixed(0)} m</span>}
          {halfWeight > 0 && <span><strong>Per-Pass Weight:</strong> {(halfWeight / 1000).toFixed(3)} t</span>}
        </div>
      </div>

      {/* ── Instructions ── */}
      <div style={{ fontSize: '9pt', color: '#444', marginBottom: 14, padding: '6px 10px', border: '1px dashed #bbb', borderRadius: 4 }}>
        <strong>Instructions:</strong> The mother coil is to be slit in <strong>two passes</strong> (Pass 1 = first half of coil length, Pass 2 = second half).
        Widths marked <em>Fill</em> are additional pieces added to minimize waste — produce if material allows.
        All weights shown are per individual slit coil piece.
      </div>

      {/* ── Pass 1 ── */}
      <PassTable label="PASS 1 — FIRST HALF OF COIL" slits={result.pass1} passWeight={halfWeight} />

      {/* ── Pass 2 ── */}
      <PassTable label="PASS 2 — SECOND HALF OF COIL" slits={result.pass2} passWeight={halfWeight} />

      {/* ── Combined Summary ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ background: '#1e3a5f', color: '#fff', padding: '6px 10px', fontWeight: 'bold', fontSize: '10pt' }}>
          COMBINED SUMMARY — BOTH PASSES
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt' }}>
          <thead>
            <tr style={{ background: '#f0f4f8' }}>
              {['Width (mm)', 'Pass 1 Qty', 'Pass 2 Qty', 'Total Qty', 'Wt / Piece', 'Status'].map(h => (
                <th key={h} style={{ border: '1px solid #bbb', padding: '5px 8px', textAlign: 'center' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requirements.filter(r => Number(r.width) > 0).map((r, i) => {
              const p1 = result.pass1.find(s => s.id === r.id)
              const p2 = result.pass2.find(s => s.id === r.id)
              const q1 = p1?.qty || 0
              const q2 = p2?.qty || 0
              const total = q1 + q2
              if (total === 0) return null
              const pieceWt = halfWeight > 0 ? (Math.round(Number(r.width)) / W) * halfWeight : 0
              const over = pieceWt > 3000
              return (
                <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ border: '1px solid #bbb', padding: '4px 8px', textAlign: 'center', fontWeight: 'bold' }}>{r.width}</td>
                  <td style={{ border: '1px solid #bbb', padding: '4px 8px', textAlign: 'center' }}>{q1 || '—'}</td>
                  <td style={{ border: '1px solid #bbb', padding: '4px 8px', textAlign: 'center' }}>{q2 || '—'}</td>
                  <td style={{ border: '1px solid #bbb', padding: '4px 8px', textAlign: 'center', fontWeight: 'bold' }}>{total}</td>
                  <td style={{ border: '1px solid #bbb', padding: '4px 8px', textAlign: 'center', color: over ? '#c00' : '#000' }}>
                    {pieceWt > 0 ? (pieceWt >= 1000 ? `${(pieceWt / 1000).toFixed(3)} t` : `${pieceWt.toFixed(0)} kg`) : '—'}
                    {over && ' ⚠'}
                  </td>
                  <td style={{ border: '1px solid #bbb', padding: '4px 8px', textAlign: 'center', color: over ? '#c00' : '#059669', fontWeight: 'bold' }}>
                    {over ? '⚠ Over 3 t' : '✓ OK'}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: '#e8f0fe', fontWeight: 'bold', fontSize: '10pt' }}>
              <td style={{ border: '1px solid #bbb', padding: '5px 8px', textAlign: 'center' }}>TOTAL</td>
              <td style={{ border: '1px solid #bbb', padding: '5px 8px', textAlign: 'center' }}>{result.pass1.reduce((s,r)=>s+r.qty,0)} pcs</td>
              <td style={{ border: '1px solid #bbb', padding: '5px 8px', textAlign: 'center' }}>{result.pass2.reduce((s,r)=>s+r.qty,0)} pcs</td>
              <td style={{ border: '1px solid #bbb', padding: '5px 8px', textAlign: 'center' }}>{totalPieces} pcs</td>
              <td style={{ border: '1px solid #bbb', padding: '5px 8px' }} colSpan={2}></td>
            </tr>
            <tr style={{ background: '#fff8e1' }}>
              <td style={{ border: '1px solid #bbb', padding: '5px 8px', textAlign: 'center', color: '#888' }}>TOTAL WASTE</td>
              <td style={{ border: '1px solid #bbb', padding: '5px 8px', textAlign: 'center', color: '#888' }}>{result.waste1} mm</td>
              <td style={{ border: '1px solid #bbb', padding: '5px 8px', textAlign: 'center', color: '#888' }}>{result.waste2} mm</td>
              <td style={{ border: '1px solid #bbb', padding: '5px 8px', textAlign: 'center', fontWeight: 'bold', color: '#b45309' }}>{combinedWaste} mm ({combinedWastePct}%)</td>
              <td style={{ border: '1px solid #bbb', padding: '5px 8px' }} colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── Notes ── */}
      {meta.notes && (
        <div style={{ border: '1px solid #bbb', borderRadius: 4, padding: '8px 12px', marginBottom: 20, fontSize: '10pt' }}>
          <strong>Notes / Remarks:</strong><br />
          <span style={{ color: '#333' }}>{meta.notes}</span>
        </div>
      )}

      {/* ── Signature Area ── */}
      <div style={{ borderTop: '1px solid #bbb', paddingTop: 16, marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, fontSize: '10pt' }}>
          {[['Prepared By', ''], ['Approved By', ''], ['Supplier Acknowledged', '']].map(([label]) => (
            <div key={label} style={{ flex: 1 }}>
              <div style={{ borderBottom: '1px solid #555', height: 36, marginBottom: 4 }}></div>
              <div style={{ fontSize: '9pt', color: '#555', textAlign: 'center' }}>{label}</div>
              <div style={{ fontSize: '8pt', color: '#999', textAlign: 'center', marginTop: 2 }}>Name / Signature / Date</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ marginTop: 14, fontSize: '8pt', color: '#999', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: 6 }}>
        Generated by Coil Slitting Optimizer · {today}
        {meta.jobRef && ` · Job Ref: ${meta.jobRef}`}
      </div>
    </div>
  )
}
