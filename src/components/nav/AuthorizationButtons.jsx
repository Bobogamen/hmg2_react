import React from "react";
import './Navbar.css'
import Admin from '../../assets/images/app/admin.png'
import Management from '../../assets/images/app/management.png'
import Finance from '../../assets/images/app/finance.png'
import Funds from '../../assets/images/app/fund.png'
import Repairs from '../../assets/images/app/repair.png'
import Statistics from '../../assets/images/app/stsatistic.png'
import Cashier from '../../assets/images/app/cashier..png'
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BUTTONS = [
    { role: "ADMIN", path: "/admin", label: "Admin", img: Admin, color: "text-bg-primary bg-opacity-75" },
    { role: "MANAGER", path: "/management", label: "Management", img: Management, color: "text-bg-danger bg-opacity-50" },
    { role: "FINANCE", path: "/finance", label: "Finance", img: Finance, color: "text-bg-warning bg-opacity-75" },
    { role: "FUNDS", path: "/fund", label: "Funds", img: Funds, color: "text-bg-info bg-opacity-75" },
    { role: "REPAIRS", path: "/repair", label: "Repairs", img: Repairs, color: "text-bg-success bg-opacity-75" },
    { role: "STATISTICS", path: "/statistic", label: "Statistics", img: Statistics, color: "text-bg-secondary bg-opacity-75" },
    { role: "CASHIER", path: "/cashier", label: "Cashier", img: Cashier, color: "text-bg-dark bg-opacity-50" },
];

const AuthorizationButtons = ({ roles, show, close }) => {
    const { t } = useTranslation();

    let filteredButtons = [];
    if (roles.includes("ADMIN")) {
        filteredButtons = BUTTONS;
    } else if (roles.includes("MANAGER")) {
        filteredButtons = BUTTONS.filter(button => button.role !== "ADMIN");
    } else if (roles.includes("CASHIER")) {
        filteredButtons = BUTTONS.filter(button => button.role !== "ADMIN" && button.role !== "MANAGER");
    }

    return (
        <ul id="main-buttons" className={show ? "open m-auto" : "m-auto"}>
            {filteredButtons.map(({ path, label, img, color }) => (
                <li key={path} onClick={close}>
                    <Link to={path} className="text-decoration-none">
                        <button className={`authorization-button d-flex align-items-center ${color}`}>
                            <img src={img} className="icon authorization-button-icon" alt={label.toLowerCase()} />
                            <span className="button-text">{t(label)}</span>
                        </button>
                    </Link>
                </li>
            ))}
        </ul>
    );
};

export default AuthorizationButtons;