// Unbounded knapsack: find quantities of items that maximize total width used ≤ capacity
export function fillSpace(items, capacity) {
  const C = Math.round(capacity)
  if (C <= 0 || !items.length) return items.map(s => ({ ...s, qty: 0 }))

  const valid = items.filter(s => Math.round(Number(s.width)) > 0 && Math.round(Number(s.width)) <= C)
  if (!valid.length) return items.map(s => ({ ...s, qty: 0 }))

  const dp = new Array(C + 1).fill(null)
  dp[0] = -1

  for (let w = 1; w <= C; w++) {
    for (let i = 0; i < valid.length; i++) {
      const sw = Math.round(Number(valid[i].width))
      if (sw <= w && dp[w - sw] !== null) { dp[w] = i; break }
    }
  }

  let best = C
  while (best > 0 && dp[best] === null) best--

  const counts = new Map(valid.map(s => [s.id, 0]))
  let cur = best
  while (cur > 0 && dp[cur] !== -1) {
    const s = valid[dp[cur]]
    counts.set(s.id, (counts.get(s.id) || 0) + 1)
    cur -= Math.round(Number(s.width))
  }

  return items.map(s => ({ ...s, qty: counts.get(s.id) || 0 }))
}

// 0/1 Knapsack: optimally split required pieces across Pass 1 and Pass 2,
// then fill remaining space in each pass with flexible items.
export function splitIntoTwoPasses(requirements, W) {
  const W_ = Math.max(1, Math.round(Number(W)))

  const allValid = requirements.filter(r => Number(r.width) > 0)
  const reqItems = allValid.filter(r => Number(r.qty) > 0)
  const flexItems = allValid.filter(r => r.flexible)

  const totalReq = reqItems.reduce(
    (s, r) => s + Math.round(Number(r.width)) * Number(r.qty), 0
  )

  if (totalReq > 2 * W_) {
    return {
      error: `Required width (${totalReq} mm) exceeds 2 passes (2 × ${W_} mm = ${2 * W_} mm). Reduce quantities.`,
    }
  }

  // Expand required items into individual pieces for 0/1 knapsack
  const pieces = []
  reqItems.forEach(r => {
    const w = Math.round(Number(r.width))
    for (let i = 0; i < Number(r.qty); i++) pieces.push({ id: r.id, w })
  })

  const n = pieces.length
  const p1Req = new Map()
  const p2Req = new Map()

  if (n > 0) {
    // Build DP table: dp[i][w] = max total width using first i pieces with capacity w
    const dp = Array.from({ length: n + 1 }, () => new Array(W_ + 1).fill(0))

    for (let i = 1; i <= n; i++) {
      const pw = pieces[i - 1].w
      for (let w = 0; w <= W_; w++) {
        dp[i][w] = dp[i - 1][w]
        if (pw <= w && dp[i - 1][w - pw] + pw > dp[i][w])
          dp[i][w] = dp[i - 1][w - pw] + pw
      }
    }

    // Backtrack: which pieces go to Pass 1?
    const inPass1 = new Array(n).fill(false)
    let w = W_
    for (let i = n; i >= 1; i--) {
      const pw = pieces[i - 1].w
      if (w >= pw && dp[i][w] === dp[i - 1][w - pw] + pw) {
        inPass1[i - 1] = true
        w -= pw
      }
    }

    pieces.forEach((p, i) => {
      const m = inPass1[i] ? p1Req : p2Req
      m.set(p.id, (m.get(p.id) || 0) + 1)
    })
  }

  const calcUsed = (countsMap) =>
    [...countsMap.entries()].reduce((s, [id, q]) => {
      const r = requirements.find(x => x.id === id)
      return s + (r ? Math.round(Number(r.width)) * q : 0)
    }, 0)

  const used1Req = calcUsed(p1Req)
  const used2Req = calcUsed(p2Req)

  // Fill remaining space with flexible items
  const doFill = (space) => {
    if (space <= 0 || !flexItems.length) return new Map()
    const filled = fillSpace(flexItems.map(f => ({ ...f, qty: 0 })), space)
    const m = new Map()
    filled.forEach(s => { if (s.qty > 0) m.set(s.id, s.qty) })
    return m
  }

  const fill1 = doFill(W_ - used1Req)
  const fill2 = doFill(W_ - used2Req)

  const makePassResult = (passReq, passFill) =>
    requirements
      .filter(r => Number(r.width) > 0)
      .map(r => ({
        ...r,
        reqQty: passReq.get(r.id) || 0,
        fillQty: passFill.get(r.id) || 0,
        qty: (passReq.get(r.id) || 0) + (passFill.get(r.id) || 0),
      }))
      .filter(r => r.qty > 0)

  const pass1 = makePassResult(p1Req, fill1)
  const pass2 = makePassResult(p2Req, fill2)

  const used1 = pass1.reduce((s, r) => s + Math.round(Number(r.width)) * r.qty, 0)
  const used2 = pass2.reduce((s, r) => s + Math.round(Number(r.width)) * r.qty, 0)

  return { pass1, pass2, used1, used2, waste1: W_ - used1, waste2: W_ - used2, error: null }
}
