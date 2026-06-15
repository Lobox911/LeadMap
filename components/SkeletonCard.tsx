export default function SkeletonCard() {
  return (
    <div className="lead-card" style={{ animation: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <div className="shimmer" style={{ height: 14, borderRadius: 99, width: '45%' }} />
          <div className="shimmer" style={{ height: 13, borderRadius: 6, width: '70%' }} />
          <div className="shimmer" style={{ height: 10, borderRadius: 4, width: '35%' }} />
        </div>
        <div className="shimmer" style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 10, borderTop: '1px solid #1e2235' }}>
        <div className="shimmer" style={{ height: 10, borderRadius: 4, width: '90%' }} />
        <div className="shimmer" style={{ height: 10, borderRadius: 4, width: '60%' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, marginTop: 10, borderTop: '1px solid #1e2235' }}>
        <div className="shimmer" style={{ height: 16, borderRadius: 99, width: 80 }} />
        <div className="shimmer" style={{ height: 20, borderRadius: 6, width: 36 }} />
      </div>
    </div>
  )
}