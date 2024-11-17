import React from "react";
import { useTranslation } from "react-i18next";

const Finance = () => {

      const { t } = useTranslation();

      return (
            <>
                  <h3 className="title my-3 text-bg-warning bg-opacity-75">{t('Finance')}</h3>

            </>
      )
}

export default Finance