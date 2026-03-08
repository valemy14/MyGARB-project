import React from 'react'

const leftFeatures = [
  'Virtual Fabric Preview',
  'Secure Payment Option',
  'Real-Time Order Tracking & Delivery',
  'Automated Measurement',
]

const rightFeatures = [
  'Customization Options for Clothing Design and Fabrics',
  'Style Consultation',
  'User Review and Ratings',
  'Loyalty Rewards Program',
]

const FeatureItem = ({ text }) => (
  <div className="kf-item">
    <div className="kf-indicator">
      <span className="kf-chevron">›</span>
      <span className="kf-icon"></span>
    </div>
    <span className="kf-text">{text}</span>
  </div>
)

const KeyFeatures = () => {
  return (
    <>
      <section className="key-features container-fluid">
      <div className="kf-top text-center">
        <h3 className="kf-title">Key  Features</h3>
      </div>

      <div className="row kf-body">
        {/* Left Column */}
        <div className="col-md-6 kf-col">
          {leftFeatures.map((feature, i) => (
            <FeatureItem key={i} text={feature} />
          ))}
        </div>

        {/* Right Column */}
        <div className="col-md-6 kf-col">
          {rightFeatures.map((feature, i) => (
            <FeatureItem key={i} text={feature} />
          ))}
        </div>
      </div>
    </section>
    </>
  )
}

export default KeyFeatures
