import React from 'react'
import { G17,G18,G19 } from '../assets/Index'

const cards = [
  {
    bg: '#D6F0E0',
    img: G17,
    title: 'Premium Quality',
    desc: 'Handpicked materials and expert craftsmanship\nensure every piece meets our highest standards.',
  },
  {
    bg: '#EAD6F5',
    img: G18,
    title: 'Fast Delivery',
    desc: 'Free worldwide shipping with express delivery\noptions to get your fashion favorites quickly.',
  },
  {
    bg: '#D6E8F5',
    img: G19,
    title: 'Personalized Style',
    desc: 'Expert styling advice and personalized\nrecommendations tailored to your unique taste.',
  },
]

const WhyChoosePhasionable = () => {
  return (
    <>
      <section className="why-choose container-fluid">

      {/* Top */}
      <div className="wc-top text-center">
        <h5 className="wc-title">Why Choose Phasionable</h5>
        <p className="wc-subtitle">
          Experience fashion like never before with our commitment to quality, style, and exceptional service.
        </p>
      </div>

      {/* Cards */}
      <div className="row wc-row justify-content-center">
        {cards.map((card, i) => (
          <div key={i} className="col-md-4 col-sm-10 col-11 wc-col">
            <div className="wc-card text-center" style={{ backgroundColor: card.bg }}>
                <img src={card.img} alt={card.title} className="wc-icon" />
                <h5 className="wc-card-title">{card.title}</h5>
                <p className="wc-card-desc">
                    {card.desc.split('\n').map((line, i) => (
                    <React.Fragment key={i}>{line}{i === 0 && <br />}</React.Fragment>
                    ))}
                </p>
            </div>
          </div>
        ))}
      </div>

    </section>
    </>
  )
}

export default WhyChoosePhasionable
