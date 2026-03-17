import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

// Landing page sections
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
// import OurDesigners from './pages/OurDesigners';

// Other pages
import Fabrics from './pages/Fabrics';
import FabricDetails from './pages/FabricDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Login from './pages/Login';
import Signup from './pages/Signup';

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

function AppContent() {
  const location = useLocation();
  
  // Pages where we hide BOTH header and footer
  const hideHeaderFooterOnPages = ['/login', '/signup'];
  
  // Pages where we only hide footer
  const hideFooterOnPages = ['/cart', '/checkout', '/order-confirmation'];
  
  const shouldShowHeader = !hideHeaderFooterOnPages.includes(location.pathname);
  const shouldShowFooter = !hideHeaderFooterOnPages.includes(location.pathname) && 
                           !hideFooterOnPages.includes(location.pathname);
  
  return (
    <>
      {shouldShowHeader && <Header />}
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/fabrics" element={<Fabrics />} />
        <Route path="/fabric/:id" element={<FabricDetails />} />
        <Route path="/product" element={<FabricDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* <Route path="/ourdesigners" element={<OurDesigners />} /> */}
      </Routes>
      
      {shouldShowFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}