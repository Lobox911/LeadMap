export default function SkeletonCard() {
  return (
    <div style={{ background: 'white', border: '1px solid #e4e2e4', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <div className="shimmer" style={{ height: 16, borderRadius: 6, width: '55%' }} />
          <div className="shimmer" style={{ height: 12, borderRadius: 4, width: '38%' }} />
        </div>
        <div className="shimmer" style={{ width: 22, height: 22, borderRadius: '50%' }} />
      </div>
      <div className="shimmer" style={{ height: 26, borderRadius: 99, width: 100 }} />
    </div>
  )
}