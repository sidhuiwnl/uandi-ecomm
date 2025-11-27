export default function AboutPage() {
	return (
		<main className="min-h-screen bg-[#FCFBF5]">
			{/* Hero */}
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 bg-linear-to-r from-[#D8234B] to-[#FFD3D5] opacity-10" />
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
						About U&amp;I Naturals
					</h1>
					<p className="mt-4 max-w-2xl text-base md:text-lg text-gray-600">
						Science-backed, nature-powered skincare crafted for every stage of life. We create
						clean, effective, and joyful routines you can trust.
					</p>
				</div>
			</section>

			{/* Mission */}
			<section className="py-12 md:py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-center">
					<div>
						<h2 className="text-2xl md:text-3xl font-bold text-gray-900">
							Our Mission
						</h2>
						<p className="mt-4 text-gray-600 leading-relaxed">
							At U&amp;I Naturals, our mission is simple: make high-quality skincare accessible
							and delightful. We blend gentle botanicals with clinically trusted actives to
							deliver visible results—without compromising safety or transparency.
						</p>
						<div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-[#D8234B]">
							Trusted Care, Thoughtful Science
						</div>
					</div>
					<div className="relative w-full h-56 md:h-72 rounded-2xl border border-[#FFD3D5] bg-white">
						<div className="absolute -top-6 -right-6 w-40 h-40 rounded-full bg-[#FFD3D5] opacity-60 blur-2xl" />
						<div className="absolute bottom-6 left-6 right-6 p-6 rounded-xl bg-linear-to-r from-[#D8234B] to-[#FFD3D5] text-white shadow">
							Made for Kids • Teens • Adults • Treatment
						</div>
					</div>
				</div>
			</section>

			{/* Values */}
			<section className="py-12 md:py-16 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">What We Stand For</h3>
					<div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="rounded-2xl border border-[#FFD3D5] p-6 bg-[#FFFDFB]">
							<h4 className="font-semibold text-gray-900" style={{color:'#D8234B'}}>Clean &amp; Safe</h4>
							<p className="mt-2 text-gray-600 text-sm">
								Dermatologist-friendly, toxin-conscious formulas. No harsh additives—just what skin needs.
							</p>
						</div>
						<div className="rounded-2xl border border-[#FFD3D5] p-6 bg-[#FFFDFB]">
							<h4 className="font-semibold text-gray-900" style={{color:'#D8234B'}}>Proven Results</h4>
							<p className="mt-2 text-gray-600 text-sm">
								Effective actives at the right strengths for visible, feel-good routines.
							</p>
						</div>
						<div className="rounded-2xl border border-[#FFD3D5] p-6 bg-[#FFFDFB]">
							<h4 className="font-semibold text-gray-900" style={{color:'#D8234B'}}>Honest &amp; Transparent</h4>
							<p className="mt-2 text-gray-600 text-sm">
								Clear labels, clear benefits. We share the why behind every ingredient.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Ingredients */}
			<section className="py-12 md:py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-start">
					<div>
						<h3 className="text-2xl md:text-3xl font-bold text-gray-900">Consciously Curated Ingredients</h3>
						<ul className="mt-4 space-y-3 text-gray-700 text-sm leading-relaxed">
							<li><strong className="text-gray-900">Botanical heroes:</strong> aloe, calendula, oats—picked for gentleness and balance.</li>
							<li><strong className="text-gray-900">Derm-favorites:</strong> niacinamide, ceramides, vitamin C—used at safe, effective levels.</li>
							<li><strong className="text-gray-900">Formulated for all:</strong> kids, teens, and adults—tailored to real skin needs.</li>
						</ul>
					</div>
					<div className="relative w-full h-56 md:h-72 rounded-2xl border border-[#FFD3D5] bg-white">
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="px-6 py-3 rounded-xl bg-linear-to-r from-[#D8234B] to-[#FFD3D5] text-white text-sm shadow">
								Kind to Skin • Cruelty-Free • No Parabens • No Sulphates
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Promise */}
			<section className="py-12 md:py-16 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h3 className="text-2xl md:text-3xl font-bold text-gray-900">The U&amp;I Promise</h3>
					<p className="mt-4 max-w-2xl mx-auto text-gray-600">
						We promise routines that respect the skin barrier, routines that feel good,
						and routines that actually fit into busy lives.
					</p>
					<div className="mt-6 inline-flex items-center gap-2 px-5 py-2 rounded-xl text-white bg-linear-to-r from-[#D8234B] to-[#FFD3D5]">
						Made with Care • Backed by Science
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="py-12 md:py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="rounded-2xl border border-[#FFD3D5] p-6 md:p-10 bg-[#FFFDFB] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
						<div>
							<h4 className="text-xl md:text-2xl font-bold text-gray-900">Ready to Curate Your Routine?</h4>
							<p className="mt-2 text-gray-600 text-sm max-w-xl">
								Explore collections designed for Kids, Teens, and Adults—or try our Treatment range for targeted care.
							</p>
						</div>
						<a
							href="/products"
							className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-white bg-[#D8234B] hover:opacity-95 transition"
						>
							Shop All
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
								<path d="M5 12h14M13 5l7 7-7 7" />
							</svg>
						</a>
					</div>
				</div>
			</section>
		</main>
	);
}
