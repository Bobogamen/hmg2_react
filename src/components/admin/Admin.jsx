import React, { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Container, Form, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Activity, ArrowRight, Building2, CheckCircle2, CircleAlert, House, RefreshCw, Settings, ShieldCheck, Users, UserPlus } from "lucide-react";
import { useBreadcrumb } from "../breadcrumb/BreadcrumpContext";
import { getAdminDashboard } from "../../api/services/adminDashboardService";
import bg from "../../locales/bg/adminDashboard.json";
import en from "../../locales/en/adminDashboard.json";
import "./Admin.css";

const NavigationButton = props => <Button as={Link} role="link" {...props} />;

export default function Admin() {
  const { i18n } = useTranslation();
  const language = (i18n.resolvedLanguage || i18n.language || "en").startsWith("bg") ? "bg" : "en";
  const copy = language === "bg" ? bg : en;
  const { setBreadcrumbs } = useBreadcrumb();
  const [days, setDays] = useState(7);
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => { setBreadcrumbs([{ label: copy.title }]); }, [setBreadcrumbs, copy.title]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(false); setData(null);
    getAdminDashboard(days, controller.signal).then(result => {
      if (!controller.signal.aborted) setData(result);
    }).catch(() => {
      if (!controller.signal.aborted) setError(true);
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [days, revision]);
  const number = value => new Intl.NumberFormat(language).format(value);
  const date = (value, time = false) => value ? new Date(value).toLocaleString(language === "bg" ? "bg-BG" : "en-GB",
    { day: "2-digit", month: "short", year: "numeric", ...(time ? { hour: "2-digit", minute: "2-digit" } : {}) }) : "—";
  const userLink = user => `/admin/users?profile=${encodeURIComponent(user.id)}`;
  const empty = text => <div className="admin-dashboard-empty"><CheckCircle2 size={24} aria-hidden="true" /><p>{text}</p></div>;
  const metrics = [
    { key: "users", icon: Users, hint: "usersHint", tone: "green" },
    { key: "condominiums", icon: Building2, hint: "buildingsHint", tone: "blue" },
    { key: "homes", icon: House, hint: "homesHint", tone: "blue" },
    { key: "registrations", icon: UserPlus, hint: "periodHint", tone: "green" }
  ];
  return <Container className="admin-dashboard my-3">
    <header className="admin-dashboard-hero">
      <div className="admin-dashboard-heading"><span className="admin-dashboard-emblem"><ShieldCheck size={28} aria-hidden="true" /></span>
        <div><div className="admin-dashboard-eyebrow">{copy.administration}</div><h1>{copy.title}</h1><p>{copy.subtitle}</p></div>
      </div>
      <div className="admin-dashboard-controls">
        <Form.Group controlId="dashboard-period"><Form.Label>{copy.period}</Form.Label>
          <Form.Select value={days} onChange={event => setDays(Number(event.target.value))}>
            <option value={7}>{copy.week}</option><option value={30}>{copy.month}</option>
          </Form.Select>
        </Form.Group>
        <Button variant="success" disabled={loading} onClick={() => setRevision(value => value + 1)}>
          {loading ? <Spinner size="sm" /> : <RefreshCw size={18} aria-hidden="true" />}{copy.refresh}
        </Button>
      </div>
    </header>
    <nav className="admin-dashboard-shortcuts" aria-label={copy.shortcuts}>
      <Link to="/admin/users" className="admin-dashboard-section-link"><Users size={24} aria-hidden="true" /><span>{copy.manageUsers}</span></Link>
      <Link to="/admin/application-settings" className="admin-dashboard-section-link"><Settings size={24} aria-hidden="true" /><span>{copy.settings}</span></Link>
      <Link to="/admin/application-logs" className="admin-dashboard-section-link"><Activity size={24} aria-hidden="true" /><span>{copy.logs}</span></Link>
    </nav>
    {loading && <div role="status" className="admin-dashboard-loading"><Spinner animation="border" variant="success" /><span>{copy.loading}</span></div>}
    {error && <Alert variant="danger" className="d-flex flex-wrap align-items-center justify-content-between gap-3"><span>{copy.loadError}</span>
      <Button variant="outline-danger" onClick={() => setRevision(value => value + 1)}>{copy.retry}</Button></Alert>}
    {data && <>
      <div className="admin-dashboard-updated">{copy.updated}: {date(data.generatedAt, true)}<span>{copy.period}: {date(data.periodStart)} – {date(data.periodEnd)}</span></div>
      <section className="admin-dashboard-metrics" aria-label={copy.overview}>
        {metrics.map(({ key, icon: Icon, hint, tone }) => <Card key={key} className="admin-dashboard-metric">
          <Card.Body><div className="d-flex justify-content-between align-items-center gap-2"><h2>{copy[key]}</h2><span className={`admin-dashboard-icon ${tone}`}><Icon size={22} aria-hidden="true" /></span></div>
            <div className="admin-dashboard-value">{number(data[key])}</div><p>{copy[hint]}</p>
          </Card.Body>
        </Card>)}
      </section>
      <div className="admin-dashboard-section-heading"><h2>{copy.attention}</h2><p>{copy.attentionHint}</p></div>
      <div className="admin-dashboard-panels">
        <Card as="section" className="admin-dashboard-panel">
          <Card.Body><div className="admin-dashboard-panel-heading"><h3><CircleAlert size={20} aria-hidden="true" />{copy.errors}</h3><Badge bg={data.errors ? "danger" : "success"}>{number(data.errors)}</Badge></div>
            <p className="admin-dashboard-description">{copy.errorsHint}</p>
            {data.recentErrors.length ? <ul className="admin-dashboard-list">{data.recentErrors.map(log => <li key={log.id}>
              <div><strong>{log.action}</strong><span>{log.userEmail || copy.system}</span><time>{date(log.timestamp, true)}</time></div><Badge bg="danger">{copy.errorBadge}</Badge>
            </li>)}</ul> : empty(copy.noErrors)}
            {data.errors > data.recentErrors.length && <p className="admin-dashboard-description">{copy.latestFive}</p>}
          </Card.Body><Card.Footer><NavigationButton to="/admin/application-logs?level=ERROR" variant="outline-danger">{copy.viewErrors}<ArrowRight size={16} aria-hidden="true" /></NavigationButton></Card.Footer>
        </Card>
        <Card as="section" className="admin-dashboard-panel">
          <Card.Body><div className="admin-dashboard-panel-heading"><h3><Building2 size={20} aria-hidden="true" />{copy.limits}</h3><Badge bg={data.reachedLimits ? "warning" : "success"} text={data.reachedLimits ? "dark" : "white"}>{number(data.reachedLimits)}</Badge></div>
            <p className="admin-dashboard-description">{copy.limitsHint}</p>
            {data.capacityAlerts.length ? <ul className="admin-dashboard-list">{data.capacityAlerts.map(user => <li key={user.id} className="admin-dashboard-capacity">
              <div><strong>{user.name}</strong><span>{user.email}</span><span className="admin-dashboard-capacity-label">{copy.condominiums}: <b>{number(user.used)} / {number(user.limit)}</b></span>
                <div className="admin-dashboard-capacity-track" aria-hidden="true"><div /></div>
              </div><NavigationButton to={userLink(user)} variant="outline-success" size="sm" aria-label={`${copy.review}: ${user.name}`}>{copy.review}<ArrowRight size={15} aria-hidden="true" /></NavigationButton>
            </li>)}</ul> : empty(copy.noLimits)}
            {data.reachedLimits > data.capacityAlerts.length && <p className="admin-dashboard-description">{copy.limitsPreview}</p>}
          </Card.Body><Card.Footer><NavigationButton to="/admin/users" variant="outline-success">{copy.manageLimits}<ArrowRight size={16} aria-hidden="true" /></NavigationButton></Card.Footer>
        </Card>
      </div>
      <Card as="section" className="admin-dashboard-panel mt-4">
        <Card.Body><div className="admin-dashboard-panel-heading"><h3><UserPlus size={20} aria-hidden="true" />{copy.recentRegistrations}</h3><Badge bg="success">{number(data.registrations)}</Badge></div>
          <p className="admin-dashboard-description">{copy.registrationsHint}</p>
          {data.recentRegistrations.length ? <ul className="admin-dashboard-list admin-dashboard-registrations">{data.recentRegistrations.map(user => <li key={user.id}>
            <span className="admin-dashboard-avatar" aria-hidden="true">{user.name?.charAt(0)?.toUpperCase() || "U"}</span>
            <div><strong>{user.name}</strong><span>{user.email}</span></div><time>{date(user.registeredOn)}</time>
            <NavigationButton to={userLink(user)} variant="outline-success" size="sm" aria-label={`${copy.review}: ${user.name}`}>{copy.review}<ArrowRight size={15} aria-hidden="true" /></NavigationButton>
          </li>)}</ul> : empty(copy.noRegistrations)}
        </Card.Body>
      </Card>
    </>}
  </Container>;
}
