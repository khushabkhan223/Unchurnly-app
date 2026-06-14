import Navbar from './(landing)/Navbar'
import Hero from './(landing)/Hero'
import SocialProofBar from './(landing)/SocialProofBar'
import Problem from './(landing)/Problem'
import HowItWorks from './(landing)/HowItWorks'
import Pricing from './(landing)/Pricing'
import Guarantee from './(landing)/Guarantee'
import Comparison from './(landing)/Comparison'
import CTA from './(landing)/CTA'
import Footer from './(landing)/Footer'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <Hero />
      <SocialProofBar />
      <Problem />
      <HowItWorks />
      <Pricing />
      <Guarantee />
      <Comparison />
      <CTA />
      <Footer />
    </main>
  )
}
