import React from "react";
import { Outlet } from "react-router-dom";
import Breadcrumbs from "../breadcrumb/Breadcrumbs"

const AdminLayout = () => {

    return (
        <div className="py-3">
            <Breadcrumbs />
            <Outlet />
        </div>
    );
};

export default AdminLayout;