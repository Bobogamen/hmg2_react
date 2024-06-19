import React from "react";
import { useTranslation } from "react-i18next";

const Repair = () => {

      const { t } = useTranslation();

      return (
            <>
                  <h3 className="title my-3">{t('Repairs')}</h3>

            </>
      )
}

export default Repair