import React from 'react'
import { G23, G24, G25 } from '../assets/Index'


const reviews = [
  {
    name: 'Sarah Johnson',
    avatar: G23,
    stars: 5,
    quote: '"Absolutely love the quality and style! Every piece I\'ve ordered has exceeded my expectations."',
  },
  {
    name: 'Michael Chen',
    avatar: G24,
    stars: 5,
    quote: '"Fast shipping and amazing customer service. Phasionable has become my go-to for all fashion needs."',
  },
  {
    name: 'Emma Wilson',
    avatar: G25,
    stars: 5,
    quote: '"The personalized styling advice helped me find my perfect look. Highly recommend!"',
  },
]

const Stars = ({ count }) => (
  <div className="cr-stars">
    {Array.from({ length: count }).map((_, i) => (
      <span key={i} className="cr-star">★</span>
    ))}
  </div>
)

const CustomerReviews = () => {
  return (
    <>
      <section className="cr container-fluid">

      {/* Top */}
      <div className="cr-top text-center">
        <h5 className="cr-title">What  Our  Customers  Say</h5>
        <p className="cr-subtitle">Real stories from fashion lovers worldwide</p>
      </div>

      {/* Cards */}
      <div className="row cr-row justify-content-center">
        {reviews.map((review, i) => (
          <div key={i} className="col-md-4 col-sm-10 col-11 cr-col">
            <div className="cr-card">
              {/* Avatar + Name + Stars */}
              <div className="cr-header">
                <img src={review.avatar} alt={review.name} className="cr-avatar" />
                <div className="cr-meta">
                  <p className="cr-name">{review.name}</p>
                  <Stars count={review.stars} />
                </div>
              </div>
              {/* Quote */}
              <p className="cr-quote">{review.quote}</p>
            </div>
          </div>
        ))}
      </div>

    </section>
    </>
  )
}

export default CustomerReviews
