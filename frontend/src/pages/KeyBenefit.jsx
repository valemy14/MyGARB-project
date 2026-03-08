import React from 'react'
import { G5,G6,G7,G8,G9 } from '../assets/Index'

const KeyBenefit = () => {
  return (
    <>
      <main className='key-benefit'>
        <div className='key-top'>
            <h6>Key Benefits</h6>
            <p>Get in on the trend with our curated selection of best-selling styles.</p>
        </div>

        <div className='key-hero'>
            <div className='key-left'>
                <img src={G5} alt="" />
            </div>
            <div className='key-right'>
                <div className='kr-top'>
                    <p>Get in on the trend with our curated selection of best-selling styles,<span className="line-break">with professional designers ready to meet your fashion needs</span></p>
                </div>
                <div className='kr-bottom'>
                    <ul>
                        <li><img src={G6} alt="" /> <span>Choose Your Styles</span></li>
                        <li><img src={G7} alt="" /> <span>Pick Your Designer</span></li>
                        <li><img src={G8} alt="" /> <span>Perfect Measurement</span></li>
                        <li><img src={G9} alt="" /> <span>Door Step Delivery</span></li>
                    </ul>
                </div>
            </div>
            <button className='kb-btn'>MAKE YOUR OUTFIT</button>
        </div>
      </main>
    </>
  )
}

export default KeyBenefit
