import { videos } from "@/lib/data";

export function Videos() {
  return (
    <>
      <div className="section-title">
        <h2>فيديوهات</h2>
        <a className="more" href="#">
          كل الفيديوهات ←
        </a>
      </div>
      <div className="vrow">
        {videos.map((v) => (
          <a className="art" href="#" key={v.id}>
            <div className="thumb" style={{ background: v.gradient }}>
              <div className="play">
                <span />
              </div>
              <span className="dur">{v.duration}</span>
            </div>
            <div className="body">
              <h3 style={{ fontSize: 14 }}>{v.title}</h3>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
