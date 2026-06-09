'use client'

export default function ModalError({ message }: { message: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '24px',
        fontFamily: 'sans-serif',
        textAlign: 'center',
        gap: '12px',
      }}
    >
      <p style={{ color: '#6b7280', margin: 0 }}>{message}</p>
      <button
        onClick={() => window.parent.postMessage('unchurnly:close', '*')}
        style={{
          background: 'none',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          padding: '6px 16px',
          cursor: 'pointer',
          color: '#374151',
        }}
      >
        Close
      </button>
    </div>
  )
}
