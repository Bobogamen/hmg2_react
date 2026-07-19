import React from "react";
import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import Breadcrumbs from "../breadcrumb/Breadcrumbs"

const AdminLayout = () => {

    return (
        <Container fluid className="py-3">
            <Breadcrumbs />
            <Outlet />
        </Container>
    );
};

export default AdminLayout;