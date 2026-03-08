import React from 'react'
import { G2, G3 } from '../assets/Index'


const Home = () => {
  return (
    <>
      <main className='hero'>
        <section className='hero-left'>
            <h3>
                Your Signature <br /> Style. Crafted by <br />Master Designers.
            </h3>
            <p>Indulge in bespoke fashion tailored exclusively <br />for you. Select your style, choose your designer, <br />and experience couture craftsmanship—from <br />premium fabrics to flawless delivery—all in just <br />a few effortless steps.</p>
            <button className='hero-btn'>GET STARTED</button>
        </section>

        <section className='hero-right'>
            <img className='first-bg' src={G2} alt="" />
            <img className='second-bg' src={G3} alt="" />
        </section>
      </main>
    </>
  )
}

export default Home
