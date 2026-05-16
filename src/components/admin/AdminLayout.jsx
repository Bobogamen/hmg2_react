import React from "react";
import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const AdminLayout = () => {
    const { t } = useTranslation();

    return (
        <Container fluid className="py-3">

            <h3 className="title my-3 text-bg-primary bg-opacity-75 text-center">
                {t("dashboard:admin")}
            </h3>

            <Outlet />

        </Container>
    );
};

export default AdminLayout;