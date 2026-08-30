import { Trans, useTranslation } from "react-i18next";
import { Banknote, CalendarCheck2, Info } from "lucide-react";

import "./PrimaryFeeInfo.css";

const MonthlyFeeInfo = () => {
    const { t } = useTranslation();

    return (
        <div className="monthly-fee-info">
            <div className="primary-header">
                <div className="header-icon info"><Info size={34} /></div>
                <div className="header-content">
                    <p className="text-start">
                        <Trans i18nKey="finance:monthlyFeeInfo"
                            components={{ strong: <strong />, u: <u /> }} />
                    </p>
                </div>
            </div>

            <section className="info-section important">
                <h5><CalendarCheck2 size={34} className="text-primary"/>{t("finance:feeTypesInfo.monthly.title")}</h5>
                <ul>
                    <li>
                        📅 <Trans i18nKey="finance:feeTypesInfo.monthly.description"
                            components={{ strong: <strong />, u: <u /> }} />
                    </li>
                    <li>
                        🔢 <Trans i18nKey="finance:feeTypesInfo.monthly.rule"
                            components={{ strong: <strong />, u: <u /> }} />
                    </li>
                    <li>
                        ❓ <Trans i18nKey="finance:feeTypesInfo.monthly.note"
                            components={{ strong: <strong />, u: <u /> }} />
                    </li>
                </ul>
            </section>

            <section className="info-section important">
                <h5><Banknote size={34}  className="text-secondary"/>{t("finance:oneTimeFee")}</h5>
                <ul>
                    <li>
                        1️⃣ <Trans i18nKey="finance:feeTypesInfo.oneTime.description"
                            components={{ strong: <strong />, u: <u /> }} />
                    </li>
                    <li>
                        🟢 <Trans i18nKey="finance:feeTypesInfo.oneTime.rule"
                            components={{ strong: <strong />, u: <u /> }} />
                    </li>
                    <li>
                        ⛔ <Trans i18nKey="finance:feeTypesInfo.oneTime.note"
                            components={{ strong: <strong />, u: <u /> }} />
                    </li>
                </ul>
            </section>
            <section className="info-section d-flex justify-content-evenly gap-4 important">
                <div className="d-flex  gap-2">
                    <span>{t("finance:monthlyFee")}</span>
                    <div className="form-check form-switch m-0">
                        <input
                            className="form-check-input border border-1 border-black opacity-100"
                            type="checkbox"
                            checked
                            disabled
                        />
                    </div>
                </div>
                <div className="vr"></div>
                <div className="d-flex align-items-center gap-2">
                    <span>{t("finance:oneTimeFee")}</span>
                    <div className="form-check form-switch m-0">
                        <input
                            className="form-check-input border border-1 border-black opacity-100"
                            type="checkbox"
                            disabled
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default MonthlyFeeInfo;
