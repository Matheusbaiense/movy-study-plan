import type { TableBlock as TableBlockType } from '@/types/blocks'

export function TableBlock({ block }: { block: TableBlockType }) {
  return (
    <div style={{
      margin: '20px 0', overflowX: 'auto', borderRadius: 10,
      border: '1px solid rgba(3,24,45,0.1)',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {block.headers.map((h, i) => (
              <th
                key={i}
                style={{
                  background: '#03182D', color: '#F9F9F9',
                  padding: '10px 14px', textAlign: 'left',
                  fontWeight: 600, fontSize: 12, letterSpacing: '0.04em',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(3,24,45,0.02)' }}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    padding: '9px 14px', color: '#03182D',
                    borderBottom: '1px solid rgba(3,24,45,0.05)',
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
