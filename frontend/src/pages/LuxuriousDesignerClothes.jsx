import React from 'react'
import { G10,G11,G12 } from '../assets/Index'


const LuxuriousDesignerClothes = () => {
  return (
    <>
      <div className="container-fluid">
  <div className="Ldc-top text-center mb-5">
    <h4>Luxurious  Designer  Clothes  For  You</h4>
    <p>
     Immerse yourself in the world of luxury fashion with our meticulously crafted designer clothes!
    </p>
  </div>

  <div className="row">
    {/* Column 1 */}
    <div className="Ldc-bottom col-md-4 mb-4 text-center">
      <img src={G10} alt="service1" className="img-fluid mb-3" />
      <h6>Customization</h6>
      <p>Complete your ensemble with designer <br />images, colours and sketches.</p>
    </div>

    {/* Column 2 */}
    <div className="Ldc-bottom col-md-4 mb-4 text-center">
      <img src={G11} alt="service2" className="img-fluid mb-3" />
      <h6>Dresses</h6>
      <p>Explore a stunning range of designer <br />dresses, including evening gowns and <br />chic day dresses.</p>
    </div>

    {/* Column 3 */}
    <div className="Ldc-bottom col-md-4 mb-4 text-center">
      <img src={G12} alt="service3" className="img-fluid mb-3" />
      <h6>Native Wears</h6>
      <p>Browse luxurious designer range of Native <br />wears to stay stylish in all seasons.</p>
    </div>

  </div>

</div>
    </>
  )
}

export default LuxuriousDesignerClothes
