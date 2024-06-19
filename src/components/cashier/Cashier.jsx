import React from "react";
import { useTranslation } from "react-i18next";
import "../cashier/Cashier.css"

const Cashier = () => {
      const { t } = useTranslation();


      return (
            <>
                  <h3 className="title my-3">{t('Cashier')}</h3>
                  <div className="layout">
                        <main className="bg-info">Main</main>
                        <aside className="right bg-warning">
                              <article className="top-section bg-success">Top Section</article>
                              <article className="mosaic-section">
                                    <div className="mosaic-left bg-danger">Left</div>
                                    <div className="mosaic-top-right bg-primary">Top</div>
                                    <div className="mosaic-bottom-right bg-secondary">Bottom</div>
                              </article>
                        </aside>
                  </div>
            </>
      )
}

export default Cashier