import React from "react";
import { useTranslation } from "react-i18next";

const Admin = () => {

      const { t } = useTranslation()

      return (
            <>
                  <h3 className="title mt-3">{t('Admin')}</h3>

            </>
      )
}

export default Admin