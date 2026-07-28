export function UtilityBar() {
  return (
    <div className="ubar">
      <div className="wrap">
        <div className="ubar-l">
          <span className="date">الثلاثاء · 28 يوليو 2026</span>
          <span className="sep" />
          <span className="pill-live">
            <span className="d" />3 مباريات مباشرة
          </span>
        </div>
        <div className="ubar-r">
          <a href="#">عن الموقع</a>
          <span className="sep" />
          <a href="#">اعلن معنا</a>
          <span className="sep" />
          <a href="#">اتصل بنا</a>
        </div>
      </div>
    </div>
  );
}
