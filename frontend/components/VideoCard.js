export default function VideoCard({ video }){
  return (
    <div className="group relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition">
      <div className="relative w-full aspect-[9/16] bg-black">
        <video className="w-full h-full object-cover" src={video.reel_url} autoPlay muted loop playsInline controlsList="nodownload"/>
      </div>
      <div className="p-3 bg-white">
        <h3 className="font-semibold">{video.title || 'Untitled'}</h3>
        <p className="text-sm text-gray-600">Product: {video.product_name}</p>
      </div>
    </div>
  );
}