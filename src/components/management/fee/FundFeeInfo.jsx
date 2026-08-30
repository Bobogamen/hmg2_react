import { Trans, useTranslation } from "react-i18next";
import { CircleDollarSign, HandCoins, Info } from "lucide-react";

import "./PrimaryFeeInfo.css";

const FundFeeInfo = () => {
    const { t } = useTranslation();

    return (
        <div className="fund-fee-info">
            <div className="primary-header">
                <div className="header-icon info"><Info size={34} /></div>
                <div className="header-icon calendar"><CircleDollarSign size={34} /></div>
                <div className="header-content">
                    <p className="text-start">
                        <Trans i18nKey="finance:fundInfo.title" components={{ strong: <strong />, u: <u /> }} />
                    </p>
                </div>
            </div>

            <section className="info-section important">
                <h5><HandCoins size={22} />{t("finance:fund")}</h5>
                <ul>
                    <li>
                        🏦 <Trans i18nKey="finance:fundInfo.description" components={{ strong: <strong />, u: <u /> }} />
                    </li>
                    <li>
                        💵 <Trans i18nKey="finance:fundInfo.rule" components={{ strong: <strong />, u: <u /> }} />
                    </li>
                    <li>
                        🛠️ <Trans i18nKey="finance:fundInfo.note" components={{ strong: <strong />, u: <u /> }} />
                    </li>
                </ul>
            </section>

            <section className="info-section important">
                <h5><CircleDollarSign size={22} /> <span>{`${t("finance:fee")} ${t("for")} ${t("finance:fund")}`}</span></h5>
                <ul>
                    <li>
                        📅 <Trans i18nKey="finance:feeTypesInfo.monthly.description"
                            components={{ strong: <strong />, u: <u /> }} />
                    </li>
                    <li>
                        🧾 <Trans i18nKey="finance:fundFee.rule"
                            components={{ strong: <strong />, u: <u /> }} />
                    </li>
                </ul>
            </section>
        </div>
    );
};

export default FundFeeInfo;
