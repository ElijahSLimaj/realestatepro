import './App.css'
import { Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import { SiteSettingsProvider, useSiteSettings } from './context/SiteSettingsContext'
import { AuthProvider } from './context/AuthContext'
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
import PropertyDetail from './pages/PropertyDetail'
import NeighborhoodDetail from './pages/NeighborhoodDetail'
import ServiceDetail from './pages/ServiceDetail'
import BlogPost from './pages/BlogPost'

function PublicSite() {
  const { settings } = useSiteSettings()

  return (
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
  )
}

function App() {
  return (
    <SiteSettingsProvider>
      <LanguageProvider defaultLang="nl">
        <AuthProvider>
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
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </SiteSettingsProvider>
  )
}

export default App
