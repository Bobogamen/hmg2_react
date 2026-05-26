import React, { useEffect, useState } from "react";
import {
    Card,
    Form,
    Button,
    Spinner,
    Alert,
    Badge,
    Container
} from "react-bootstrap";

import {
    getSettings,
    updateSetting
} from "../../api/services/appSettingService";

import { toast } from "react-toastify";

const ApplicationSettings = () => {

    const [settings, setSettings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingId, setLoadingId] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        loadSettings();
    }, []);

    // =========================
    // LOAD SETTINGS
    // =========================
    const loadSettings = async () => {
        try {
            setIsLoading(true);

            const data = await getSettings(); // ✅ already array now

            console.log(data)

            setSettings(Array.isArray(data) ? data : []);

        } catch (error) {
            console.log(error);
            setError("Failed to load settings.");
            setSettings([]);
        } finally {
            setIsLoading(false);
        }
    };

    // =========================
    // HANDLE VALUE CHANGE
    // =========================
    const handleChange = (id, value) => {
        setSettings((prev) =>
            (prev ?? []).map((s) =>
                s.id === id ? { ...s, value } : s
            )
        );
    };

    // =========================
    // SAVE SETTING
    // =========================
    const handleSave = async (setting) => {

        try {
            setLoadingId(setting.id);

            await updateSetting({
                id: setting.id,
                settingKey: setting.settingKey,
                value: setting.value
            });

            toast.success(`${setting.settingKey} updated`);

            // always reload fresh values from backend
            await loadSettings();

        } catch (error) {

            const errors = error?.response?.data?.errors;

            if (errors?.value?.length) {
                toast.error(
                    `${setting.settingKey}: ${errors.value[0]}`
                );
            } else {
                toast.error(`Failed to update ${setting.settingKey}`);
            }

            console.log(error);

            loadSettings();

        } finally {
            setLoadingId(null);
        }
    };

    // =========================
    // INPUT RENDERER
    // =========================
    const renderInput = (setting) => {

        switch (setting.type) {

            // =====================
            // BOOLEAN
            // =====================
            case "BOOLEAN":
                return (
                    <Form.Check
                        type="switch"
                        checked={String(setting.value) === "true"}
                        onChange={(e) =>
                            handleChange(setting.id, e.target.checked.toString())
                        }
                    />
                );

            // =====================
            // INTEGER
            // =====================
            case "INTEGER":
                return (
                    <Form.Control
                        type="number"
                        step="1"
                        value={setting.value ?? ""}
                        onChange={(e) =>
                            handleChange(setting.id, e.target.value)
                        }
                    />
                );

            // =====================
            // DOUBLE
            // =====================
            case "DOUBLE":
                return (
                    <Form.Control
                        type="number"
                        step="0.01"
                        value={setting.value ?? ""}
                        onChange={(e) =>
                            handleChange(setting.id, e.target.value)
                        }
                    />
                );

            // =====================
            // COLOR
            // =====================
            case "COLOR":
                return (
                    <div className="d-flex align-items-center gap-2">
                        <Form.Control
                            type="color"
                            value={setting.value ?? "#000000"}
                            onChange={(e) =>
                                handleChange(setting.id, e.target.value)
                            }
                            style={{
                                width: "60px",
                                height: "40px"
                            }}
                        />
                        <span className="small fw-bold">
                            {setting.value}
                        </span>
                    </div>
                );

            // =====================
            // DATE (expects YYYY-MM-DD)
            // =====================
            case "DATE":
                return (
                    <Form.Control
                        type="date"
                        value={setting.value ?? ""}
                        onChange={(e) =>
                            handleChange(setting.id, e.target.value)
                        }
                    />
                );

            // =====================
            // STRING (default)
            // =====================
            case "STRING":
            default:
                return (
                    <Form.Control
                        type="text"
                        value={setting.value ?? ""}
                        onChange={(e) =>
                            handleChange(setting.id, e.target.value)
                        }
                    />
                );
        }
    };

    // =========================
    // LOADING STATE
    // =========================
    if (isLoading) {
        return (
            <Container className="py-4 text-center">
                <Spinner animation="border" />
            </Container>
        );
    }

    // =========================
    // UI
    // =========================
    return (
        <div className="p-1">

            <div className="shadow border-0">

                {/* HEADER */}
                <Card.Header className="bg-primary text-white fw-bold text-center">
                    Application Settings
                </Card.Header>

                <div>

                    {/* ERROR */}
                    {error && (
                        <Alert variant="danger">
                            {error}
                        </Alert>
                    )}

                    {/* TABLE */}
                    <div className="table-responsive d-none d-md-block">
                        <table className="table table-hover align-middle text-center">
                            <thead className="table-dark">
                                <tr>
                                    <th>Id</th>
                                    <th>Created</th>
                                    <th>Key</th>
                                    <th>Value</th>
                                    <th>Type</th>
                                    <th>Description</th>
                                    <th>Updated</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(settings ?? []).map((setting) => (
                                    <tr key={setting.id}>

                                        {/* Id */}
                                        <td className="fw-bold">
                                            {setting.id}
                                        </td>

                                        {/* Created */}
                                        <td className="small text-muted">
                                            {setting.createdAt
                                                ? new Date(setting.createdAt).toLocaleString()
                                                : "-"}
                                        </td>

                                        {/* Key */}
                                        <td className="fw-bold">
                                            {setting.settingKey}
                                        </td>

                                        {/* Value */}
                                        <td>
                                            {renderInput(setting)}
                                        </td>

                                        {/* Type */}
                                        <td>
                                            <Badge bg="primary">
                                                {setting.type}
                                            </Badge>
                                        </td>

                                        {/* Description */}
                                        <td>
                                            {setting.description || "-"}
                                        </td>

                                        {/* Updated */}
                                        <td className="small text-muted">
                                            {setting.updatedAt
                                                ? new Date(setting.updatedAt).toLocaleString()
                                                : "-"}
                                        </td>

                                        {/* Action */}
                                        <td>
                                            <Button
                                                size="sm"
                                                onClick={() => handleSave(setting)}
                                                disabled={loadingId === setting.id}
                                            >
                                                {loadingId === setting.id ? (
                                                    <Spinner size="sm" />
                                                ) : (
                                                    "Save"
                                                )}
                                            </Button>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* MOBILE CARDS (< 768px) */}
                    <div className="d-md-none">
                        {(settings ?? []).map((setting) => (
                            <Card key={setting.id} className="mb-2">
                                <Card.Body>

                                    {/* ID + timestamps */}
                                    <div className="small text-muted mb-2">
                                        <div>
                                            <span className="fw-bold">ID:</span> {setting.id}</div>
                                        <div>
                                            <span className="fw-bold">Created:{" "}</span>
                                            {setting.createdAt
                                                ? new Date(setting.createdAt).toLocaleString()
                                                : "-"}
                                        </div>
                                        <div>
                                            <span className="fw-bold">Updated:{" "}</span>
                                            {setting.updatedAt
                                                ? new Date(setting.updatedAt).toLocaleString()
                                                : "-"}
                                        </div>
                                    </div>

                                    {/* Type */}
                                    <div className="mb-2">
                                        <Badge bg="secondary">
                                            {setting.type}
                                        </Badge>
                                    </div>

                                    {/* Key */}
                                    <div className="fw-bold mb-2">
                                        {setting.settingKey}
                                    </div>

                                    {/* Input */}
                                    <div className="mb-2">
                                        {renderInput(setting)}
                                    </div>

                                    {/* Save button */}
                                    <Button
                                        size="sm"
                                        className="w-100"
                                        onClick={() => handleSave(setting)}
                                        disabled={loadingId === setting.id}
                                    >
                                        {loadingId === setting.id ? (
                                            <Spinner size="sm" />
                                        ) : (
                                            "Save"
                                        )}
                                    </Button>

                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ApplicationSettings;