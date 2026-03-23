import React from "react";
import { useTranslation } from "react-i18next";

const Statistic = () => {

      const { t } = useTranslation(["dashboard"]);

      return (
            <>
                  <h3 className="title my-3 text-bg-secondary bg-opacity-75">{t("dashboard:statistic")}</h3>

            </>
      )
}

export default Statistic