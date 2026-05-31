import React from "react";
import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const ManagementLayout = () => {
      const { t } = useTranslation();

      return (
            <Container fluid className="py-3">

                  <h3 className="title my-3 text-bg-danger bg-opacity-50">
                        {t("dashboard:management")}
                  </h3>

                  <Outlet />

            </Container>
      );
};

export default ManagementLayout;