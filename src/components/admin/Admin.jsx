import React from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "../../user/UserContext";

const Admin = () => {
      const { t } = useTranslation(["dashboard"])
      const { user } = useUser();

      console.log(user)

      return (
            <>
                  <h3 className="title mt-3 text-bg-primary bg-opacity-75">{t("dashboard:admin")}</h3>
                  
            </>
      )
}

export default Admin