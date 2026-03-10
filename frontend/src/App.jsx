import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';

import Header from './components/Header';
import Footer from './components/Footer';

// Landing Page Sections
import Home from './pages/Home';
import KeyBenefit from './pages/KeyBenefit';
import HowItWorks from './pages/HowItWorks';
import LuxuriousDesignerClothes from './pages/LuxuriousDesignerClothes';
import Styles from './pages/Styles';
import KeyFeatures from './pages/KeyFeatures';
import WhyChoosePhasionable from './pages/WhyChoosePhasionable';
import MoreToExplore from './pages/MoreToExplore';
import ContactSection from './pages/ContactSection';
import CustomerReviews from './pages/CustomerReviews';

// Cart Page
import Cart from './pages/Cart';

// Landing Page (all sections together)
function LandingPage() {
  return (
    <>
      <Home />
      <KeyBenefit />
      <HowItWorks />
      <LuxuriousDesignerClothes />
      <Styles />
      <KeyFeatures />
      <WhyChoosePhasionable />
      <MoreToExplore />
      <ContactSection />
      <CustomerReviews />
    </>
  );
}

// Main App Component
function AppContent() {
  const location = useLocation();
  
  // Pages where footer should NOT show
  const hideFooterOnPages = ['/cart', '/checkout'];
  const shouldShowFooter = !hideFooterOnPages.includes(location.pathname);

  return (
    <>
      <Header />
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
      
      {shouldShowFooter && <Footer />}
    </>
  );
}

// Root App with Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;