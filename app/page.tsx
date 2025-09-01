import { Hero } from "@/components/hero"
import { FeaturedCalculators } from "@/components/featured-calculators"
import { MarketAlerts } from "@/components/market-alerts"

export default function HomePage() {
  return (
    <main>
      <Hero />
      <FeaturedCalculators />
      <MarketAlerts />
    </main>
  )
}
