export function CardSkeleton() {
  return (
    <div className="public-wrap">
      <div className="public-col">
        <div className="panel card-face">
          <div className="sk-banner shimmer" />
          <div className="card-inner">
            <div className="sk-avatar shimmer" />
            <div className="sk-col">
              <div className="sk-name shimmer" />
              <div className="sk-role shimmer" />
            </div>
            <div className="sk-col" style={{ gap: 8, marginTop: 20 }}>
              <div className="sk-line shimmer" />
              <div className="sk-line shimmer" />
              <div className="sk-line shimmer" style={{ width: '70%' }} />
            </div>
            <div className="sk-pills">
              <div className="sk-pill shimmer" style={{ width: 78 }} />
              <div className="sk-pill shimmer" style={{ width: 64 }} />
              <div className="sk-pill shimmer" style={{ width: 92 }} />
            </div>
            <div className="sk-rows">
              <div className="sk-row shimmer" />
              <div className="sk-row shimmer" />
              <div className="sk-row shimmer" />
            </div>
            <div className="sk-cta shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
