import React, { useEffect, useRef, useState } from "react";
import { Alert, Badge, Button, Form, Spinner } from "react-bootstrap";
import { getAdminUserSettings, updateAdminUserSetting } from "../../api/services/adminUserService";

export default function UserSettings({ userId, disabled, onBusy }) {
  const [settings, setSettings] = useState(null);
  const [values, setValues] = useState({});
  const [error, setError] = useState("");
  const [savingKey, setSavingKey] = useState(null);
  const [savedKey, setSavedKey] = useState(null);
  const [revision, setRevision] = useState(0);
  const busy = useRef(false);
  useEffect(() => {
    let active = true;
    setSettings(null); setError("");
    getAdminUserSettings(userId).then(data => {
      if (!active) return;
      const visible = data.filter(setting => setting.settingKey !== "condominium_limit");
      setSettings(visible);
      setValues(Object.fromEntries(visible.map(setting => [rowKey(setting), setting.value])));
    }).catch(() => { if (active) setError("Settings could not be loaded. Please try again."); });
    return () => { active = false; };
  }, [userId, revision]);

  const valid = setting => {
    const value = values[rowKey(setting)];
    if (!value || !value.trim()) return false;
    if (setting.type === "INTEGER") {
      const min = setting.settingKey === "condominium_start_date" ? 1 : 0;
      const max = setting.settingKey === "condominium_start_date" ? 9999 : 2147483647;
      return /^\d+$/.test(value) && Number(value) >= min && Number(value) <= max;
    }
    if (setting.type === "DOUBLE") return Number.isFinite(Number(value)) && Number(value) >= 0;
    return true;
  };

  const save = async (setting, reset = false) => {
    if (busy.current || disabled || (!reset && !valid(setting))) return;
    const key = rowKey(setting);
    busy.current = true; onBusy(true); setSavingKey(key); setError(""); setSavedKey(null);
    try {
      const updated = await updateAdminUserSetting(userId, setting, reset ? null : values[key]);
      setSettings(current => current.map(item => rowKey(item) === key ? updated : item));
      setValues(current => ({ ...current, [key]: updated.value }));
      setSavedKey(key);
    } catch (failure) {
      setError(failure.response?.data?.message === "invalidSettingValue"
        ? `${setting.settingKey}: Enter a valid value for this setting.` : `${setting.settingKey}: Changes could not be saved. Please try again.`);
    } finally { busy.current = false; onBusy(false); setSavingKey(null); }
  };

  return <section className="admin-user-settings mt-4 pt-3 border-top" aria-labelledby="user-settings-title">
    <h3 id="user-settings-title" className="h5">Local entity settings</h3>
    <p className="small text-muted">Values are stored directly on the listed user, condominium, home, or fund. Use 0 for unlimited; 1 is a limit of one.</p>
    <p className="small text-muted">Each value is saved separately. Use the field above to edit the user's condominium limit.</p>
    {error && <Alert variant="danger">{error}{!settings && <Button variant="outline-danger" className="ms-2" onClick={() => setRevision(value => value + 1)}>Retry</Button>}</Alert>}
    {!settings && !error && <p role="status"><Spinner size="sm" /> Loading settings...</p>}
    {settings?.map(setting => {
      const key = rowKey(setting);
      const id = `user-setting-${key}`;
      const numeric = ["INTEGER", "DOUBLE"].includes(setting.type);
      return <div key={key} className="user-setting-row rounded border p-3 mb-3">
        <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
          <div><Form.Label htmlFor={id} className="fw-semibold text-break mb-0">{setting.settingKey}</Form.Label>
            <div className="small text-muted">{setting.targetType}: {setting.targetName}</div></div>
          <Badge bg={setting.overridden ? "success" : "secondary"}>{setting.overridden ? "Custom" : "Default"}</Badge>
        </div>
        {setting.description && <p id={`${id}-description`} className="small text-muted mb-2">{setting.description}</p>}
        {setting.type === "BOOLEAN" ? <Form.Select id={id} value={values[key]} disabled={disabled || !!savingKey} onChange={e => setValues(current => ({ ...current, [key]: e.target.value }))}><option value="true">True</option><option value="false">False</option></Form.Select>
          : <Form.Control id={id} type={numeric ? "number" : setting.type === "DATE" ? "date" : setting.type === "COLOR" ? "color" : "text"}
            min={numeric ? 0 : undefined} step={setting.type === "INTEGER" ? 1 : "any"}
            value={values[key] ?? ""} disabled={disabled || !!savingKey} maxLength={255}
            aria-describedby={setting.description ? `${id}-description` : undefined}
            onChange={e => setValues(current => ({ ...current, [key]: e.target.value }))} />}
        <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
          <span className="small text-muted me-auto">Default: {setting.defaultValue}</span>
          <Button variant="outline-secondary" size="sm" disabled={disabled || !!savingKey || !setting.overridden} onClick={() => save(setting, true)}>Reset to default</Button>
          <Button variant="success" size="sm" disabled={disabled || !!savingKey || !valid(setting) || values[key] === setting.value} onClick={() => save(setting)}>{savingKey === key && <Spinner size="sm" className="me-1" />}Save setting</Button>
        </div>
        {savedKey === key && <p className="small text-success mt-2 mb-0" role="status">Setting saved.</p>}
      </div>;
    })}
  </section>;
}

const rowKey = setting => `${setting.targetType}:${setting.targetId}:${setting.settingKey}`;
