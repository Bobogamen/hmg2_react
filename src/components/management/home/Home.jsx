import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import homeIcon from "../../../assets/images/app/home.png";

import ModalHome from "./ModalHome";
import Resident from "../Resident";

import { getHome } from "../../../api/services/homeService";
import { useLoading } from "../../../loader/LoadingContext";
import { useUser } from "../../../user/UserContext";
import errorHandler from "../../errorHandling/errosHandler";

const Home = () => {
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
        fees: []
    };

    const [home, setHome] = useState(initHome);
    const [editHome, setEditHome] = useState(false);

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

    const handleOpen = () => setEditHome(true);
    const handleClose = () => setEditHome(false);

    const homeTitle = [home.floor && `${t("floor")} ${home.floor}`, home.name]
        .filter(Boolean)
        .join(" • ");

    return (
        <>
            <ModalHome
                show={editHome}
                handleClose={handleClose}
                condominium={{ id: condominiumId }}
                inputData={home}
                onSaved={fetchHome}
            />

            <button className="hg-title my-2" onClick={handleOpen}>
                <div className="d-flex justify-content-center align-items-center gap-3">

                    <div className="text-center">

                        <div className="fw-bold fs-4">
                            {homeTitle || t("home")}
                        </div>

                        <div className="text-muted small">
                            {t("clickToEdit")}
                        </div>

                    </div>

                    <img
                        src={homeIcon}
                        className="medium-icon"
                        alt="home"
                    />

                </div>
            </button>

            <div className="layout">

                {/* LEFT COLUMN */}
                <section className="homes-section">

                    {home.residents.length === 0 ? (
                        <div className="text-center text-muted py-4">
                            {t("resident.noResidents")}
                        </div>
                    ) : (
                        home.residents.map((resident) => (
                            <Resident
                                key={resident.id}
                                resident={resident}
                                homeId={home.id}
                                onSaved={fetchHome}
                            />
                        ))
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
        </>
    );
};

export default Home;