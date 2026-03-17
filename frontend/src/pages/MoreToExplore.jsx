import React from 'react'
import { G20, G21, G22 } from '../assets/Index'

const MoreToExplore = () => {
  return (
    <>
      <section className="mte container-fluid">

        {/* Title */}
        <div className="mte-top text-center">
          <h5 className="mte-title">More to Explore</h5>
        </div>

        {/* Images Row */}
        <div className="row mte-row justify-content-center">

          {/* Col 1 — Our Products (Text clickable) */}
          <div className="col-md-3 col-sm-10 col-11 mte-col">
            <img src={G20} alt="Our Products" className="mte-img mte-img--small" />
            <a href="/fabrics" style={{ textDecoration: 'none', color: 'inherit' }}>
              <p className="mte-label" style={{ cursor: 'pointer' }}>Our Products</p>
            </a>
          </div>

          {/* Col 2 — Middle image (Not clickable) */}
          <div className="col-md-4 col-sm-10 col-11 mte-col">
            <img src={G21} alt="Designer at work" className="mte-img mte-img--large" />
            <p className="mte-label mte-label--hidden">placeholder</p>
          </div>

          {/* Col 3 — Our Designers (Text clickable) */}
          <div className="col-md-4 col-sm-10 col-11 mte-col">
            <img src={G22} alt="Our Designers" className="mte-img mte-img--large" />
            <a href="/ourdesigners" style={{ textDecoration: 'none', color: 'inherit' }}>
              <p className="mte-label" style={{ cursor: 'pointer' }}>Our Designers</p>
            </a>
          </div>

        </div>

      </section>
    </>
  )
}

export default MoreToExplore