import React, { useCallback, useEffect, useState } from "react";
import { Modal, Spinner, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaBuilding, FaHome } from "react-icons/fa";

import { getHomes } from "../../../api/services/homeService";
import errorHandler from "../../errorHandling/errosHandler";
import { useUser } from "../../../user/UserContext";

const ModalBuilding = ({
    show,
    handleClose,
    condominium
}) => {

    const { t } = useTranslation();
    const navigate = useNavigate();

    const { logout } = useUser();

    const [homes, setHomes] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchHomes = useCallback(async () => {

        setLoading(true);

        try {

            const data = await getHomes(condominium.id);

            setHomes(data);

        } catch (error) {

            errorHandler(
                error,
                undefined,
                navigate,
                t,
                logout
            );

        } finally {

            setLoading(false);

        }

    }, [
        condominium,
        logout,
        navigate,
        t
    ]);

    useEffect(() => {

        if (!show || !condominium?.id)
            return;

        fetchHomes();

    }, [
        show,
        condominium?.id,
        fetchHomes
    ]);

    const openHome = (homeId) => {

        handleClose();

        navigate(
            `/management/condominiums/${condominium.id}/homes/${homeId}`
        );
    };

    return (

        <Modal
            show={show}
            onHide={handleClose}
            centered
            size="lg"
        >

            <Modal.Header closeButton>

                <Modal.Title>
                    <FaBuilding className="me-2"/>
                    {condominium?.name}
                </Modal.Title>

            </Modal.Header>

            <Modal.Body className="p-2">

                {loading ? (

                    <div className="d-flex justify-content-center align-items-center py-5">

                        <Spinner animation="border"/>

                    </div>

                ) : homes.length === 0 ? (

                    <div className="text-center text-muted py-4">
                        {t("common:noData")}
                    </div>

                ) : (

                    <Table
                        hover
                        responsive
                        className="mb-0 align-middle"
                    >

                        <thead>

                            <tr>

                                <th>
                                    {t("home:home")}
                                </th>

                                <th>
                                    {t("home:floor")}
                                </th>

                                <th>
                                    {t("home:owner")}
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {homes.map((home) => (

                                <tr
                                    key={home.id}
                                    role="button"
                                    onClick={() => openHome(home.id)}
                                    style={{
                                        cursor: "pointer"
                                    }}
                                >

                                    <td>

                                        <FaHome
                                            className="me-2"
                                            size={16}
                                        />

                                        <strong>
                                            {t("home:apt")} {home.name}
                                        </strong>

                                    </td>

                                    <td>
                                        {home.floor}
                                    </td>

                                    <td>

                                        {home.ownerName || (
                                            <span className="text-muted">
                                                {t("common:noInfo")}
                                            </span>
                                        )}

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </Table>

                )}

            </Modal.Body>

        </Modal>

    );
};

export default ModalBuilding;