import React, { useState } from "react";
import { FaPhone, FaEnvelope, FaPencilAlt, FaExclamationTriangle, FaTrashRestore } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import ModalResident from "./ModalResident";
import ModalActivateResident from "./ModalActivateResident";
import { activateResident } from "../../../../api/services/residentService";
import { Bounce, toast } from "react-toastify";
import { useLoading } from "../../../../loader/LoadingContext";

const CardResident = ({
    resident,
    home,
    condominium,
    onSaved
}) => {

    const { t } = useTranslation();
    const [showEdit, setShowEdit] = useState(false);
    const [showActivate, setShowActivate] = useState(false);
    const { setIsLoading } = useLoading();

    if (!resident)
        return null;

    const fullName = [
        resident.firstName,
        resident.middleName,
        resident.lastName
    ]
        .filter(Boolean)
        .join(" ");

    const handleActivate = async (residentId) => {

        try {

            setIsLoading(true);

            await activateResident(
                condominium.id,
                home.id,
                residentId
            );

            toast.success(
                t("resident:activated"),
                {
                    transition: Bounce
                }
            );

            setShowActivate(false);
            await onSaved?.();

        } catch (error) {

            toast.error(
                t("server:error"),
                {
                    transition: Bounce
                }
            );

            console.error(
                "Failed to activate resident:",
                error
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div
                className={`card shadow-sm mb-2 ${resident.deleted
                    ? "border-secondary bg-light text-muted"
                    : "border-danger"
                    }`}
            >
                <div
                    className={`card-header d-flex justify-content-between align-items-center py-2 ${resident.deleted
                        ? "bg-secondary text-white bg-opacity-75"
                        : "bg-success"
                        }`}
                >
                    <div className="d-flex align-items-center gap-2">
                        <div className="text-start">
                            <div className="fw-bold fs-6 text-white">
                                {fullName || t("common:noInfo")}
                            </div>
                            <div className={`text-start fs-6 fw-bold ${resident.deleted ? "text-bg-danger opacity-100" : "text-bg-info"} rounded d-inline-block px-2`}>
                                {t(resident.deleted ? "resident:inactive" : "home:resident")}
                            </div>
                        </div>
                    </div>

                    <button
                        className="btn btn-sm btn-light"
                        onClick={() =>
                            resident.deleted
                                ? setShowActivate(true)
                                : setShowEdit(true)
                        }
                    >
                        {
                            resident.deleted ? (
                                <>
                                    <FaTrashRestore size={16} />
                                    {" "}
                                    {t("common:activate")}
                                </>
                            ) : (
                                <>
                                    <FaPencilAlt size={16} />
                                    {" "}
                                    {t("common:edit")}
                                </>
                            )
                        }
                    </button>

                </div>

                <div className={`card-body p-2 text-start up ${resident.deleted ? "opacity-50" : ""}`}>
                    <Row
                        label={t("form:firstName")}
                        value={resident.firstName}
                    />
                    <Row
                        label={t("form:middleName")}
                        value={resident.middleName}
                        noInfo={t("common:noInfo")}
                    />
                    <Row
                        label={t("form:lastName")}
                        value={resident.lastName}
                    />
                    <Row
                        label={t("form:telephone")}
                        value={resident.phoneNumber}
                        icon={<FaPhone size={14} />}
                        noInfo={t("common:noInfo")}
                    />
                    <Row
                        label={t("Email")}
                        value={resident.email}
                        icon={<FaEnvelope size={14} />}
                        noInfo={t("common:noInfo")}
                    />
                </div>
            </div>

            {
                resident.deleted ?

                    <ModalActivateResident
                        show={showActivate}
                        handleClose={() => setShowActivate(false)}
                        home={home}
                        resident={resident}
                        onActivate={handleActivate}
                    />

                    :
                    <ModalResident
                        show={showEdit}
                        handleClose={() => setShowEdit(false)}
                        home={home}
                        condominium={condominium}
                        resident={resident}
                        isEditing={true}
                        isOwner={false}
                        onSaved={onSaved}
                    />
            }
        </>
    );
};

const Row = ({ label, value, icon, noInfo }) => (
    <>
        <div className="row p-1">
            <div className="col-4 text-muted small fw-semibold">
                {label}
            </div>
            <div className="col-8 d-flex align-items-center fs-5 gap-2 small">
                {icon}
                {value ? (
                    <span className="fw-bold small">
                        {value}
                    </span>
                ) : (
                    <div className="text-warning fs-6 d-flex align-items-center gap-2">
                        <FaExclamationTriangle />
                        <span>
                            {noInfo}
                        </span>
                    </div>
                )}
            </div>
        </div>
        <div className="border border-muted border-1"></div>
    </>
);

export default CardResident;