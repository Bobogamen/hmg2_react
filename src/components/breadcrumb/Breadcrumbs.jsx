import React from "react";
import { useBreadcrumb } from "./BreadcrumpContext";
import { Link, useLocation } from "react-router-dom";
import { BsArrowRightSquareFill } from "react-icons/bs";

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
    PATH_COLORS.find((item) =>
        pathname.startsWith(item.path)
    )?.color ?? "text-bg-light";



const Breadcrumbs = () => {

    const { breadcrumbs } = useBreadcrumb();
    const { pathname } = useLocation();

    const sectionColor = getSectionColor(pathname);


    return (
        <div aria-label="breadcrumb" className="p-1">
            <div className="breadcrumb d-flex align-items-center">
                {breadcrumbs.map((crumb, i) => {

                    const isLast = i === breadcrumbs.length - 1;
                    const useCustomColor = !!crumb.color;

                    return (
                        <React.Fragment key={i}>

                            {i > 0 && (
                                <span className="d-flex mx-1">
                                    <BsArrowRightSquareFill />
                                </span>
                            )}

                            <li
                                className={`
                                    breadcrumb-item
                                    px-2
                                    py-1
                                    rounded
                                    ${isLast ? "fw-bold" : ""}
                                    ${!useCustomColor ? sectionColor : ""}
                                    ${crumb.className || ""}
                                `}
                                style={{
                                    backgroundColor: crumb.color || undefined,
                                    color: crumb.textColor || undefined
                                }}
                                aria-current={isLast ? "page" : undefined}
                            >
                                {crumb.path && !isLast ? (
                                    <Link
                                        to={crumb.path}
                                        className="text-reset text-decoration-none"
                                    >
                                        <span className={useCustomColor? "breadcrumb-item-text" : null}>{crumb.label}</span>
                                    </Link>
                                ) : (
                                    <span className={useCustomColor? "breadcrumb-item-text" : null}>{crumb.label}</span>
                                )}
                            </li>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};


export default Breadcrumbs;