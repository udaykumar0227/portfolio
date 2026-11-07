'use client'

import { SplineScene } from "@/components/ui/splite"
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"

export function PortfolioHero() {
  return (
    <Card className="w-full min-h-[560px] bg-black/[0.96] border border-white/10 relative overflow-hidden rounded-2xl shadow-2xl">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        size={350}
      />

      <div className="flex flex-col lg:flex-row h-full">
        {/* Left content */}
        <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-400 w-fit mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Available for select projects &middot; 2026
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
            <span className="block bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
              Gudla Uday Kumar
            </span>
          </h1>

          <p className="mt-4 text-base md:text-lg text-neutral-300 max-w-lg leading-relaxed">
            Computer Science graduate &amp; M.Tech Data Science scholar building
            scalable web applications, robust backend systems, and cloud solutions
            with Next.js, Python &amp; AWS.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#contact"
              className="px-6 py-3 rounded-lg bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition"
            >
              Get in touch &rarr;
            </a>
            <a
              href="#services"
              className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition"
            >
              Explore work &amp; skills
            </a>
          </div>

          <div className="mt-8 flex items-center gap-4 text-sm text-neutral-400">
            <a href="https://github.com/udaykumar0227" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              GitHub
            </a>
            <span>&middot;</span>
            <a href="https://www.linkedin.com/in/uday-kumar-514441246/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              LinkedIn
            </a>
            <span>&middot;</span>
            <a href="mailto:gudlaudaykumar0227@gmail.com" className="hover:text-white transition">
              Email
            </a>
          </div>
        </div>

        {/* Right 3D Spline Scene */}
        <div className="flex-1 min-h-[380px] lg:min-h-full relative">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  )
}
