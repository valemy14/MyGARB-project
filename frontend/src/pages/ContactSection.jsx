import React from 'react'

const ContactSection = () => {
  return (
    <>
      <section className="contact container-fluid">
      <div className="row contact-row align-items-center">

        {/* Left Side */}
        <div className="col-md-5 col-sm-12 contact-left">
          <p className="contact-tagline">Style start with a conversation — Lets get in touch</p>
          <p className="contact-desc">
            Have any question to Get Started with Mygarp? Our Team is here to assist you
          </p>
          <div className="contact-info">
            <p className="contact-info-item">Email: mygarpsolution@gmail.com</p>
            <p className="contact-info-item">Phone: +23481647515316</p>
          </div>
        </div>

        {/* Right Side — Form Card */}
        <div className="col-md-7 col-sm-12 contact-right">
          <div className="contact-card">

            <div className="contact-field">
              <label className="contact-label">Fullname</label>
              <input type="text" className="contact-input" />
            </div>

            <div className="contact-field">
              <label className="contact-label">Email</label>
              <input type="email" className="contact-input" />
            </div>

            <div className="contact-field">
              <label className="contact-label">Phone Number</label>
              <input type="tel" className="contact-input" />
            </div>

            <div className="contact-field">
              <textarea className="contact-textarea"></textarea>
            </div>

            <button className="contact-btn">Send Message</button>

          </div>
        </div>

      </div>
    </section>
    </>
  )
}

export default ContactSection
