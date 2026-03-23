import React from "react";
import { useTranslation } from "react-i18next";

const Repair = () => {

      const { t } = useTranslation(["dashboard"]);

      return (
            <>
                  <h3 className="title my-3 text-bg-success bg-opacity-75">{t("dashboard:repairs")}</h3>

            </>
      )
}

export default Repair