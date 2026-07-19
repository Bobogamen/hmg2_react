import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import homeIcon from "../../../assets/images/app/home.png";
import aptBuilding from "../../../assets/images/app/apartment_building.png";
import ModalHome from "./ModalHome";

import { getHome } from "../../../api/services/homeService";
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
    const [editHome, setEditHome] = useState(false);
    const [buildingOpen, setBuildingOpen] = useState(false);

    const fetchHome = useCallback(async () => {
        setIsLoading(true);

        try {
            const data = await getHome({ condominiumId, homeId });
            setHome(data);

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

                    <div className="card shadow-sm">

                        <div className="card-header fw-bold">
                            {t("fees")}
                        </div>

                        <div className="card-body">
                            {t("comingSoon")}
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

export default Home;