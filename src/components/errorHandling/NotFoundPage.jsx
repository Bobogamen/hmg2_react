import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {

  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <div className="container-fluid">
        <div className="container align-items-center mt-5">
          <p className="h1 text-center mt-5">
            {t("server:title404")}
          </p>
          <p className="h4 text-center">
            {t("server:404")}
          </p>
        </div>
        <div className="col text-center mt-5">
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            {t("back")}
          </button>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;