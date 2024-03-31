import React from "react";
import "../Footer.css"

function Footer() {
      const currentYear = new Date().getFullYear();
      
      return (
            <footer className="footer">
                  <p className="text-muted mb-0 py-2">&#169; {currentYear} Home manager All rights reserved</p>
            </footer>
      )
};

export default Footer;