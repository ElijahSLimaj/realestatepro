import './App.css'
import { LanguageProvider } from './context/LanguageContext'
import { siteConfig } from './data/siteConfig'
import Header from './components/Header'
import Hero from './components/Hero'
import FeaturedProperties from './components/FeaturedProperties'
import Services from './components/Services'
import Neighborhoods from './components/Neighborhoods'
import About from './components/About'
import Testimonials from './components/Testimonials'
import HomeValuation from './components/HomeValuation'
import MortgageCalculator from './components/MortgageCalculator'
import Blog from './components/Blog'
import ChatWidget from './components/ChatWidget'
import Footer from './components/Footer'

function App() {
  return (
    <LanguageProvider defaultLang={siteConfig.defaultLang}>
      <div className="min-h-screen">
        <Header />
        <main>
          <Hero />
          <FeaturedProperties />
          <Services />
          <Neighborhoods />
          <About />
          <Testimonials />
          <HomeValuation />
          <MortgageCalculator />
          <Blog />
        </main>
        <Footer />
        <ChatWidget />
      </div>
    </LanguageProvider>
  )
}

export default App
