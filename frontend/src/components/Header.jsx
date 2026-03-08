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
          <li><a href="">Home</a></li>
          <li><a href="">HOW IT WORKS</a></li>
          <li><a href="">Features</a></li>
          <li><a href="">Contact</a></li>
        </ul>

        <div className='nav-right'>
          <img className='cart-icon' src={G4} alt="" />
          <button className='btn-login'>LOG IN </button>
          <button className='btn-signup'>SIGN UP</button>
        </div>
      </div>
    </>
  )
}

export default Header
