import React from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "../../user/UserContext";

const Admin = () => {
      const { t } = useTranslation()
      const { user } = useUser();

      return (
            <>
                  <h3 className="title mt-3 text-bg-primary bg-opacity-75">{t('Admin')}</h3>
            </>
      )
}

export default Admin