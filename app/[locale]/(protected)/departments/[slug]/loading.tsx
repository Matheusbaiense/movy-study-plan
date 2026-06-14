export default function DepartmentLoading() {
  return (
    <div>
      {/* Breadcrumb skeleton */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <div
          style={{
            width: 50,
            height: 14,
            borderRadius: 4,
            background: 'rgba(var(--ink-rgb),0.08)',
          }}
        />
        <div
          style={{
            width: 80,
            height: 14,
            borderRadius: 4,
            background: 'rgba(var(--ink-rgb),0.06)',
          }}
        />
      </div>

      {/* Hero skeleton */}
      <div
        style={{
          height: 200,
          borderRadius: 20,
          background:
            'linear-gradient(135deg, rgba(var(--ink-rgb),0.1), rgba(var(--ink-rgb),0.06))',
          marginBottom: 28,
          padding: '36px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 140,
            height: 12,
            borderRadius: 4,
            background: 'rgba(var(--ink-rgb),0.08)',
          }}
        />
        <div
          style={{
            width: 260,
            height: 32,
            borderRadius: 6,
            background: 'rgba(var(--ink-rgb),0.1)',
          }}
        />
        <div
          style={{
            width: 380,
            height: 14,
            borderRadius: 4,
            background: 'rgba(var(--ink-rgb),0.06)',
          }}
        />
        <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div
                style={{
                  width: 40,
                  height: 22,
                  borderRadius: 4,
                  background: 'rgba(var(--ink-rgb),0.08)',
                }}
              />
              <div
                style={{
                  width: 60,
                  height: 10,
                  borderRadius: 3,
                  background: 'rgba(var(--ink-rgb),0.06)',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Grid skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 24,
          alignItems: 'flex-start',
        }}
      >
        {/* Left: content cards skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2].map((n) => (
            <div
              key={n}
              style={{
                background: 'var(--surface)',
                borderRadius: 16,
                border: '1px solid rgba(var(--ink-rgb),0.06)',
                boxShadow: '0 1px 2px rgba(var(--ink-rgb),0.04)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: 'rgba(var(--ink-rgb),0.1)',
                  }}
                />
                <div
                  style={{
                    width: 120,
                    height: 14,
                    borderRadius: 4,
                    background: 'rgba(var(--ink-rgb),0.08)',
                  }}
                />
              </div>
              <div style={{ borderTop: '1px solid rgba(var(--ink-rgb),0.06)' }}>
                {[1, 2, 3].map((row) => (
                  <div
                    key={row}
                    style={{
                      padding: '12px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      borderBottom:
                        row < 3
                          ? '1px solid rgba(var(--ink-rgb),0.06)'
                          : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 999,
                        background: 'rgba(var(--ink-rgb),0.08)',
                      }}
                    />
                    <div
                      style={{
                        flex: 1,
                        height: 14,
                        borderRadius: 4,
                        background: 'rgba(var(--ink-rgb),0.07)',
                      }}
                    />
                    <div
                      style={{
                        width: 50,
                        height: 12,
                        borderRadius: 4,
                        background: 'rgba(var(--ink-rgb),0.05)',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right: sidebar skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 18,
              padding: '16px 18px',
              border: '1px solid rgba(var(--ink-rgb),0.06)',
              boxShadow: '0 1px 2px rgba(var(--ink-rgb),0.04)',
            }}
          >
            <div
              style={{
                width: 60,
                height: 10,
                borderRadius: 3,
                background: 'rgba(var(--ink-rgb),0.08)',
                marginBottom: 14,
              }}
            />
            {[1, 2, 3].map((m) => (
              <div
                key={m}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '6px 0',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    background: 'rgba(var(--ink-rgb),0.08)',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      width: '70%',
                      height: 12,
                      borderRadius: 3,
                      background: 'rgba(var(--ink-rgb),0.08)',
                      marginBottom: 4,
                    }}
                  />
                  <div
                    style={{
                      width: '50%',
                      height: 10,
                      borderRadius: 3,
                      background: 'rgba(var(--ink-rgb),0.05)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              height: 44,
              borderRadius: 12,
              background: 'rgba(var(--ink-rgb),0.08)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
