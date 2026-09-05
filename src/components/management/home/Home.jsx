import React, { useCallback, useEffect, useState } from "react";
import { OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import { TriangleAlert } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import homeIcon from "../../../assets/images/app/home.png";
import aptBuilding from "../../../assets/images/app/apartment_building.png";
import ModalHome from "./ModalHome";

import { getHome } from "../../../api/services/homeService";
import { getHomeFees, updateHomeFeeTimes } from "../../../api/services/feeService";
import { Bounce, toast } from "react-toastify";
import { useLoading } from "../../../loader/LoadingContext";
import { useUser } from "../../../user/UserContext";
import errorHandler from "../../errorHandling/errosHandler";
import { useBreadcrumb } from "../../breadcrumb/BreadcrumpContext";
import OwnerCard from "./resident/OwnerCard";
import CardResident from "./resident/CardResident";
import ModalBuilding from "./ModalBuilding";

const Home = () => {
    const { setBreadcrumbs } = useBreadcrumb();

    const { condominiumId, homeId } = useParams();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { logout } = useUser();
    const { setIsLoading } = useLoading();

    const initHome = {
        id: null,
        floor: "",
        name: "",
        residents: [],
        fees: [],
        condominium: null
    };

    const [home, setHome] = useState(initHome);
    const [feeTimes, setFeeTimes] = useState({});
    const [savedFeeTimes, setSavedFeeTimes] = useState({});
    const [savingFeeId, setSavingFeeId] = useState(null);
    const [editHome, setEditHome] = useState(false);
    const [buildingOpen, setBuildingOpen] = useState(false);

    const fetchHome = useCallback(async () => {
        setIsLoading(true);

        try {
            const [data, fees] = await Promise.all([
                getHome({ condominiumId, homeId }),
                getHomeFees({ condominiumId, homeId })
            ]);
            setHome({ ...data, fees });
            const loadedFeeTimes = Object.fromEntries(
                fees.map((fee) => {
                    const times = Number(fee.times);
                    return [fee.id, Number.isFinite(times) ? times : 1];
                })
            );
            setFeeTimes(loadedFeeTimes);
            setSavedFeeTimes(loadedFeeTimes);

        } catch (error) {
            errorHandler(error, undefined, navigate, t, logout);

        } finally {
            setIsLoading(false);
        }

    }, [
        condominiumId,
        homeId,
        navigate,
        logout,
        setIsLoading,
        t
    ]);

    useEffect(() => {
        fetchHome();
    }, [fetchHome]);

    const homeTitle = [
        home.floor && `${t("home:floor")} ${home.floor}`,
        home.name && `${t("home:apt")} ${home.name}`
    ]
        .filter(Boolean)
        .join(" • ");

    // Breadcrumbs
    useEffect(() => {
        if (!home.id || !home.condominium) return;

        setBreadcrumbs([
            {
                label: t("dashboard:management"),
                path: "/management"
            },
            {
                label: home.condominium?.name || t("condominium"),
                path: `/management/condominiums/${condominiumId}`,
                color: home.condominium.backgroundColor
            },
            {
                label: homeTitle
            }
        ]);

        return () => {
            setBreadcrumbs([]);
        };

    }, [
        home,
        homeTitle,
        condominiumId,
        setBreadcrumbs,
        t
    ]);

    const handleOpen = () => setEditHome(true);
    const handleClose = () => setEditHome(false);

    const handleBuildingOpen = () => {

        if (!home.condominium)
            return;

        setBuildingOpen(true);
    };

    const activeResidents = home.residents.filter(
        resident => !resident.deleted
    );

    const inactiveResidents = home.residents.filter(
        resident => resident.deleted
    );

    const ownerIsInactive = Boolean(home.owner?.deleted);
    const activeResidentCount = activeResidents.length + (home.owner && !ownerIsInactive ? 1 : 0);
    const inactiveResidentCount = inactiveResidents.length + (ownerIsInactive ? 1 : 0);
    const residentMaxCount = home.residentMaxCount ?? 0;
    const feeMaxCount = home.feeMaxCount ?? 0;
    const totalFeeCount = home.fees.length;
    const activeFeeCount = home.fees.filter(
        fee => fee.primary || (feeTimes[fee.id] ?? 1) > 0
    ).length;

    const totalFees = home.fees.reduce(
        (total, fee) => {
            const value = Number(fee.value || 0);
            const times = feeTimes[fee.id] ?? 1;

            if (fee.primary) {
                return total + value * activeResidentCount;
            }

            if (fee.monthly) {
                return total + value * times;
            }

            return total + (times > 0 ? value : 0);
        },
        0
    );

    const handleFeeTimesChange = (fee, value) => {
        setFeeTimes((current) => ({
            ...current,
            [fee.id]: fee.monthly
                ? Math.max(0, Number(value) || 0)
                : (Number(value) === 1 ? 1 : 0)
        }));
    };

    const handleSaveFeeTimes = async (fee, nextTimes) => {
        const times = nextTimes ?? feeTimes[fee.id] ?? 1;

        try {
            setSavingFeeId(fee.id);
            await updateHomeFeeTimes({
                condominiumId,
                homeId,
                homeFeeId: fee.id,
                times
            });
            setSavedFeeTimes((current) => ({
                ...current,
                [fee.id]: times
            }));
            toast.success(t("finance:feeUpdated"), { transition: Bounce });
        } catch (error) {
            const feeTimesValue = Number(fee.times);
            const previousTimes = savedFeeTimes[fee.id]
                ?? (Number.isFinite(feeTimesValue) ? feeTimesValue : 0);
            setFeeTimes((current) => ({
                ...current,
                [fee.id]: previousTimes
            }));

            const errorCode = error?.response?.data?.message;
            const translatedMessage = errorCode
                ? t(`validation:${errorCode}`)
                : t("server:error");
            toast.error(
                translatedMessage === `validation:${errorCode}`
                    ? t("server:error")
                    : translatedMessage,
                { transition: Bounce }
            );
        } finally {
            setSavingFeeId(null);
        }
    };

    const handleToggleOneTimeFee = (fee) => {
        const nextTimes = (feeTimes[fee.id] ?? 1) === 1 ? 0 : 1;

        setFeeTimes((current) => ({
            ...current,
            [fee.id]: nextTimes
        }));

        handleSaveFeeTimes(fee, nextTimes);
    };

    return (
        <>
            <ModalHome
                show={editHome}
                handleClose={handleClose}
                condominium={home.condominium}
                home={home}
                onSaved={fetchHome}
            />
            <div className="d-flex justify-content-center">
                <button className="hg-title my-2" onClick={handleOpen}>
                    <div className="d-flex justify-content-center align-items-center gap-3">

                        <div className="text-center">
                            <div className="fw-bold fs-4">
                                {homeTitle || null}
                            </div>
                        </div>

                        <img
                            src={homeIcon}
                            className="medium-icon"
                            alt="home"
                        />
                    </div>
                </button>
                <button className="hg-title my-2" onClick={handleBuildingOpen}>
                    <div className="d-flex justify-content-center align-items-center gap-3">
                        <img src={aptBuilding} className="medium-icon" alt="home" />
                    </div>
                </button>
            </div>
            <div className="d-flex justify-content-center mb-3">
                <div className="d-inline-flex align-items-center gap-3 border rounded-3 px-3 py-2 bg-light shadow-sm">

                    <div className="text-center">
                        <div className="fw-bold text-success">
                            {activeResidentCount}
                        </div>
                        <div className="small text-muted">
                            {t("home:activeResidents")}
                        </div>
                    </div>

                    <div className="vr"></div>

                    <div className="text-center">
                        <div className="fw-bold text-secondary">
                            {inactiveResidentCount}
                        </div>
                        <div className="small text-muted">
                            {t("home:inactiveResidents")}
                        </div>
                    </div>

                    <div className="vr"></div>

                    <div className="text-center">
                        <div className="fs-5 fw-bold text-primary">
                            {activeResidentCount + inactiveResidentCount}/{residentMaxCount}
                        </div>
                        <div className="small text-muted">
                            {t("home:residentMaxCount")}
                        </div>
                    </div>

                </div>
            </div>
            <div className="layout">
                {/* LEFT COLUMN */}
                <section className="homes-section">
                    <OwnerCard
                        home={home}
                        condominium={home.condominium}
                        onSaved={fetchHome}
                    />

                    {activeResidents.map((resident) => (
                        <CardResident
                            key={`${resident.id}-${resident.deleted}`}
                            resident={resident}
                            home={home}
                            condominium={home.condominium}
                            onSaved={fetchHome}
                        />
                    ))}

                    {inactiveResidents.length > 0 && (
                        <>
                            <hr className="my-3" />

                            {inactiveResidents.map((resident) => (
                                <CardResident
                                    key={`${resident.id}-${resident.deleted}`}
                                    resident={resident}
                                    home={home}
                                    condominium={home.condominium}
                                    onSaved={fetchHome}
                                />
                            ))}
                        </>
                    )}
                </section>
                {/* RIGHT COLUMN */}
                <section className="utility-section">

                    <div className="card bg-danger bg-opacity-25">
                        <div className="card-header d-flex justify-content-between align-items-center gap-3">
                            <div className="fs-3 fw-bold">
                                {t("finance:fees")}
                            </div>
                            <div className="d-flex align-items-center gap-3 text-center">
                                <div>
                                    <div className="fw-bold fs-5">
                                        {totalFeeCount}/{feeMaxCount}
                                    </div>
                                </div>
                                <div className="vr"></div>
                                <div>
                                    <span className="small text-muted">
                                        {t("finance:activeFees")}
                                    </span>
                                    <span>{" "}</span>
                                    <span className="fw-bold badge bg-success fs-6">
                                        {activeFeeCount}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            <FeeDashboard
                                fees={home.fees}
                                feeTimes={feeTimes}
                                savedFeeTimes={savedFeeTimes}
                                onTimesChange={handleFeeTimesChange}
                                onSaveTimes={handleSaveFeeTimes}
                                onToggleOneTime={handleToggleOneTimeFee}
                                savingFeeId={savingFeeId}
                                activeResidentCount={activeResidentCount}
                                total={totalFees}
                                t={t}
                            />
                        </div>
                    </div>
                </section>
            </div>

            <ModalBuilding
                show={buildingOpen}
                handleClose={() => setBuildingOpen(false)}
                condominium={home.condominium}
            />
        </>
    );
};

const FeeDashboard = ({
    fees,
    feeTimes,
    savedFeeTimes,
    onTimesChange,
    onSaveTimes,
    onToggleOneTime,
    savingFeeId,
    activeResidentCount,
    total,
    t
}) => (
    <>
        {fees.length ? (
            <div className="d-grid gap-2">
                {[...fees]
                    .sort((first, second) => {
                        const getGroup = (fee) => {
                            if (fee.primary) return 0;
                            if (fee.monthly) return 1;
                            if (fee.fund) return 3;
                            return 2;
                        };

                        return getGroup(first) - getGroup(second)
                            || first.name.localeCompare(second.name);
                    })
                    .map((fee) => {
                        const times = feeTimes[fee.id] ?? 1;
                        const savedTimes = savedFeeTimes[fee.id] ?? 1;
                        const value = Number(fee.value || 0);
                        const appliedTimes = fee.primary ? activeResidentCount : times;
                        const amount = fee.primary || fee.monthly
                            ? value * appliedTimes
                            : value;

                        return (
                            <div className="card border-primary rounded" key={fee.id}>
                                <div
                                    className={`card-body ${fee.fund
                                        ? "bg-secondary"
                                        : fee.primary
                                            ? "bg-warning"
                                            : fee.monthly
                                                ? "bg-info"
                                                : "bg-light"
                                        } p-2 bg-opacity-25`}
                                >
                                    <div className="d-flex justify-content-between align-items-start gap-2">
                                        <div className="fw-bold text-truncate d-flex align-items-center">
                                            {fee.fund ? (
                                                <span title={t("finance:fund")}>💰</span>
                                            ) : fee.primary ? (
                                                <span title={t("finance:primary")}>⭐</span>
                                            ) : fee.monthly ? (
                                                <span title={t("finance:monthlyFee")}>📅</span>
                                            ) : (
                                                <span title={t("finance:oneTimeFee")}>💶</span>
                                            )}
                                            <div className="text-start">
                                                <div>{fee.name}</div>
                                                {fee.fund && fee.fundId != null && fee.fundName && (
                                                    <div className="smaller-text fst-italic text-muted">
                                                        {t("finance:fund")} &quot;{fee.fundName}&quot;
                                                    </div>
                                                )}
                                            </div>
                                            {fee.fund && fee.fundId == null && (
                                                <OverlayTrigger
                                                    trigger={["hover", "focus", "click"]}
                                                    placement="top"
                                                    rootClose
                                                    overlay={
                                                        <Tooltip id={`home-fund-warning-${fee.id}`}>
                                                            {t("finance:fundNotAssigned")}
                                                        </Tooltip>
                                                    }
                                                >
                                                    <span className="text-warning ms-1 pointer">
                                                        <TriangleAlert size={20} color="red" />
                                                    </span>
                                                </OverlayTrigger>
                                            )}
                                        </div>
                                        <div className="text-end text-nowrap">
                                            <div className="fw-bold">{amount.toFixed(2)} €</div>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-2 pt-2 border-top small text-muted">
                                        {fee.primary ? (
                                            <>
                                                <span>{t("home:activeResidents")}</span>
                                                <span className="fw-bold">{activeResidentCount}</span>
                                            </>
                                        ) : (
                                            fee.monthly ? (
                                                <>
                                                    <span className={`text-start badge align-items-center me-auto ${savedTimes > 0 ? "bg-success" : "bg-secondary"}`}>
                                                        {savedTimes > 0 ? t("finance:active") : t("finance:inactive")}
                                                    </span>
                                                    <input
                                                        id={`fee-times-${fee.id}`}
                                                        className="form-control form-control-sm text-center"
                                                        style={{ width: "4.5rem" }}
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        value={times}
                                                        aria-label={t("finance:times")}
                                                        onChange={(event) => onTimesChange(fee, event.target.value)}
                                                    />
                                                    <span>×</span>
                                                    <span>{Number(fee.value || 0).toFixed(2)} €</span>
                                                    <span>=</span>
                                                    <span className="fw-bold text-dark">{amount.toFixed(2)} €</span>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className={`btn btn-sm ${times === 1 ? "btn-success" : "btn-secondary"}`}
                                                    disabled={savingFeeId === fee.id}
                                                    onClick={() => onToggleOneTime(fee)}
                                                    aria-label={t("finance:toggleStatus")}
                                                >
                                                    {savingFeeId === fee.id ? (
                                                        <Spinner
                                                            animation="border"
                                                            size="sm"
                                                            role="status"
                                                            aria-label={t("saving")}
                                                        />
                                                    ) : times === 1 ? t("finance:active") : t("finance:inactive")}
                                                </button>
                                            )
                                        )}
                                    </div>

                                    {!fee.primary && fee.monthly && times !== savedTimes && (
                                        <div className="d-flex justify-content-end mt-2">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-primary"
                                                disabled={savingFeeId === fee.id}
                                                onClick={() => onSaveTimes(fee)}
                                            >
                                                {savingFeeId === fee.id ? (
                                                    <Spinner
                                                        animation="border"
                                                        size="sm"
                                                        role="status"
                                                        aria-label={t("saving")}
                                                    />
                                                ) : t("save")}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
            </div>
        ) : (
            <p className="mb-0 text-muted">{t("finance:noFeesAssigned")}</p>
        )}

        {fees.length > 0 && (
            <div className="d-flex justify-content-between align-items-center fw-bold fs-5 mt-3 pt-3 border-top">
                <span>{t("total")}</span>
                <span>€ {total.toFixed(2)}</span>
            </div>
        )}
    </>
);

export default Home;
