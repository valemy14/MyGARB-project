import React from 'react'
import { G1, G4 } from '../assets/Index'

const Header = () => {
  return (
    <>
      <div className='purple-strip'></div>
      <div className='nav-bar'>
        <div className='p-logo'>
          <h6>PHASIONABLE</h6>
        </div>
        <ul>
          <li><a href="/">Home</a></li>  {/* ✅ Goes to landing page */}
          <li><a href="/#how-it-works">HOW IT WORKS</a></li>  {/* ✅ Scrolls to section */}
          <li><a href="/#features">Features</a></li>  {/* ✅ Scrolls to section */}
          <li><a href="/#contact">Contact</a></li>  {/* ✅ Scrolls to section */}
        </ul>

        <div className='nav-right'>
          <a href="/cart">
            <img className='cart-icon' src={G4} alt="Cart" />
          </a>
          <a href="/login" className="btn-login">LOG IN</a>
          <a href="/signup" className="btn-signup">SIGN UP</a>
        </div>
      </div>
    </>
  )
}

export default Header