// app/not-found.js
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-4xl font-extrabold text-white tracking-tight">
        404 | Page Not Found
      </h1>

      <p className="text-gray-400 text-lg mt-4">
        Oops! This page is <span className="text-white">under construction</span>.
      </p>

      <div className="mt-10">
        <Image
          src="/pixelatedlogo.png"
          alt="Under Construction"
          width={140}
          height={140}
          className="opacity-90"
          priority
        />
      </div>

      {/* <Link
        href="/"
        className="mt-10 inline-block text-sm font-medium text-white border border-white/20 px-6 py-2.5 rounded-full hover:bg-white hover:text-black transition-colors duration-200"
      >
        Back to Home
      </Link> */}

      <p className="text-xs text-white mt-16">
        &copy; {new Date().getFullYear()} The Pixelated Café. All rights reserved.
      </p>
    </div>
  );
}
