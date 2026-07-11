import React from "react";
import { useBreadcrumb } from "./BreadcrumpContext";
import { Link, useLocation } from "react-router-dom";

const PATH_COLORS = [
    { path: "/admin", color: "text-bg-primary bg-opacity-75" },
    { path: "/management", color: "text-bg-danger bg-opacity-50" },
    { path: "/finance", color: "text-bg-warning bg-opacity-75" },
    { path: "/fund", color: "text-bg-info bg-opacity-75" },
    { path: "/repair", color: "text-bg-success bg-opacity-75" },
    { path: "/statistics", color: "text-bg-secondary bg-opacity-75" },
    { path: "/cashier", color: "text-bg-dark bg-opacity-50" },
];

const getSectionColor = (pathname) =>
    PATH_COLORS.find((p) => pathname.startsWith(p.path))?.color ?? "text-bg-light";

const Breadcrumbs = () => {
    const { breadcrumbs } = useBreadcrumb();
    const { pathname } = useLocation();
    const color = getSectionColor(pathname);

    return (
        <div aria-label="breadcrumb" className="p-1">
            <div className="breadcrumb d-flex justify-content-center">
                {breadcrumbs.map((crumb, i) => (
                    <React.Fragment key={i}>
                        {i > 0 && (
                            <span className="d-flex align-items-center mx-2 fw-bold">➤</span>
                        )}

                        <li
                            className={`${color} breadcrumb-item ${i === breadcrumbs.length - 1 ? "active fw-bold" : ""}`}
                            aria-current={i === breadcrumbs.length - 1 ? "page" : undefined}
                        >
                            {crumb.path && i !== breadcrumbs.length - 1 ? (
                                <Link
                                    to={crumb.path}
                                    className="text-reset text-decoration-none"
                                >
                                    {crumb.label}
                                </Link>
                            ) : (
                                crumb.label
                            )}
                        </li>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default Breadcrumbs;