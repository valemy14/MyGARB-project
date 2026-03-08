import React from 'react'

const HowItWorks = () => {
  return (
    <>
<div className="hiw container-fluid" style={{ backgroundColor: "#F7F7F7" }}>
  <div className="hiw-top text-center mb-5">
    <h3>How It Works</h3>
    <p>Simple steps to transform your wardrobe</p>
  </div>


  <div className="hiw-bottom row">
    <div className="col-md-3 col-sm-6 mb-4 text-center">
      <div
      style={{
      width: "60px",
      height: "60px",
      backgroundColor: "#F8E8E8",
      color: "#2C2C2C",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto",
      fontWeight: "bold",
      fontSize: "20px",
      fontFamily:"Playfair Display"
    }} 
      className="step-number mb-3">1</div>
      <h6>Choose Your Style</h6>
      <p className='text-start'>Browse our curated collection of styles or customize an existing design. Select from premium fabrics and materials that match your vision.</p>
    </div>


    <div className="col-md-3 col-sm-6 mb-4 text-center">
      <div
      style={{
      width: "60px",
      height: "60px",
      backgroundColor: "#F0E8F8",
      color: "#2C2C2C",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto",
      fontWeight: "bold",
      fontSize: "24px",
      fontFamily:"Playfair Display"
    }}
       className="step-number mb-3">2</div>
      <h6>Pick your Designer</h6>
      <p className='text-start'>Browse designer portfolios, reviews, and previous work. Choose the perfect creator for your style and budget..</p>
    </div>

   
    <div className="col-md-3 col-sm-6 mb-4 text-center">
      <div
      style={{
      width: "60px",
      height: "60px",
      backgroundColor: "#FFDCE9",
      color: "#2C2C2C",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto",
      fontWeight: "bold",
      fontSize: "24px",
      fontFamily:"Playfair Display"
    }}
       className="step-number mb-3">3</div>
      <h6>Add Your Measurement</h6>
      <p className='text-start'>Receive your order and step out in Input your measurements for a perfect fit. Our detailed guide ensures accuracy for your <br />chosen style.</p>
    </div>

    
    <div className="col-md-3 col-sm-6 mb-4 text-center">
      <div
      style={{
      width: "60px",
      height: "60px",
      backgroundColor: "#EEE5FF",
      color: "#2C2C2C",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto",
      fontWeight: "bold",
      fontSize: "24px",
      fontFamily:"Playfair Display"
    }}
       className="step-number mb-3">4</div>
      <h6>Order & Receive</h6>
      <p className='text-start'>Make secure payment and track your order. Get your custom-made piece <br />delivered to your doorstep</p>
    </div>
  </div>
</div>
    </>
  )
}

export default HowItWorks
