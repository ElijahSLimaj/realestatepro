import './App.css'
import { Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import { SiteSettingsProvider, useSiteSettings } from './context/SiteSettingsContext'
import { AuthProvider } from './context/AuthContext'
import { TenantProvider, useTenant } from './context/TenantContext'
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
import AdminLayout from './pages/admin/AdminLayout'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import PropertiesList from './pages/admin/PropertiesList'
import PropertyForm from './pages/admin/PropertyForm'
import BlogList from './pages/admin/BlogList'
import BlogForm from './pages/admin/BlogForm'
import TestimonialsList from './pages/admin/TestimonialsList'
import NeighborhoodsList from './pages/admin/NeighborhoodsList'
import ServicesList from './pages/admin/ServicesList'
import LeadsList from './pages/admin/LeadsList'
import ChatPanel from './pages/admin/ChatPanel'
import Settings from './pages/admin/Settings'
import DealsPipeline from './pages/admin/DealsPipeline'
import DealDetail from './pages/admin/DealDetail'
import PropertyDetail from './pages/PropertyDetail'
import NeighborhoodDetail from './pages/NeighborhoodDetail'
import ServiceDetail from './pages/ServiceDetail'
import BlogPost from './pages/BlogPost'
import PlatformLanding from './pages/PlatformLanding'
import Register from './pages/Register'
import { Loader2 } from 'lucide-react'

function PublicSite() {
  const { settings } = useSiteSettings()
  const sections = settings.visibleSections || []

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {sections.includes('hero') && <Hero />}
        {sections.includes('properties') && <FeaturedProperties />}
        {sections.includes('services') && <Services />}
        {sections.includes('neighborhoods') && <Neighborhoods />}
        {sections.includes('about') && <About />}
        {sections.includes('testimonials') && <Testimonials />}
        {sections.includes('valuation') && <HomeValuation />}
        {sections.includes('mortgage') && <MortgageCalculator />}
        {sections.includes('blog') && <Blog />}
      </main>
      <Footer />
      <ChatWidget />
    </div>
  )
}

function TenantApp() {
  const { tenant, loading, error } = useTenant()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Loader2 className="w-8 h-8 text-[#C8944A] animate-spin" />
      </div>
    )
  }

  if (error === 'not_found') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center px-6">
          <h1 className="text-4xl font-bold text-[#0C1D2E] mb-4">Agency Not Found</h1>
          <p className="text-neutral-500 mb-6">This agency doesn't exist or the URL is incorrect.</p>
          <a href="/" className="text-[#C8944A] hover:underline font-medium">Go to platform</a>
        </div>
      </div>
    )
  }

  return (
    <SiteSettingsProvider>
      <LanguageProvider defaultLang="nl">
        <Routes>
          <Route path="/" element={<PublicSite />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/neighborhood/:id" element={<NeighborhoodDetail />} />
          <Route path="/service/:key" element={<ServiceDetail />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="properties" element={<PropertiesList />} />
            <Route path="properties/:id" element={<PropertyForm />} />
            <Route path="properties/new" element={<PropertyForm />} />
            <Route path="blog" element={<BlogList />} />
            <Route path="blog/:id" element={<BlogForm />} />
            <Route path="blog/new" element={<BlogForm />} />
            <Route path="testimonials" element={<TestimonialsList />} />
            <Route path="neighborhoods" element={<NeighborhoodsList />} />
            <Route path="services" element={<ServicesList />} />
            <Route path="leads" element={<LeadsList />} />
            <Route path="chat" element={<ChatPanel />} />
            <Route path="deals" element={<DealsPipeline />} />
            <Route path="deals/:id" element={<DealDetail />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </LanguageProvider>
    </SiteSettingsProvider>
  )
}

function AppRouter() {
  const { isPlatform } = useTenant()

  // If no tenant slug detected, show platform pages
  if (isPlatform) {
    return (
      <Routes>
        <Route path="/" element={<PlatformLanding />} />
        <Route path="/register" element={<Register />} />
        {/* Fallback: also allow direct tenant access via path for dev */}
        <Route path="/*" element={<PlatformLanding />} />
      </Routes>
    )
  }

  // Tenant detected: show tenant app
  return <TenantApp />
}

function App() {
  return (
    <TenantProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </TenantProvider>
  )
}

export default App
