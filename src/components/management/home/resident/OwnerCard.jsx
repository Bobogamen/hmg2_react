import React, { useState } from "react";
import { FaPhone, FaEnvelope, FaPencilAlt, FaExclamationTriangle, FaTrashRestore } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import ModalResident from "./ModalResident";
import ModalActivateResident from "./ModalActivateResident";
import { useLoading } from "../../../../loader/LoadingContext";
import { activateResident } from "../../../../api/services/residentService";
import { Bounce, toast } from "react-toastify";

const OwnerCard = ({
    home,
    condominium,
    onSaved
}) => {

    const { t } = useTranslation();
    const [showEdit, setShowEdit] = useState(false);
    const [showActivate, setShowActivate] = useState(false);
    const { setIsLoading } = useLoading();

    if (!home.owner) return null;

    const fullName = [
        home.owner.firstName,
        home.owner.middleName,
        home.owner.lastName

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
            <div className="card shadow-sm mb-2 border-danger">
                <div className={`
                    card-header
                    ${home?.owner?.deleted ? "bg-secondary bg-opacity-75" : "bg-danger"}
                    text-white
                    d-flex
                    justify-content-between
                    align-items-center
                    py-2
                `}>

                    <div className="text-start">
                        <div className="fw-bold fs-4">
                            {fullName || t("common:noInfo")}
                        </div>

                        {home?.owner?.deleted && (
                            <>
                                <div className="text-start fs-6 fw-bold text-bg-danger opacity-100 rounded d-inline-block px-2 me-2">
                                    {t("resident:inactive")}
                                </div>
                            </>
                        )}

                        <div className="text-start fs-6 fw-bold text-bg-warning rounded d-inline-block px-2">
                            {t("home:owner")}
                        </div>
                    </div>

                    <button
                        className="btn btn-sm btn-light"
                        onClick={() =>
                            home?.owner?.deleted
                                ? setShowActivate(true)
                                : setShowEdit(true)
                        }
                    >
                        {
                            home?.owner?.deleted ? (
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

                <div className="card-body p-2 text-start">
                    <Row
                        label={t("form:firstName")}
                        value={home.owner.firstName}
                        noInfo={t("common:noInfo")}
                    />

                    <Row
                        label={t("form:middleName")}
                        value={home.owner.middleName}
                        noInfo={t("common:noInfo")}
                    />

                    <Row
                        label={t("form:lastName")}
                        value={home.owner.lastName}
                        noInfo={t("common:noInfo")}
                    />

                    <Row
                        label={t("form:telephone")}
                        value={home.owner.phoneNumber}
                        icon={<FaPhone size={14} />}
                        noInfo={t("common:noInfo")}
                    />

                    <Row
                        label={t("Email")}
                        value={home.owner.email}
                        icon={<FaEnvelope size={14} />}
                        noInfo={t("common:noInfo")}
                    />
                </div>
            </div>

            {
                home?.owner?.deleted ?

                    <ModalActivateResident
                        show={showActivate}
                        handleClose={() => setShowActivate(false)}
                        home={home}
                        resident={home.owner}
                        onActivate={handleActivate}
                    />
                    :
                    <ModalResident
                        show={showEdit}
                        handleClose={() => setShowEdit(false)}
                        home={home}
                        condominium={condominium}
                        resident={home.owner}
                        isEditing={true}
                        isOwner={true}
                        onSaved={onSaved}
                    />
            }

        </>
    );
};

const Row = ({
    label,
    value,
    icon,
    noInfo
}) => (

    <>
        <div className="row p-1">
            <div className="
                col-4
                text-muted
                small
                fw-semibold
            ">
                {label}
            </div>

            <div className="
                col-8
                d-flex
                align-items-center
                fs-5
                gap-2
            ">
                {icon}

                {
                    value
                        ?
                        <span className="fw-bold">
                            {value}
                        </span>

                        :

                        <div className="
                        text-warning
                        fs-6
                        d-flex
                        align-items-center
                        gap-2
                    ">

                            <FaExclamationTriangle />
                            <span>
                                {noInfo}
                            </span>
                        </div>
                }
            </div>
        </div>
        <div className="border border-muted border-1"></div>
    </>
);


export default OwnerCard;