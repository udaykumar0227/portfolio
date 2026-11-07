'use client'

import { NeuralNoise } from "@/components/ui/neural-noise"

export default function NeuralNoiseDemo() {
  return (
    <div className="relative flex min-h-[500px] w-full flex-col items-center justify-center overflow-hidden bg-black/[0.96] rounded-2xl border border-white/10">
      <NeuralNoise color={[0.85, 1.0, 0.26]} opacity={0.65} speed={0.0012} />
      <div className="relative z-10 flex flex-col items-center gap-3 p-8 text-center backdrop-blur-md bg-black/40 rounded-xl border border-white/10 shadow-2xl">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">
          WebGL Background Shader
        </span>
        <h2 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-neutral-100 to-neutral-400">
          Neural Noise
        </h2>
        <p className="max-w-md text-neutral-300 text-sm md:text-base">
          Interactive organic noise field reacting in real-time to pointer movements and device orientation.
        </p>
      </div>
    </div>
  )
}
