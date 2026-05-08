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
import OurDesigners from './pages/OurDesigners';
import DesignerDetail from './pages/DesignerDetail';
import PaymentVerify from './pages/PaymentVerify';
import DesignerDashboard from './pages/DesignerDashboard';
import ChatPage from './pages/ChatPage';

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

  // Pages with NO header AND NO footer
  const hideHeaderFooter =
    location.pathname === '/login'             ||
    location.pathname === '/signup'            ||
    location.pathname === '/verify'            ||
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/chat');

  // Pages that HAVE a header but NO footer
  const hideFooterOnly =
    location.pathname === '/cart'               ||
    location.pathname === '/checkout'           ||
    location.pathname === '/order-confirmation' ||
    location.pathname === '/ourdesigners'       || 
    location.pathname === '/fabrics'            || 
    location.pathname.startsWith('/designer/')  || 
    location.pathname.startsWith('/fabric/');      

  const showHeader = !hideHeaderFooter;
  const showFooter = !hideHeaderFooter && !hideFooterOnly;

  return (
    <>
      {showHeader && <Header />}

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
        <Route path="/ourdesigners" element={<OurDesigners />} />
        <Route path="/designer/:id" element={<DesignerDetail />} />
        <Route path="/verify" element={<PaymentVerify />} />
        <Route path="/dashboard" element={<DesignerDashboard />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:conversationId" element={<ChatPage />} />
      </Routes>

      {showFooter && <Footer />}
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
