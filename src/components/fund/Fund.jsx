import React from "react";
import { useTranslation } from "react-i18next";

const Fund = () => {

      const { t } = useTranslation(["dashboard"]);

      return (
            <>
                  <h3 className="title my-3 text-bg-info bg-opacity-75">{t("dashboard:funds")}</h3>

            </>
      )
}

export default Fund