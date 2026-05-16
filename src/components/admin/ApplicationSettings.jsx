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

            case "BOOLEAN":
                return (
                    <Form.Check
                        type="switch"
                        checked={setting.value === "true"}
                        onChange={(e) =>
                            handleChange(setting.id, e.target.checked.toString())
                        }
                    />
                );

            case "NUMBER":
                return (
                    <Form.Control
                        type="number"
                        value={setting.value ?? ""}
                        onChange={(e) =>
                            handleChange(setting.id, e.target.value)
                        }
                    />
                );

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
                                        <td className="fw-bold">
                                            {setting.settingKey}
                                        </td>
                                        <td>
                                            {renderInput(setting)}
                                        </td>
                                        <td>
                                            <Badge bg="primary">
                                                {setting.type}
                                            </Badge>
                                        </td>
                                        <td>
                                            {setting.description || "-"}
                                        </td>
                                        <td className="small text-muted">
                                            {setting.updatedAt
                                                ? new Date(setting.updatedAt).toLocaleString()
                                                : "-"}
                                        </td>
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
                                    <div className="mb-2">
                                        <Badge bg="secondary">
                                            {setting.type}
                                        </Badge>
                                    </div>

                                    <div className="fw-bold mb-2">
                                        {setting.settingKey}
                                    </div>

                                    <div className="mb-2">
                                        {renderInput(setting)}
                                    </div>

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