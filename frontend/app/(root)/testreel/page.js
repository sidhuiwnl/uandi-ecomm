export default function VideoCard() {
  const video = {
    title: "Sample Product Reel",
    product_name: "Elegant Tee",
    google_drive_url: "https://drive.google.com/file/d/14XbnckxK3FpgIWBLBIyV4uDGd83ejF8Z/view?usp=drive_link",
  };

  // Convert Google Drive share link to embeddable iframe link
  const getEmbedLink = (url) => {
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch) {
      return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
    }
    return null;
  };

  const embedUrl = getEmbedLink(video.google_drive_url);

  return (
    <div className="group relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition">
      {embedUrl ? (
        <div className="relative w-full aspect-[9/16] bg-black">
          <iframe
            className="w-full h-full"
            src={embedUrl}
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        </div>
      ) : (
        <div className="bg-gray-300 h-48 flex items-center justify-center">
          Invalid Video
        </div>
      )}
      <div className="p-3 bg-white">
        <h3 className="font-semibold">{video.title || 'Untitled Reel'}</h3>
        <p className="text-sm text-gray-600">Product: {video.product_name}</p>
      </div>
    </div>
  );
}
