import React from "react";
import { useTranslation } from "react-i18next";

const Statistic = () => {

      const { t } = useTranslation();

      return (
            <>
                  <h3 className="title my-3 text-bg-secondary bg-opacity-75">{t('Statistic')}</h3>

            </>
      )
}

export default Statistic