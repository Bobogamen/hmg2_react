import React from "react";
import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import Breadcrumbs from "../breadcrumb/Breadcrumbs"

const AdminLayout = () => {

    return (
        <div fluid className="py-3">
            <Breadcrumbs />
            <Outlet />
        </div>
    );
};

export default AdminLayout;