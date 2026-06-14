export default function WikiLoading() {
  return (
    <div style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
      {/* Header skeleton */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ height: 12, width: 160, background: 'rgba(var(--ink-rgb),0.08)', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 36, width: 100, background: 'rgba(var(--ink-rgb),0.08)', borderRadius: 8, marginBottom: 6 }} />
        <div style={{ height: 14, width: 200, background: 'rgba(var(--ink-rgb),0.06)', borderRadius: 4 }} />
      </div>

      {/* Filter bar skeleton */}
      <div style={{
        background: 'var(--surface)', borderRadius: 18, padding: 20, marginBottom: 18,
        border: '1px solid rgba(var(--ink-rgb),0.06)',
      }}>
        <div style={{ height: 18, width: '100%', background: 'rgba(var(--ink-rgb),0.06)', borderRadius: 6 }} />
      </div>

      {/* List skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            display: 'flex', gap: 18, alignItems: 'center',
            padding: '18px 20px', borderRadius: 18,
            background: 'var(--surface)', border: '1px solid rgba(var(--ink-rgb),0.06)',
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(var(--ink-rgb),0.08)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <div style={{ height: 20, width: 80, background: 'rgba(var(--ink-rgb),0.08)', borderRadius: 999 }} />
                <div style={{ height: 20, width: 70, background: 'rgba(var(--ink-rgb),0.06)', borderRadius: 999 }} />
              </div>
              <div style={{ height: 18, width: '60%', background: 'rgba(var(--ink-rgb),0.08)', borderRadius: 6, marginBottom: 6 }} />
              <div style={{ height: 14, width: '80%', background: 'rgba(var(--ink-rgb),0.06)', borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  )
}
