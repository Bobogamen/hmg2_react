import React, { useEffect, useMemo, useState } from "react";
import { Accordion, Alert, Badge, Button, Form, Modal, Spinner } from "react-bootstrap";
import { Activity, Building2, Clock3, Pencil, RefreshCw, Search, SlidersHorizontal, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getAdminUserProfile } from "../../api/services/adminUserProfileService";
import bg from "../../locales/bg/adminUserProfile.json";
import en from "../../locales/en/adminUserProfile.json";
import "./AdminUserProfile.css";

export default function AdminUserProfile({ userId, onHide, onEdit }) {
  const { i18n } = useTranslation();
  const locale = (i18n.resolvedLanguage || i18n.language || "en").startsWith("bg") ? "bg" : "en";
  const copy = locale === "bg" ? bg : en;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [level, setLevel] = useState("ALL");
  useEffect(() => {
    const controller = new AbortController();
    setData(null); setError(null); setPage(0);
    getAdminUserProfile(userId, controller.signal).then(result => {
      if (!controller.signal.aborted) setData(result);
    }).catch(failure => {
      if (!controller.signal.aborted) setError(failure.response?.status === 404 ? "notFound" : "loadError");
    });
    return () => controller.abort();
  }, [userId, revision]);
  useEffect(() => { setSearch(""); setPage(0); setLevel("ALL"); }, [userId]);
  const buildings = useMemo(() => (data?.buildings || []).filter(building =>
    `${building.name} ${building.city} ${building.address}`.toLocaleLowerCase(locale).includes(search.trim().toLocaleLowerCase(locale))), [data, search, locale]);
  const date = value => value ? new Date(value.length === 10 ? `${value}T12:00:00` : value).toLocaleString(locale === "bg" ? "bg-BG" : "en-GB",
    { day: "2-digit", month: "short", year: "numeric", ...(value.length > 10 ? { hour: "2-digit", minute: "2-digit" } : {}) }) : copy.noActivity;
  const number = value => new Intl.NumberFormat(locale).format(value);
  const usage = item => {
    const reached = item.limit > 0 && item.used >= item.limit;
    return <div className={`admin-profile-usage ${reached ? "is-reached" : ""}`} key={item.key}>
      <div className="admin-profile-usage-heading"><span>{copy.limits[item.key] || item.key}</span>
        {reached && <Badge bg="warning" text="dark">{copy.reached}</Badge>}</div>
      <strong>{number(item.used)} <span>/ {item.limit === 0 ? copy.unlimited : number(item.limit)}</span></strong>
      {item.limit > 0 && <div className="admin-profile-meter" role="progressbar" aria-label={copy.limits[item.key] || item.key}
        aria-valuemin={0} aria-valuemax={item.limit} aria-valuenow={Math.min(item.used, item.limit)}
        aria-valuetext={`${number(item.used)} / ${number(item.limit)}`}><div style={{ width: `${Math.min(100, item.used / item.limit * 100)}%` }} /></div>}
      {item.key === "fee_home_limit" && <small>{copy.homeFeeHint}</small>}
    </div>;
  };
  const actions = data?.recentActions.filter(action => level === "ALL" || action.level === level) || [];
  const reached = data ? [...data.limits, ...data.buildings.flatMap(building => [...building.limits, ...building.funds.map(fund => fund.usage)])]
    .filter(item => item.limit > 0 && item.used >= item.limit).length : 0;

  return <Modal show onHide={onHide} size="xl" centered scrollable className="admin-profile-modal" aria-labelledby="admin-profile-title">
    <Modal.Header closeButton closeLabel={copy.close}><Modal.Title id="admin-profile-title"><UserRound size={23} aria-hidden="true" />{copy.title}</Modal.Title></Modal.Header>
    <Modal.Body className="admin-profile">
      {!data && !error && <div role="status" className="admin-profile-state"><Spinner variant="success" /><span>{copy.loading}</span></div>}
      {error && <Alert variant="danger"><p>{copy[error]}</p>{error !== "notFound" && <Button variant="outline-danger" onClick={() => setRevision(value => value + 1)}>{copy.retry}</Button>}</Alert>}
      {data && <>
        <section className="admin-profile-identity" aria-label={copy.account}>
          <span className="admin-profile-avatar" aria-hidden="true">{data.user.name?.charAt(0)?.toUpperCase() || "U"}</span>
          <div className="admin-profile-name"><h2>{data.user.name}</h2><p>{data.user.email}</p><span className="small text-muted">{copy.registered}: {date(data.user.registeredOn)}</span></div>
          <div className="admin-profile-badges"><Badge bg={data.user.blocked ? "danger" : "success"}>{copy[data.user.blocked ? "blocked" : "active"]}</Badge>
            {data.user.roles.map(role => <Badge bg="light" text="dark" className="border" key={role}>{copy.roles[role] || role}</Badge>)}</div>
        </section>
        <div className="admin-profile-summary">
          <div><Building2 size={20} aria-hidden="true" /><span>{copy.buildings}</span><strong>{number(data.buildings.length)}</strong></div>
          <div><SlidersHorizontal size={20} aria-hidden="true" /><span>{copy.reachedLimits}</span><strong className={reached ? "text-warning-emphasis" : ""}>{number(reached)}</strong></div>
          <div><Clock3 size={20} aria-hidden="true" /><span>{copy.lastActivity}</span><strong className="admin-profile-date">{date(data.lastActivity)}</strong></div>
        </div>
        <p className="admin-profile-note">{copy.activityHint}</p>

        <section className="admin-profile-section" aria-labelledby="admin-profile-account-limits">
          <h3 id="admin-profile-account-limits"><SlidersHorizontal size={20} aria-hidden="true" />{copy.accountLimits}</h3>
          <p>{copy.limitsHint}</p><div className="admin-profile-usage-grid">{data.limits.map(usage)}</div>
        </section>

        <section className="admin-profile-section" aria-labelledby="admin-profile-buildings">
          <h3 id="admin-profile-buildings"><Building2 size={20} aria-hidden="true" />{copy.buildings}</h3><p>{copy.buildingsHint}</p>
          {data.buildings.length > 0 && <Form.Group controlId="admin-profile-building-search" className="admin-profile-search"><Form.Label><Search size={16} aria-hidden="true" /> {copy.search}</Form.Label>
            <Form.Control type="search" value={search} maxLength={200} onChange={event => { setSearch(event.target.value); setPage(0); }} /></Form.Group>}
          {!buildings.length ? <p className="admin-profile-empty">{data.buildings.length ? copy.noMatches : copy.noBuildings}</p>
            : <Accordion className="admin-profile-buildings" key={`${search}:${page}`} alwaysOpen>{buildings.slice(page * 6, page * 6 + 6).map(building => <Accordion.Item eventKey={String(building.id)} key={building.id}>
              <Accordion.Header><span><strong>{building.name}</strong><span className="admin-profile-building-address">{building.city}, {building.address}</span></span><Badge bg="light" text="dark" className="ms-auto me-3">{number(building.homes)} {copy.homes}</Badge></Accordion.Header>
              <Accordion.Body><div className="admin-profile-usage-grid">{building.limits.map(usage)}</div>
                {building.funds.length > 0 && <div className="admin-profile-funds"><h4>{copy.fundLimits}</h4>{building.funds.map(fund => <div key={fund.id}><h5>{fund.name}</h5>{usage(fund.usage)}</div>)}</div>}
              </Accordion.Body>
            </Accordion.Item>)}</Accordion>}
          {buildings.length > 6 && <nav className="admin-profile-pagination" aria-label={copy.buildingsPages}>
            <Button variant="outline-success" disabled={page === 0} onClick={() => setPage(value => value - 1)}>{copy.previous}</Button>
            <span>{page + 1} / {Math.ceil(buildings.length / 6)}</span>
            <Button variant="outline-success" disabled={(page + 1) * 6 >= buildings.length} onClick={() => setPage(value => value + 1)}>{copy.next}</Button>
          </nav>}
        </section>

        <section className="admin-profile-section" aria-labelledby="admin-profile-actions">
          <div className="admin-profile-actions-heading"><div><h3 id="admin-profile-actions"><Activity size={20} aria-hidden="true" />{copy.actions}</h3><p>{copy.actionsHint}</p></div>
            <Form.Group controlId="admin-profile-action-level"><Form.Label>{copy.level}</Form.Label><Form.Select value={level} onChange={event => setLevel(event.target.value)}>
              <option value="ALL">{copy.allLevels}</option><option value="INFO">{copy.levels.INFO}</option><option value="WARN">{copy.levels.WARN}</option><option value="ERROR">{copy.levels.ERROR}</option>
            </Form.Select></Form.Group></div>
          {actions.length ? <ol className="admin-profile-actions">{actions.map(action => <li key={action.id}>
            <div><Badge bg={action.level === "ERROR" ? "danger" : action.level === "WARN" ? "warning" : "secondary"} text={action.level === "WARN" ? "dark" : "white"}>{copy.levels[action.level] || action.level}</Badge><time>{date(action.timestamp)}</time></div>
            <p>{action.action}</p>
          </li>)}</ol> : <p className="admin-profile-empty">{data.recentActions.length ? copy.noActionsForFilter : copy.noActions}</p>}
        </section>
      </>}
    </Modal.Body>
    <Modal.Footer className="admin-profile-footer"><Button variant="outline-secondary" onClick={onHide}>{copy.close}</Button>
      <Button variant="outline-success" disabled={!data && !error} onClick={() => setRevision(value => value + 1)}><RefreshCw size={17} aria-hidden="true" />{copy.refresh}</Button>
      <Button variant="success" disabled={!data} onClick={() => onEdit(data.user)}><Pencil size={17} aria-hidden="true" />{copy.edit}</Button>
    </Modal.Footer>
  </Modal>;
}
