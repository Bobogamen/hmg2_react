import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import settings from "../../../assets/images/app/settings.png";
import addHome from "../../../assets/images/app/add_home.png";
import saveIcon from "../../../assets/images/app/tick.png";
import ModalHome from "./ModalHome";
import ModalResident from "../ModalResident";
import SortableRow from "../../../utils/SortableRow";
import { saveHomeOrder } from "../../../api/services/homeService";

const getHomeIds = (homes) => homes.map((home) => home.id);

const isSameOrder = (firstIds, secondIds) =>
    firstIds.length === secondIds.length &&
    firstIds.every((id, index) => id === secondIds[index]);

const HomesTable = ({ condominium, onSaved }) => {
    const { t } = useTranslation();

    const [openHomeModal, setOpenHomeModal] = useState(false);
    const [openResidentModal, setOpenResidentModal] = useState(false);
    const [selectedHome, setSelectedHome] = useState(null);

    const [items, setItems] = useState([]);
    const [savedHomeIds, setSavedHomeIds] = useState([]);
    const [hasOrderChanges, setHasOrderChanges] = useState(false);

    useEffect(() => {
        const orderedHomes = condominium?.homes || [];

        setItems(orderedHomes);
        setSavedHomeIds(getHomeIds(orderedHomes));
        setHasOrderChanges(false);
    }, [condominium?.homes, condominium?.id]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const handleDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = items.findIndex(
            (item) => item.id === active.id
        );

        const newIndex = items.findIndex(
            (item) => item.id === over.id
        );

        if (oldIndex === -1 || newIndex === -1) {
            return;
        }

        const nextItems = arrayMove(items, oldIndex, newIndex);
        const nextHomeIds = getHomeIds(nextItems);

        setItems(nextItems);
        setHasOrderChanges(!isSameOrder(nextHomeIds, savedHomeIds));
    };

    const handleSaveOrder = async () => {
        if (!hasOrderChanges || !condominium?.id) {
            return;
        }

        const nextHomeIds = getHomeIds(items);

        await saveHomeOrder({
            condominiumId: condominium.id,
            homeIds: nextHomeIds
        });

        setSavedHomeIds(nextHomeIds);
        setHasOrderChanges(false);
        await onSaved?.();
    };

    const handleOpenHomeModal = (homeData = null) => {
        setSelectedHome(homeData);
        setOpenHomeModal(true);
    };

    const handleCloseHomeModal = () => {
        setOpenHomeModal(false);
        setSelectedHome(null);
    };

    return (
        <div className="bg-info bg-opacity-50 border border-3 border-primary border-opacity-50 rounded-5 shadow-lg p-3 mx-1">
            <div className="position-relative d-flex justify-content-center align-items-center mb-1">
                <div className="d-flex justify-content-center align-items-center">
                    <h4 className="text-capitalize fw-bold">
                        {t("home:homes")}&nbsp;
                    </h4>

                    <h4>
                        {items.length}
                        {t("home:pcs")}
                    </h4>
                </div>
                {hasOrderChanges && (
                    <button
                        type="button"
                        className="position-absolute end-0 border-0 bg-transparent p-0"
                        onClick={handleSaveOrder}
                        title={t("save")}>
                        <img
                            src={saveIcon}
                            alt="save"
                            className="icon pointer"
                        />
                    </button>
                )}
            </div>

            {items.length > 0 ? (
                <>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}>
                        <Table bordered striped hover size="sm">
                            <thead className="align-middle">
                                <tr className="fw-bold">
                                    <td>{t("home:fl")}</td>
                                    <td>{t("home:apt")}</td>
                                    <td className="w-50">
                                        {t("home:owner")}
                                    </td>
                                    <td>{t("home:residents")}</td>
                                    <td>{t("home:total")} €</td>
                                    <td>
                                        <img
                                            src={settings}
                                            alt="settings"
                                            className="icon"
                                        />
                                    </td>
                                </tr>
                            </thead>
                            <SortableContext
                                items={items.map((item) => item.id)}
                                strategy={verticalListSortingStrategy}>
                                <tbody className="align-middle">
                                    {items.map((home) => (
                                        <SortableRow
                                            key={home.id}
                                            home={home}
                                            condominiumId={condominium.id}
                                            onOpenResidentModal={() => {
                                                setSelectedHome(home);
                                                setOpenResidentModal(true)
                                            }}
                                        />
                                    ))}
                                </tbody>
                            </SortableContext>
                        </Table>
                    </DndContext>
                </>
            ) : (
                <div>
                    <p className="mt-3 fw-bold">
                        {t("home:noHomes")}
                    </p>
                </div>
            )}

            <ModalResident
                show={openResidentModal}
                handleClose={() => setOpenResidentModal(false)}
                home={selectedHome}
            />

            <ModalHome
                show={openHomeModal}
                handleClose={handleCloseHomeModal}
                condominium={condominium}
                inputData={selectedHome}
                onSaved={onSaved}
            />

            <div
                className="img-button pointer m-auto mt-3"
                onClick={() => handleOpenHomeModal()}
            >
                <img
                    src={addHome}
                    className="icon"
                    alt="add"
                />

                <span className="ms-1">
                    {t("add")}
                </span>
            </div>
        </div>
    );
};

export default HomesTable;
