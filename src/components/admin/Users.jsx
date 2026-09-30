import userLabels from "./userLabels";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Badge, Button, Card, Col, Container, Form, Modal, Row, Spinner } from "react-bootstrap";
import { Users as UsersIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useBreadcrumb } from "../breadcrumb/BreadcrumpContext";
import { getAdminUsers, updateAdminUser } from "../../api/services/adminUserService";
import { formatDate } from "../../utils/formatDate";
import "./Users.css";
import UserSettings from "./UserSettings";

export default function Users() {
  const label = key => userLabels[key];
  const { setBreadcrumbs } = useBreadcrumb();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ search: "", role: "", blocked: "", page: 0 });
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState(null);
  const [limit, setLimit] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const submitting = useRef(false);

  useEffect(() => {
    setBreadcrumbs([{ label: "Admin", path: "/admin" },
      { label: userLabels.title, color: "#198754" }]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    let active = true;
    setData(null);
    setError(false);
    const params = { ...filters };
    if (!params.role) delete params.role;
    if (params.blocked === "") delete params.blocked;
    getAdminUsers(params).then(result => { if (active) setData(result); })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [filters, revision]);

  const open = user => {
    setEditing(user); setLimit(String(Math.max(0, user.condominiumLimit))); setBlocked(user.blocked); setSaveError("");
  };
  const validLimit = /^-?\d+$/.test(limit) && Number.isSafeInteger(Number(limit))
    && Number(limit) >= 0 && Number(limit) <= 2147483647
    && (Number(limit) === 0 || Number(limit) >= editing?.condominiumCount);
  const save = async event => {
    event.preventDefault();
    if (!validLimit || submitting.current || settingsSaving) return;
    submitting.current = true; setSaving(true); setSaveError("");
    try {
      await updateAdminUser(editing.id, { blocked, condominiumLimit: Number(limit) });
      setEditing(null); setSaved(true); setRevision(value => value + 1);
    } catch (failure) {
      const code = failure.response?.data?.message;
      setSaveError(["adminCannotBeBlocked", "limitBelowAssignedBuildings", "invalidUserLimit"].includes(code) ? code : "saveError");
    } finally { submitting.current = false; setSaving(false); }
  };
  const roles = user => user.roles.map(role => <Badge key={role} bg={role === "ADMIN" ? "primary" : role === "MANAGER" ? "danger" : "secondary"} className="me-1">{role.charAt(0) + role.slice(1).toLowerCase()}</Badge>);
  const status = user => <Badge bg={user.blocked ? "danger" : "success"}>{label(user.blocked ? "blocked" : "active")}</Badge>;
  const capacity = user => `${user.condominiumCount} / ${user.condominiumLimit <= 0 ? "Unlimited" : user.condominiumLimit}`;
  const editButton = user => <Button variant="outline-success" size="sm" onClick={() => open(user)} aria-label={`${label("edit")} ${user.email}`}>{label("edit")}</Button>;

  return <Container className="mt-3 admin-users">
    <Card className="shadow-sm mb-3 border-0">
      <Card.Header className="fw-bold fs-5 bg-success text-white d-flex flex-wrap justify-content-between align-items-center gap-2">
        <span><UsersIcon size={22} aria-hidden="true" /> {label("title")}</span>
        {data && <Badge bg="light" text="dark">{label("results")}: {data.totalElements}</Badge>}
      </Card.Header>
      <Card.Body className="bg-light">
        <Form onSubmit={event => { event.preventDefault(); setFilters(current => ({ ...current, search: search.trim(), page: 0 })); }}>
          <Row className="g-3 align-items-end">
            <Col md={5}><Form.Group controlId="admin-user-search"><Form.Label>{label("search")}</Form.Label><Form.Control type="search" maxLength={200} value={search} onChange={e => setSearch(e.target.value)} /></Form.Group></Col>
            <Col xs={6} md={3}><Form.Group controlId="admin-user-role"><Form.Label>{label("roles")}</Form.Label><Form.Select value={filters.role} onChange={e => setFilters(current => ({ ...current, role: e.target.value, page: 0 }))}><option value="">{label("all")}</option>{["ADMIN", "MANAGER", "CASHIER"].map(role => <option key={role} value={role}>{role.charAt(0) + role.slice(1).toLowerCase()}</option>)}</Form.Select></Form.Group></Col>
            <Col xs={6} md={2}><Form.Group controlId="admin-user-status"><Form.Label>{label("status")}</Form.Label><Form.Select value={filters.blocked} onChange={e => setFilters(current => ({ ...current, blocked: e.target.value, page: 0 }))}><option value="">{label("all")}</option><option value="false">{label("active")}</option><option value="true">{label("blocked")}</option></Form.Select></Form.Group></Col>
            <Col md={2}><Button type="submit" variant="success" className="w-100">{label("find")}</Button></Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
    {saved && <Alert variant="success" dismissible onClose={() => setSaved(false)}>{label("saved")}</Alert>}
    {error ? <Alert variant="danger">{label("loadError")} <Button variant="outline-danger" onClick={() => setRevision(value => value + 1)}>{label("retry")}</Button></Alert>
      : !data ? <div role="status" className="text-center py-4"><Spinner size="sm" /> {label("loading")}</div>
      : !data.content.length ? <Alert variant="light">{label("empty")}</Alert> : <>
        <Card className="shadow-sm border-0 d-none d-md-block"><div className="table-responsive"><table className="table table-striped table-hover align-middle mb-0">
          <thead className="table-success"><tr>{["name", "email", "registered", "roles", "status", "capacity", "actions"].map(key => <th key={key}>{label(key)}</th>)}</tr></thead>
          <tbody>{data.content.map(user => <tr key={user.id}><td className="fw-bold">{user.name}</td><td>{user.email}</td><td>{formatDate(user.registeredOn, "en")}</td><td>{roles(user)}</td><td>{status(user)}</td><td>{capacity(user)}</td><td>{editButton(user)}</td></tr>)}</tbody>
        </table></div></Card>
        <div className="d-md-none">{data.content.map(user => <Card key={user.id} className="shadow-sm mb-3"><Card.Body><h2 className="h6">{user.name}</h2><p className="text-break">{user.email}</p><div className="mb-3">{roles(user)} {status(user)}</div><p>{label("registered")}: {formatDate(user.registeredOn, "en")}</p><p>{label("capacity")}: {capacity(user)}</p>{editButton(user)}</Card.Body></Card>)}</div>
      </>}
    {data && <nav className="admin-users-pagination d-flex justify-content-center align-items-center flex-wrap gap-3 my-3" aria-label={label("pages")}>
      <Button variant="success" disabled={filters.page === 0} onClick={() => setFilters(current => ({ ...current, page: current.page - 1 }))}><ChevronLeft size={20} aria-hidden="true" /> {label("previous")}</Button>
      <span>{filters.page + 1} / {Math.max(1, data.totalPages)}</span>
      <Button variant="success" disabled={filters.page + 1 >= data.totalPages} onClick={() => setFilters(current => ({ ...current, page: current.page + 1 }))}>{label("next")} <ChevronRight size={20} aria-hidden="true" /></Button>
    </nav>}
    <Modal show={!!editing} onHide={() => { if (!submitting.current && !settingsSaving) setEditing(null); }} centered size="lg" scrollable backdrop={saving || settingsSaving ? "static" : true} keyboard={!saving && !settingsSaving} aria-labelledby="admin-user-edit-title">
      <Form onSubmit={save} className="admin-user-edit-form">
        <Modal.Header closeButton={!saving && !settingsSaving} className="bg-success text-white"><Modal.Title id="admin-user-edit-title" className="fs-5">{label("edit")}</Modal.Title></Modal.Header>
        <Modal.Body>{editing && <>
          <h3 className="h6">{editing.name}</h3><p className="text-break text-muted">{editing.email}</p>
          {saveError && <Alert variant="danger">{label(saveError)}</Alert>}
          <Form.Group controlId="admin-user-limit" className="mb-3"><Form.Label>{label("limit")}</Form.Label><Form.Control type="number" min={0} max={2147483647} step={1} required value={limit} disabled={saving} isInvalid={!validLimit} onChange={e => setLimit(e.target.value)} aria-describedby="admin-user-limit-help" /><Form.Text id="admin-user-limit-help">{label("limitHelp")} {label("assigned")}: {editing.condominiumCount}</Form.Text></Form.Group>
          <Form.Check id="admin-user-blocked" type="switch" label={label("blocked")} checked={blocked} disabled={saving || editing.roles.includes("ADMIN")} onChange={e => setBlocked(e.target.checked)} />
          <p className="small text-muted mt-2">{label(editing.roles.includes("ADMIN") ? "adminCannotBeBlocked" : "blockHelp")}</p>
          <UserSettings key={editing.id} userId={editing.id} disabled={saving} onBusy={setSettingsSaving} />
        </>}</Modal.Body>
        <Modal.Footer><Button variant="secondary" disabled={saving || settingsSaving} onClick={() => setEditing(null)}>{label("cancel")}</Button><Button variant="success" type="submit" disabled={saving || settingsSaving || !validLimit}>{saving && <Spinner size="sm" className="me-2" />}{label("save")}</Button></Modal.Footer>
      </Form>
    </Modal>
  </Container>;
}
