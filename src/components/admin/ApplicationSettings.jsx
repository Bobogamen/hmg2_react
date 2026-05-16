import React, { useEffect, useState } from "react";
import { Table, Button, Form, Spinner, Card, Row, Col } from "react-bootstrap";
import { getSettings, updateSetting } from "../../api/services/appSettingService";

const ApplicationSettings = () => {

    const [settings, setSettings] = useState([]);
    const [loadingId, setLoadingId] = useState(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const { data } = await getSettings();
            setSettings(data);
        } catch (error) {
            console.log(error);
        }
    };

    const handleChange = (id, field, value) => {
        setSettings((prev) =>
            prev.map((setting) =>
                setting.id === id
                    ? { ...setting, [field]: value }
                    : setting
            )
        );
    };

    const handleSave = async (setting) => {
        try {
            setLoadingId(setting.id);

            await updateSetting(setting.id, {
                value: setting.value
            });

        } catch (error) {
            console.log(error);
        } finally {
            setLoadingId(null);
        }
    };

    const renderInput = (setting) => {

        switch (setting.type) {

            case "BOOLEAN":
                return (
                    <Form.Check
                        type="switch"
                        checked={setting.value === "true"}
                        onChange={(e) =>
                            handleChange(
                                setting.id,
                                "value",
                                e.target.checked.toString()
                            )
                        }
                    />
                );

            case "NUMBER":
                return (
                    <Form.Control
                        type="number"
                        value={setting.value}
                        onChange={(e) =>
                            handleChange(setting.id, "value", e.target.value)
                        }
                    />
                );

            case "COLOR":
                return (
                    <div className="d-flex align-items-center gap-2">

                        <Form.Control
                            type="color"
                            value={setting.value}
                            onChange={(e) =>
                                handleChange(setting.id, "value", e.target.value)
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
                        value={setting.value}
                        onChange={(e) =>
                            handleChange(setting.id, "value", e.target.value)
                        }
                    />
                );

            default:
                return (
                    <Form.Control
                        type="text"
                        value={setting.value}
                        onChange={(e) =>
                            handleChange(setting.id, "value", e.target.value)
                        }
                    />
                );
        }
    };

    return (
        <div className="container-fluid mt-3">

            <h3 className="fw-bold mb-4">
                Application Settings
            </h3>

            {/* DESKTOP TABLE */}
            <div className="d-none d-lg-block">

                <Table bordered hover responsive>

                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Setting Key</th>
                            <th>Value</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Created</th>
                            <th>Updated</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody className="align-middle">

                        {settings.map((setting) => (

                            <tr key={setting.id}>

                                <td>{setting.id}</td>

                                <td className="fw-bold">
                                    {setting.settingKey}
                                </td>

                                <td style={{ minWidth: "220px" }}>
                                    {renderInput(setting)}
                                </td>

                                <td>
                                    <span className="badge bg-primary">
                                        {setting.type}
                                    </span>
                                </td>

                                <td style={{ maxWidth: "250px" }}>
                                    {setting.description}
                                </td>

                                <td>
                                    {setting.createdAt
                                        ? new Date(setting.createdAt).toLocaleString()
                                        : "-"}
                                </td>

                                <td>
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

                </Table>

            </div>

            {/* MOBILE / TABLET CARDS */}
            <div className="d-lg-none">

                <Row className="g-3">

                    {settings.map((setting) => (

                        <Col xs={12} md={6} key={setting.id}>

                            <Card className="shadow-sm h-100">

                                <Card.Body>

                                    <div className="mb-2">
                                        <small className="text-muted">
                                            ID
                                        </small>

                                        <div className="fw-bold">
                                            {setting.id}
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <small className="text-muted">
                                            Setting Key
                                        </small>

                                        <div className="fw-bold">
                                            {setting.settingKey}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <small className="text-muted">
                                            Value
                                        </small>

                                        <div>
                                            {renderInput(setting)}
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <small className="text-muted">
                                            Type
                                        </small>

                                        <div>
                                            <span className="badge bg-primary">
                                                {setting.type}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <small className="text-muted">
                                            Description
                                        </small>

                                        <div>
                                            {setting.description}
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <small className="text-muted">
                                            Created
                                        </small>

                                        <div>
                                            {setting.createdAt
                                                ? new Date(setting.createdAt).toLocaleString()
                                                : "-"}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <small className="text-muted">
                                            Updated
                                        </small>

                                        <div>
                                            {setting.updatedAt
                                                ? new Date(setting.updatedAt).toLocaleString()
                                                : "-"}
                                        </div>
                                    </div>

                                    <Button
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

                        </Col>

                    ))}

                </Row>

            </div>

        </div>
    );
};

export default ApplicationSettings;