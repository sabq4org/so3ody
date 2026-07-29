import type { AnalysisResult, Level } from "@/lib/analysis";

const levelLabel: Record<Level, string> = { high: "عالية", medium: "متوسطة", low: "منخفضة" };

function List({ items }: { items: string[] }) {
  return (
    <ul className="av-list">
      {items.map((s, i) => (
        <li key={i}>{s}</li>
      ))}
    </ul>
  );
}

export function AnalysisView({ result }: { result: AnalysisResult }) {
  return (
    <div className="adm-ai-body">
      {result.executiveSummary && <div className="av-summary">{result.executiveSummary}</div>}

      {!result.verification.allSupported && (
        <div className="adm-note warn">
          بعض الأرقام في التحليل لم تُطابق البيانات المجمّعة، فعُلّمت بـ«رقم غير مؤكد» وخُفّضت ثقتها.
        </div>
      )}
      {result.smallSample && <div className="adm-note warn">عيّنة صغيرة — اعتبر النتائج مؤشّرة لا قاطعة.</div>}

      {(result.satisfaction.positives.length > 0 || result.satisfaction.negatives.length > 0) && (
        <div className="av-two">
          <div className="av-block">
            <h4>نقاط الرضا</h4>
            <List items={result.satisfaction.positives} />
          </div>
          <div className="av-block">
            <h4>نقاط عدم الرضا</h4>
            <List items={result.satisfaction.negatives} />
          </div>
        </div>
      )}

      {result.trends.length > 0 && (
        <div className="av-block">
          <h4>أبرز التوجهات والأنماط</h4>
          <List items={result.trends} />
        </div>
      )}

      {result.recommendations.length > 0 && (
        <div className="av-block">
          <h4>أولويات التطوير المقترحة</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {result.recommendations.map((r, i) => (
              <div className="av-rec" key={i}>
                <div className="top">
                  <h5>{r.title}</h5>
                  <div className="av-badges">
                    <span className={`chip ${r.impact}`}>الأثر: {levelLabel[r.impact]}</span>
                    <span className={`chip ${r.confidence}`}>الثقة: {levelLabel[r.confidence]}</span>
                    {!r.verified && <span className="chip unverified">رقم غير مؤكد</span>}
                  </div>
                </div>
                <p>{r.rationale}</p>
                {r.evidence.length > 0 && (
                  <div className="av-evidence">
                    {r.evidence.map((e, j) => (
                      <span key={j}>
                        {e.metric}: {e.value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {result.topRequests.length > 0 && (
        <div className="av-block">
          <h4>الأكثر طلبًا</h4>
          <div className="av-evidence">
            {result.topRequests.map((t, i) => (
              <span key={i}>
                {t.feature}
                {!t.verified ? " (غير مؤكد)" : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.segments.length > 0 && (
        <div className="av-block">
          <h4>اختلافات بين الشرائح</h4>
          <List items={result.segments} />
        </div>
      )}

      {result.quotes.length > 0 && (
        <div className="av-block">
          <h4>اقتباسات مجهولة من الإجابات</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {result.quotes.map((q, i) => (
              <div className="av-quote" key={i}>
                {q}
              </div>
            ))}
          </div>
        </div>
      )}

      {result.caveats.length > 0 && (
        <div className="av-block">
          <h4>تحفّظات إحصائية</h4>
          <ul className="av-list">
            {result.caveats.map((s, i) => (
              <li key={i} className="av-caveat">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.followUpQuestions.length > 0 && (
        <div className="av-block">
          <h4>أسئلة متابعة مقترحة للاستفتاء القادم</h4>
          <List items={result.followUpQuestions} />
        </div>
      )}

      <div className="adm-ai-disclaimer">
        توصيات الذكاء الاصطناعي أداة مساعدة لاتخاذ القرار، وليست حقيقة قطعية — راجعها قبل الاعتماد.
      </div>
    </div>
  );
}
