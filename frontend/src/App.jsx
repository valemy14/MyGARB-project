import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Header from './components/Header'
import Home from './pages/Home'
import KeyBenefit from './pages/KeyBenefit'
import HowItWorks from './pages/HowItWorks'
import LuxuriousDesignerClothes from './pages/LuxuriousDesignerClothes'
import Styles from './pages/Styles'
import KeyFeatures from './pages/KeyFeatures'
import WhyChoosePhasionable from './pages/WhyChoosePhasionable'
import MoreToExplore from './pages/MoreToExplore'
import ContactSection from './pages/ContactSection'
import CustomerReviews from './pages/CustomerReviews'
import Footer from './components/Footer'



function App() {


  return (
    <>
        <Header />
        <Home />
        <KeyBenefit/>
        <HowItWorks/>
        <LuxuriousDesignerClothes/>
        <Styles/>
        <KeyFeatures/>
        <WhyChoosePhasionable/>
        <MoreToExplore/>
        <ContactSection/>
        <CustomerReviews/>
        <Footer/>
    </>
  )
}

export default App
