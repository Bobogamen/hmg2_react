import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { Info, CalendarCheck2, CircleEuroSign, Users, Calculator, ShieldCheck, Home, UserCheck } from "lucide-react";

import "./PrimaryFeeInfo.css";

const PrimaryFeeInfo = () => {
    const { t } = useTranslation();

    return (
        <div className="primary-fee-info">

            {/* Header */}
            <div className="primary-header">
                <div className="header-icon info">
                    <Info size={34} />
                </div>
                <div className="header-icon calendar">
                    <CalendarCheck2 size={34} />
                </div>

                <div className="header-content">
                    <p>
                        <Trans
                            i18nKey="finance:primaryFeeInfo.description"
                            components={{
                                strong: <strong />,
                                u: <u />,
                                i: <i />
                            }}
                        />
                    </p>
                </div>
            </div>

            {/* Formula */}
            <section className="info-section">
                <h5>
                    <Calculator size={22} />
                    {t("finance:primaryFeeInfo.calculation.title")}
                </h5>

                <div className="formula-card">

                    <div className="formula-item">
                        <CircleEuroSign size={36} />
                        <span>{t("finance:primaryFeeInfo.calculation.fee")}</span>
                        <strong>5€</strong>
                    </div>

                    <div className="operator">×</div>

                    <div className="formula-item">
                        <Users size={36} />
                        <span>{t("finance:primaryFeeInfo.calculation.residents")}</span>
                        <strong>3</strong>
                    </div>

                    <div className="operator">=</div>

                    <div className="formula-item result">
                        <Calculator size={36} />
                        <span>{t("finance:primaryFeeInfo.calculation.total")}</span>
                        <strong>15€</strong>
                    </div>

                </div>
            </section>

            {/* Example */}
            <section className="info-section">

                <h5>
                    <Home size={22} />
                    <Trans
                        i18nKey="finance:primaryFeeInfo.example.title"
                        components={{
                            strong: <strong />,
                            u: <u />,
                            i: <i />
                        }}
                    />
                </h5>

                <p className="section-description">
                    <Trans
                        i18nKey="finance:primaryFeeInfo.example.description"
                        components={{
                            strong: <strong />,
                            u: <u />,
                            i: <i />
                        }}
                    />
                </p>

                <div className="properties-example">

                    <div className="property-card">
                        <div className="property-header">
                            <Home size={26} />
                            <strong>
                                {t("home:home")} 1
                            </strong>
                        </div>

                        <div className="fee-value">
                            <CircleEuroSign size={28} />
                            <strong>5€</strong>
                        </div>

                        <div className="resident-icons">
                            <UserCheck />
                            <UserCheck />
                            <UserCheck />
                        </div>

                        <div className="property-result">
                            5€ × 3 = <strong>15€</strong>
                        </div>
                    </div>

                    <div className="property-card">
                        <div className="property-header">
                            <Home size={26} />
                            <strong>
                                {t("home:home")} 2
                            </strong>
                        </div>

                        <div className="fee-value">
                            <CircleEuroSign size={28} />
                            <strong>5€</strong>
                        </div>

                        <div className="resident-icons">
                            <UserCheck />
                            <UserCheck />
                        </div>

                        <div className="property-result">
                            5€ × 2 = <strong>10€</strong>
                        </div>
                    </div>

                    <div className="property-card">
                        <div className="property-header">
                            <Home size={26} />
                            <strong>
                                {t("home:home")} 3
                            </strong>
                        </div>

                        <div className="fee-value">
                            <CircleEuroSign size={28} />
                            <strong>7€</strong>
                        </div>

                        <div className="resident-icons">
                            <UserCheck />
                            <UserCheck />
                            <UserCheck />
                            <UserCheck />
                        </div>

                        <div className="property-result">
                            7€ × 4 = <strong>28€</strong>
                        </div>
                    </div>

                </div>

            </section>

            {/* Important */}
            <section className="info-section important">

                <h5>
                    <ShieldCheck size={22} />
                    {t("finance:primaryFeeInfo.important.title")}
                </h5>

                <ul>
                    <li>
                        📅{" "}
                        <Trans
                            i18nKey="finance:primaryFeeInfo.important.monthly"
                            components={{
                                strong: <strong />,
                                u: <u />,
                                i: <i />
                            }}
                        />
                    </li>

                    <li>
                        🔒{" "}
                        <Trans
                            i18nKey="finance:primaryFeeInfo.important.onePerProperty"
                            components={{
                                strong: <strong />,
                                u: <u />,
                                i: <i />
                            }}
                        />
                    </li>

                    <li>
                        👥{" "}
                        <Trans
                            i18nKey="finance:primaryFeeInfo.important.activeResidents"
                            components={{
                                strong: <strong />,
                                u: <u />,
                                i: <i />
                            }}
                        />
                    </li>

                    <li>
                        🏢{" "}
                        <Trans
                            i18nKey="finance:primaryFeeInfo.important.differentProperties"
                            components={{
                                strong: <strong />,
                                u: <u />,
                                i: <i />
                            }}
                        />
                    </li>
                </ul>

            </section>

        </div>
    );
};

export default PrimaryFeeInfo;