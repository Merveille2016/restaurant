// Self-hosted clip from public/video. Nothing is downloaded until the visitor
// presses play (preload="none"); the poster is a regular image in public/img.
export default function VideoCard({ src, poster, title, fallback }) {
  return (
    <figure className="video-card">
      <video controls playsInline preload="none" poster={poster} width="540" height="960">
        <source src={src} type="video/mp4" />
        {fallback}
      </video>
      <figcaption className="video-caption">{title}</figcaption>
    </figure>
  );
}
