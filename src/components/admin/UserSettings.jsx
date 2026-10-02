import React, { useEffect, useMemo, useRef, useState } from "react";
import { Accordion, Alert, Badge, Button, Form, Spinner } from "react-bootstrap";
import { Building2, RotateCcw, Save, SlidersHorizontal, UserRound, WalletCards } from "lucide-react";
import { getAdminUserSettings, updateAdminUserSetting } from "../../api/services/adminUserService";

const settingLabels = {
  cashier_limit: "Cashiers",
  cashier_condominium_limit: "Condominiums per cashier",
  fee_limit: "Fees",
  fee_home_limit: "Fees per home",
  bill_limit: "Bills",
  fund_limit: "Funds",
  fund_fee_limit: "Fees in fund",
  repair_limit: "Repairs"
};

const targetMeta = {
  USER: { label: "User", icon: UserRound, variant: "primary" },
  CONDOMINIUM: { label: "Condominium", icon: Building2, variant: "success" },
  FUND: { label: "Fund", icon: WalletCards, variant: "warning" }
};

export default function UserSettings({ userId, disabled, onBusy = () => {} }) {
  const [settings, setSettings] = useState(null);
  const [values, setValues] = useState({});
  const [error, setError] = useState("");
  const [savingKey, setSavingKey] = useState(null);
  const [savedKey, setSavedKey] = useState(null);
  const [revision, setRevision] = useState(0);
  const busy = useRef(false);

  useEffect(() => {
    let active = true;
    setSettings(null); setError(""); setSavedKey(null);
    getAdminUserSettings(userId).then(data => {
      if (!active) return;
      const visible = data.filter(setting => setting.settingKey !== "condominium_limit");
      setSettings(visible);
      setValues(Object.fromEntries(visible.map(setting => [rowKey(setting), setting.value])));
    }).catch(() => { if (active) setError("Settings could not be loaded. Please try again."); });
    return () => { active = false; };
  }, [userId, revision]);

  const groups = useMemo(() => {
    if (!settings) return [];
    const grouped = new Map();
    settings.forEach(setting => {
      const key = `${setting.targetType}:${setting.targetId}`;
      if (!grouped.has(key)) grouped.set(key, {
        key, targetType: setting.targetType, targetName: setting.targetName, settings: []
      });
      grouped.get(key).settings.push(setting);
    });
    return [...grouped.values()];
  }, [settings]);

  const valid = setting => {
    const value = values[rowKey(setting)];
    if (!value || !value.trim()) return false;
    if (setting.type === "INTEGER") return /^\d+$/.test(value)
      && Number(value) >= 0 && Number(value) <= 2147483647;
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
        ? `${settingLabels[setting.settingKey] || setting.settingKey}: Enter a valid value.`
        : `${settingLabels[setting.settingKey] || setting.settingKey}: Changes could not be saved. Please try again.`);
    } finally { busy.current = false; onBusy(false); setSavingKey(null); }
  };

  return <section className="admin-user-settings mt-4" aria-labelledby="user-settings-title">
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
      <div>
        <h3 id="user-settings-title" className="h5 mb-1"><SlidersHorizontal size={19} aria-hidden="true" /> Entity limits</h3>
        <p className="small text-muted mb-0">Settings are grouped by the user, condominium, or fund they affect.</p>
      </div>
      {settings && <Badge bg="light" text="dark" className="border">{settings.length} settings</Badge>}
    </div>
    <Alert variant="info" className="small py-2">
      Use <strong>0</strong> for unlimited. Each setting is saved immediately and independently from the account settings above.
    </Alert>
    {error && <Alert variant="danger">{error}{!settings && <Button variant="outline-danger" size="sm" className="ms-2" onClick={() => setRevision(value => value + 1)}>Try again</Button>}</Alert>}
    {!settings && !error && <div role="status" className="text-center py-4"><Spinner size="sm" className="me-2" />Loading settings...</div>}
    {settings?.length === 0 && <Alert variant="light" className="border mb-0">No entity settings apply to this user.</Alert>}
    {groups.length > 0 && <Accordion defaultActiveKey={groups.map(group => group.key)} alwaysOpen className="user-settings-groups">
      {groups.map(group => {
        const meta = targetMeta[group.targetType] || { label: group.targetType, icon: SlidersHorizontal, variant: "secondary" };
        const Icon = meta.icon;
        return <Accordion.Item eventKey={group.key} key={group.key}>
          <Accordion.Header>
            <span className={`user-setting-target-icon text-${meta.variant}`}><Icon size={19} aria-hidden="true" /></span>
            <span className="text-start flex-grow-1">
              <span className="d-block fw-semibold">{group.targetName}</span>
              <span className="small text-muted">{meta.label} · {group.settings.length} {group.settings.length === 1 ? "setting" : "settings"}</span>
            </span>
          </Accordion.Header>
          <Accordion.Body>
            {group.settings.map(setting => {
              const key = rowKey(setting);
              const id = `user-setting-${key}`;
              const numeric = ["INTEGER", "DOUBLE"].includes(setting.type);
              const dirty = values[key] !== setting.value;
              return <div key={key} className="user-setting-row">
                <div className="user-setting-copy">
                  <Form.Label htmlFor={id} className="fw-semibold mb-1">{settingLabels[setting.settingKey] || setting.settingKey}</Form.Label>
                  {setting.description && <p id={`${id}-description`} className="small text-muted mb-1">{setting.description}</p>}
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    <code className="small">{setting.settingKey}</code>
                    <Badge bg={setting.overridden ? "success" : "secondary"}>{setting.overridden ? "Custom" : "Default"}</Badge>
                    {dirty && <Badge bg="warning" text="dark">Unsaved</Badge>}
                  </div>
                </div>
                <div className="user-setting-control">
                  {setting.type === "BOOLEAN" ? <Form.Select id={id} value={values[key]} disabled={disabled || !!savingKey} onChange={e => setValues(current => ({ ...current, [key]: e.target.value }))}><option value="true">Enabled</option><option value="false">Disabled</option></Form.Select>
                    : <Form.Control id={id} type={numeric ? "number" : setting.type === "DATE" ? "date" : setting.type === "COLOR" ? "color" : "text"}
                      min={numeric ? 0 : undefined} step={setting.type === "INTEGER" ? 1 : "any"}
                      value={values[key] ?? ""} disabled={disabled || !!savingKey} maxLength={255}
                      isInvalid={dirty && !valid(setting)} aria-describedby={setting.description ? `${id}-description` : undefined}
                      onChange={e => { setValues(current => ({ ...current, [key]: e.target.value })); setSavedKey(null); }} />}
                  <div className="small text-muted mt-1">Default: <strong>{setting.defaultValue}</strong></div>
                </div>
                <div className="user-setting-actions">
                  <Button variant="outline-secondary" size="sm" title="Reset to default" aria-label={`Reset ${setting.settingKey} to default`}
                    disabled={disabled || !!savingKey || !setting.overridden} onClick={() => save(setting, true)}><RotateCcw size={16} aria-hidden="true" /> Reset</Button>
                  <Button variant="success" size="sm" aria-label={`Save ${setting.settingKey}`}
                    disabled={disabled || !!savingKey || !valid(setting) || !dirty} onClick={() => save(setting)}>
                    {savingKey === key ? <Spinner size="sm" aria-label="Saving" /> : <Save size={16} aria-hidden="true" />} Save
                  </Button>
                  {savedKey === key && <span className="small text-success fw-semibold" role="status">Saved</span>}
                </div>
              </div>;
            })}
          </Accordion.Body>
        </Accordion.Item>;
      })}
    </Accordion>}
  </section>;
}

const rowKey = setting => `${setting.targetType}:${setting.targetId}:${setting.settingKey}`;
