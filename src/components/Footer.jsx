import React from "react";
import "../Footer.css"

const Footer = () => {
      const currentYear = new Date().getFullYear();
      
      return (
            <footer className="footer my-2">
                  <p className="text-muted mb-0 py-2">&#169; {currentYear} Home manager All rights reserved</p>
            </footer>
      )
};

export default Footer;