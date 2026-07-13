import React from "react";
import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import Breadcrumbs from "../breadcrumb/Breadcrumbs"

const ManagementLayout = () => {
      return (
            <Container fluid className="py-1">
                  <Breadcrumbs />
                  <Outlet />
            </Container>
      );
};

export default ManagementLayout;