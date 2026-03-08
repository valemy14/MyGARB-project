import React from 'react'
import { G13,G14,G15,G16 } from '../assets/Index'


const Styles = () => {
  return (
    <>
     <div className="styles container-fluid">
  {/* Row with 4 Columns */}
  <div className="row">

    <div className="styles-bottom col-md-3 col-sm-6 mb-4 text-center">
      <img src={G13} alt="collection1" className="img-fluid mb-3" />
      <p>Grey Fitted Kaftan</p>
    </div>

    <div className="styles-bottom  col-md-3 col-sm-6 mb-4 text-center">
      <img src={G14} alt="collection2" className="img-fluid mb-3" />
      <p>Summer Blue Men Agbada</p>
    </div>

    <div className="styles-bottom  col-md-3 col-sm-6 mb-4 text-center">
      <img src={G15} alt="collection3" className="img-fluid mb-3" />
      <p>Tailored 2 pieces</p>
    </div>

    <div className="styles-bottom  col-md-3 col-sm-6 mb-4 text-center">
      <img src={G16} alt="collection4" className="img-fluid mb-3" />
      <p>Solid V Neck Agbada</p>
    </div>

  </div>

</div>
    </>
  )
}

export default Styles
