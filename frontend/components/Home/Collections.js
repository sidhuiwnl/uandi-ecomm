"use client";

import Link from "next/link";

const sections = [
  {
    key: "kids",
    title: "Kids",
    description: "Gentle care formulated for little, sensitive skin.",
    href: "/collections/2",
    accent: "#FFD3D5",
  },
  {
    key: "teens",
    title: "Teens",
    description: "Targeted essentials to balance and protect changing teen skin.",
    href: "/collections/3",
    accent: "#FFC3C6",
  },
  {
    key: "adults",
    title: "Adults",
    description: "Advanced formulations for everyday skin health and glow.",
    href: "/collections/4",
    accent: "#FFB3B7",
  },
  {
    key: "treatment",
    title: "Treatment",
    description: "Clinical-grade treatments curated for immediate results .",
    href: "/collections/treatment",
    accent: "#FFA3A9",
  },
];

export default function Collections() {
  return (
    <section id="collections" className="w-full py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}

         <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 tracking-tight">
            Explore Our Collections
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Discover curated skincare ranges designed for every age and concern.
          </p>
        </div>


        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sections.map((s) => (
            <Link key={s.key} href={s.href} className="group">
              <div
                className="relative rounded-2xl overflow-hidden border shadow-sm transition-all duration-300 group-hover:shadow-lg"
                style={{
                  borderColor: "#FFD3D5",
                  background:
                    `linear-gradient(135deg, ${s.accent} 0%, #FFD3D5 40%, #ffffff 100%)`,
                }}
              >
                {/* Accent blob */}
                <div
                  className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-60 blur-2xl"
                  style={{ backgroundColor: "#D8234B" }}
                />

                {/* Content */}
                <div className="relative p-6 flex flex-col min-h-[200px]">
                  <div className="flex-1">
                    <h3
                      className="text-xl font-semibold mb-2 group-hover:translate-y-0.5 transition-transform"
                      style={{ color: "#D8234B" }}
                    >
                      {s.title}
                    </h3>
                    <p className="text-sm" style={{ color: "#5b1c27" }}>
                      {s.description}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="mt-6">
                    <span
                      className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                      style={{
                        backgroundColor: "#D8234B",
                        color: "#FFFFFF",
                      }}
                    >
                      Shop Now
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="w-4 h-4"
                      >
                        <path d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Hover overlay */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(216,35,75,0.06) 0%, rgba(216,35,75,0.12) 100%)",
                  }}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}