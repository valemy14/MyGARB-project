import React from 'react'

const Footer = () => {
  return (
    <>
      <footer className="footer">
      <div className="container-fluid footer-container">

        {/* Main Row */}
        <div className="row footer-row">

          {/* Col 1 — Logo + Social */}
          <div className="col-md-3 col-sm-6 col-12 footer-col">
            <h2 className="footer-logo">PHASIONABLE</h2>
            <p className="footer-social-label">Social Media</p>
            <div className="footer-socials">
              <a href="#" className="footer-social-icon" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 8h-2a2 2 0 0 0-2 2v2h4l-.5 4H12v6H8v-6H6v-4h2v-2a6 6 0 0 1 6-6h2z"/>
                </svg>
              </a>
              <a href="#" className="footer-social-icon" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.43.36a9 9 0 0 1-2.88 1.1A4.52 4.52 0 0 0 11.07 8a12.83 12.83 0 0 1-9.3-4.71 4.52 4.52 0 0 0 1.4 6.04A4.48 4.48 0 0 1 1 8.87v.06a4.52 4.52 0 0 0 3.62 4.43 4.52 4.52 0 0 1-2.04.08 4.52 4.52 0 0 0 4.22 3.14A9.07 9.07 0 0 1 1 18.54 12.8 12.8 0 0 0 7.92 21c8.3 0 12.84-6.88 12.84-12.84 0-.2 0-.39-.01-.58A9.17 9.17 0 0 0 23 3z"/>
                </svg>
              </a>
              <a href="#" className="footer-social-icon" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="white"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2 — SHOP */}
          <div className="col-md-2 col-sm-6 col-6 footer-col">
            <h6 className="footer-col-title">SHOP</h6>
            <ul className="footer-links">
              <li><a href="#">Products</a></li>
              <li><a href="#">Overview</a></li>
              <li><a href="#">Pricing</a></li>
              <li><a href="#">Releases</a></li>
            </ul>
          </div>

          {/* Col 3 — COMPANY */}
          <div className="col-md-2 col-sm-6 col-6 footer-col">
            <h6 className="footer-col-title">COMPANY</h6>
            <ul className="footer-links">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">News</a></li>
              <li><a href="#">Support</a></li>
            </ul>
          </div>

          {/* Col 4 — Newsletter */}
          <div className="col-md-5 col-sm-6 col-12 footer-col">
            <h6 className="footer-col-title">STAY UP TO DATE</h6>
            <div className="footer-newsletter">
              <input
                type="email"
                className="footer-email-input"
                placeholder="Enter your email"
              />
              <button className="footer-submit-btn">SUBMIT</button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <hr className="footer-divider" />
          <div className="footer-bottom-links">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Cookies</a>
          </div>
        </div>

      </div>
    </footer>
    </>
  )
}

export default Footer
