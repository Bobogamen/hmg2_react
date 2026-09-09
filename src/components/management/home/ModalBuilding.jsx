import React, { useEffect, useState } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaBuilding, FaChevronRight, FaHome, FaSearch } from "react-icons/fa";
import { getHomes } from "../../../api/services/homeService";
import errorHandler from "../../errorHandling/errosHandler";
import { useUser } from "../../../user/UserContext";
import "./ModalBuilding.css";

const ModalBuilding = ({ show, handleClose, condominium }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { homeId } = useParams();
    const { logout } = useUser();
    const [homes, setHomes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [retry, setRetry] = useState(0);
    const [query, setQuery] = useState("");
    const [floor, setFloor] = useState("");
    const condominiumId = condominium?.id;

    useEffect(() => {
        if (show) { setQuery(""); setFloor(""); }
    }, [show, condominiumId]);

    useEffect(() => {
        if (!show || !condominiumId) return;
        let cancelled = false;
        setLoading(true);
        setFailed(false);
        setHomes([]);
        const fetchHomes = async () => {
            try {
                const data = await getHomes(condominiumId);
                if (!cancelled) setHomes(data);
            } catch (error) {
                if (!cancelled) {
                    setFailed(true);
                    errorHandler(error, undefined, navigate, t, logout);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchHomes();
        return () => { cancelled = true; };
    }, [show, condominiumId, logout, navigate, t, retry]);

    const compare = (a, b) => String(a ?? "").localeCompare(String(b ?? ""), undefined, { numeric: true });
    const floors = [...new Set(homes.map(home => home.floor)
        .filter(value => value != null && value !== "").map(String))].sort(compare);
    const search = query.trim().toLocaleLowerCase();
    const visibleHomes = homes.filter(home =>
        (floor === "" || String(home.floor) === floor)
        && [home.name, home.ownerName, home.floor].some(value =>
            String(value ?? "").toLocaleLowerCase().includes(search))
    ).sort((a, b) => compare(a.floor, b.floor) || compare(a.name, b.name));
    const resetFilters = () => { setQuery(""); setFloor(""); };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg" scrollable
            className="building-modal" aria-labelledby="building-modal-title">
            <Modal.Header closeButton className="border-0 px-4 pt-4 pb-3">
                <div className="d-flex align-items-center gap-3 overflow-hidden">
                    <span className="building-modal-icon"><FaBuilding aria-hidden="true" /></span>
                    <div className="overflow-hidden">
                        <Modal.Title id="building-modal-title" className="fw-bold fs-5 text-break">
                            {condominium?.name}
                        </Modal.Title>
                        <p className="text-muted small mb-0 mt-1">{t("home:buildingBrowseHint")}</p>
                    </div>
                </div>
            </Modal.Header>
            <Modal.Body className="px-4 pt-0 pb-4" aria-busy={loading}>
                {loading ? (
                    <div className="text-center py-5" role="status">
                        <Spinner animation="border" variant="primary" aria-hidden="true" />
                        <p className="text-muted mt-3 mb-0">{t("home:buildingLoading")}</p>
                    </div>
                ) : failed ? (
                    <div className="text-center py-5" role="alert">
                        <p>{t("home:buildingLoadError")}</p>
                        <Button variant="outline-primary" onClick={() => setRetry(value => value + 1)}>
                            {t("home:buildingRetry")}
                        </Button>
                    </div>
                ) : homes.length === 0 ? (
                    <div className="text-center text-muted py-5">
                        <FaHome size={32} className="mb-3" aria-hidden="true" />
                        <p className="mb-0">{t("home:noHomes")}</p>
                    </div>
                ) : (
                    <>
                        <div className="building-modal-filters">
                            <Form.Group controlId="building-home-search">
                                <Form.Label className="small fw-semibold">{t("home:buildingSearch")}</Form.Label>
                                <div className="position-relative">
                                    <FaSearch className="building-search-icon" aria-hidden="true" />
                                    <Form.Control type="search" value={query} className="building-search-input"
                                        placeholder={t("home:buildingSearchPlaceholder")}
                                        onChange={event => setQuery(event.target.value)} />
                                </div>
                            </Form.Group>
                            <Form.Group controlId="building-floor-filter">
                                <Form.Label className="small fw-semibold">{t("home:floor")}</Form.Label>
                                <Form.Select value={floor} onChange={event => setFloor(event.target.value)}>
                                    <option value="">{t("home:buildingAllFloors")}</option>
                                    {floors.map(value => <option key={value} value={value}>{value}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </div>
                        <div className="d-flex justify-content-between align-items-center gap-2 my-3">
                            <span className="small text-muted" role="status" aria-live="polite">
                                {t("home:buildingResults", { shown: visibleHomes.length, total: homes.length })}
                            </span>
                            {(query || floor) && <Button variant="link" size="sm" className="p-0" onClick={resetFilters}>
                                {t("home:buildingClearFilters")}
                            </Button>}
                        </div>
                        {visibleHomes.length === 0 ? (
                            <div className="text-center py-4">
                                <p className="fw-semibold mb-1">{t("home:buildingNoResults")}</p>
                                <p className="small text-muted mb-0">{t("home:buildingSearchHint")}</p>
                            </div>
                        ) : <ul className="building-home-list list-unstyled mb-0">
                            {visibleHomes.map(home => {
                                const current = String(home.id) === String(homeId);
                                return <li key={home.id}>
                                    <Link to={`/management/condominiums/${condominiumId}/homes/${home.id}`}
                                        onClick={handleClose} className={`building-home-card${current ? " is-current" : ""}`}
                                        aria-current={current ? "page" : undefined}>
                                        <span className="building-home-icon"><FaHome aria-hidden="true" /></span>
                                        <span className="building-home-details">
                                            <span className="d-flex flex-wrap align-items-center gap-2">
                                                <span className="fw-bold">{t("home:apt")} {home.name}</span>
                                                {current && <span className="badge bg-primary-subtle text-primary">
                                                    {t("home:buildingCurrentHome")}
                                                </span>}
                                            </span>
                                            <span className="small text-muted d-block mt-1">
                                                {t("home:floor")}: {home.floor ?? t("common:noInfo")}
                                            </span>
                                            <span className="small d-block mt-1 text-break">
                                                <span className="text-muted">{t("home:owner")}: </span>
                                                {home.ownerName || t("common:noInfo")}
                                            </span>
                                        </span>
                                        <FaChevronRight className="text-primary flex-shrink-0" size={12} aria-hidden="true" />
                                    </Link>
                                </li>;
                            })}
                        </ul>}
                    </>
                )}
            </Modal.Body>
            <Modal.Footer className="px-4 py-3">
                <Button variant="outline-secondary" onClick={handleClose}>{t("close")}</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalBuilding;
