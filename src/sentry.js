// Error reporting. Inert unless VITE_SENTRY_DSN is set at build time,
// so local dev and any build without the key behave exactly as before.
//
// Free tier is 5k errors/month across ALL apps, so this is deliberately
// stingy: errors only, no performance tracing, no session replay.

const APP_NAME = 'coil-slitter'

// Coil Slitter is a pure offline calculator — it makes no network writes,
// so a fetch failure here is browser/extension noise and safe to drop.
//
// ⚠ SET THIS TO false IN EVERY FIREBASE APP (welder, plating, fitting,
// orders, plastic, dashboard, attendance). There, a burst of fetch
// failures IS the outage signal — dropping it would keep Sentry silent
// on exactly the event we are installing it to catch.
const DROP_NETWORK_ERRORS = true

const NETWORK_NOISE = [
  'Failed to fetch',
  'NetworkError when attempting to fetch resource',
  'Load failed',
]

export async function initErrorReporting() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  // Loaded dynamically so inert builds don't ship ~70KB of SDK to a
  // worker's phone over a factory-floor connection.
  if (!dsn) return

  const Sentry = await import('@sentry/react')

  let sentThisSession = 0

  Sentry.init({
    dsn,
    // Tags every event so one shared Sentry project can serve all 11 apps.
    initialScope: { tags: { app: APP_NAME } },
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    ignoreErrors: [
      // Extensions and injected scripts on worker phones, not our bugs.
      'top.GLOBALS',
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      ...(DROP_NETWORK_ERRORS ? NETWORK_NOISE : []),
    ],
    // A crash loop on one phone could burn the whole monthly quota,
    // so cap what any single session can send.
    maxBreadcrumbs: 20,
    beforeSend(event) {
      sentThisSession += 1
      return sentThisSession > 10 ? null : event
    },
  })
}
