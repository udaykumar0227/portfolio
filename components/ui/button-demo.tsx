'use client'

import ButtonWithIcon from "@/components/ui/button-with-icon"

export default function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-4 p-8 bg-black/60 rounded-xl border border-white/10">
      <ButtonWithIcon text="Let's Collaborate" />
      <ButtonWithIcon text="Get in touch" href="#contact" />
    </div>
  )
}
