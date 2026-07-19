import React, { useEffect, useMemo, useState } from "react";
import { Card, Container, Spinner, Table, Badge, Row, Col, Form, Dropdown } from "react-bootstrap";
import { getLogs } from "../../api/services/logService";
import { useBreadcrumb } from "../breadcrumb/BreadcrumpContext";
import { useTranslation } from "react-i18next";
import { formatTimestamp } from "../../utils/formatDate";
import "./Logs.css"

const Logs = () => {
      const [logs, setLogs] = useState([]);
      const [loading, setLoading] = useState(true);

      const [emailFilter, setEmailFilter] = useState("");
      const [actionFilter, setActionFilter] = useState("");
      const [levelFilter, setLevelFilter] = useState("ALL");

      const { setBreadcrumbs } = useBreadcrumb();
      const { t } = useTranslation();

      useEffect(() => {
            const loadLogs = async () => {
                  try {
                        const data = await getLogs();
                        setLogs(data || []);
                  } catch (error) {
                        console.error("Failed to load logs:", error);
                  } finally {
                        setLoading(false);
                  }
            };

            loadLogs();
      }, []);

      useEffect(() => {
            setBreadcrumbs([
                  {
                        label: t("dashboard:admin"),
                        path: "/admin"
                  },
                  {
                        label: "Logs",
                        color: "#6c757d "
                  }
            ]);
      }, [setBreadcrumbs, t]);

      const filteredLogs = useMemo(() => {
            return logs.filter((log) => {
                  const emailMatch =
                        !emailFilter ||
                        log.userEmail?.toLowerCase().includes(emailFilter.toLowerCase());

                  const actionMatch =
                        !actionFilter ||
                        log.action?.toLowerCase().includes(actionFilter.toLowerCase());

                  const levelMatch =
                        levelFilter === "ALL" || log.level === levelFilter;

                  return emailMatch && actionMatch && levelMatch;
            });
      }, [logs, emailFilter, actionFilter, levelFilter]);

      const getLevelBadge = (level) => {
            switch (level) {
                  case "ERROR":
                        return <Badge bg="danger" className="smaller-text">{level}</Badge>;
                  case "WARN":
                        return <Badge bg="warning" className="smaller-text">{level}</Badge>;
                  case "INFO":
                        return <Badge bg="info" className="smaller-text">{level}</Badge>;
                  default:
                        return <Badge bg="secondary" className="smaller-text">{level}</Badge>;
            }
      };

      return (
            <Container className="mt-3">

                  {/* FILTER CARD */}
                  <Card className="shadow-sm mb-3 border-0">

                        <Card.Header className="fw-bold fs-5 bg-secondary text-white d-flex justify-content-between align-items-center">
                              <span>📋 Application Logs</span>

                              <span className="badge bg-light text-dark">
                                    {filteredLogs.length} Results
                              </span>
                        </Card.Header>

                        <Card.Body className="bg-light">

                              <Row className="g-3 align-items-center p-2">

                                    {/* EMAIL */}
                                    <Col lg={4} md={6}>
                                          <Form.Group>
                                                <Form.Label className="small text-muted fw-semibold">
                                                      👤 User Email
                                                </Form.Label>

                                                <Form.Control
                                                      className="border-secondary"
                                                      placeholder="Search by email..."
                                                      value={emailFilter}
                                                      onChange={(e) => setEmailFilter(e.target.value)}
                                                />
                                          </Form.Group>
                                    </Col>

                                    {/* ACTION */}
                                    <Col lg={4} md={6}>
                                          <Form.Group>
                                                <Form.Label className="small text-muted fw-semibold">
                                                      📌 Action
                                                </Form.Label>

                                                <Form.Control
                                                      className="border-secondary"
                                                      placeholder="Search by action..."
                                                      value={actionFilter}
                                                      onChange={(e) => setActionFilter(e.target.value)}
                                                />
                                          </Form.Group>
                                    </Col>

                                    {/* LEVEL */}
                                    <Col lg={4} md={12}>
                                          <Form.Group>
                                                <Form.Label className="small fw-semibold">
                                                      ⚡ Log Level
                                                </Form.Label>

                                                <Dropdown>
                                                      <Dropdown.Toggle
                                                            className="w-100 text-start d-flex justify-content-between align-items-center"
                                                            variant={
                                                                  levelFilter === "ERROR"
                                                                        ? "danger"
                                                                        : levelFilter === "WARN"
                                                                              ? "warning"
                                                                              : levelFilter === "INFO"
                                                                                    ? "info"
                                                                                    : "secondary"
                                                            }
                                                      >
                                                            {levelFilter === "ALL" && "All Levels"}
                                                            {levelFilter === "INFO" && "INFO"}
                                                            {levelFilter === "WARN" && "WARN"}
                                                            {levelFilter === "ERROR" && "ERROR"}
                                                      </Dropdown.Toggle>

                                                      <Dropdown.Menu className="w-100">

                                                            <Dropdown.Item
                                                                  active={levelFilter === "ALL"}
                                                                  className="text-bg-secondary fw-semibold"
                                                                  onClick={() => setLevelFilter("ALL")}
                                                            >
                                                                  All Levels
                                                            </Dropdown.Item>

                                                            <Dropdown.Item
                                                                  active={levelFilter === "INFO"}
                                                                  className="text-bg-info fw-semibold"
                                                                  onClick={() => setLevelFilter("INFO")}
                                                            >
                                                                  INFO
                                                            </Dropdown.Item>

                                                            <Dropdown.Item
                                                                  active={levelFilter === "WARN"}
                                                                  className="text-bg-warning fw-semibold"
                                                                  onClick={() => setLevelFilter("WARN")}
                                                            >
                                                                  WARN
                                                            </Dropdown.Item>

                                                            <Dropdown.Item
                                                                  active={levelFilter === "ERROR"}
                                                                  className="text-bg-danger fw-semibold"
                                                                  onClick={() => setLevelFilter("ERROR")}
                                                            >
                                                                  ERROR
                                                            </Dropdown.Item>

                                                      </Dropdown.Menu>
                                                </Dropdown>

                                          </Form.Group>
                                    </Col>

                              </Row>
                        </Card.Body>
                  </Card>

                  {/* TABLE */}
                  <div>
                        <div className="p-0">

                              {loading ? (
                                    <div className="text-center py-4">
                                          <Spinner animation="border" />
                                    </div>
                              ) : filteredLogs.length === 0 ? (
                                    <p className="text-center my-4">
                                          No logs found
                                    </p>
                              ) : (
                                    <Table
                                          striped
                                          hover
                                          responsive
                                          className="align-middle mb-0 logs-table"
                                    >

                                          <colgroup>
                                                <col className="action-column" />
                                                <col className="time-column" />
                                                <col className="user-column" />
                                                <col className="level-column" />
                                          </colgroup>

                                          <thead className="table-light">

                                                <tr>

                                                      <th className="text-uppercase small text-muted">
                                                            📌 Action
                                                      </th>

                                                      <th className="text-uppercase small text-muted">
                                                            🕒 Time
                                                      </th>

                                                      <th className="text-uppercase small text-muted">
                                                            👤 User
                                                      </th>

                                                      <th className="text-uppercase small text-muted">
                                                            ⚡ Level
                                                      </th>

                                                </tr>

                                          </thead>

                                          <tbody>

                                                {filteredLogs.map((log) => {

                                                      const timestamp = formatTimestamp(log.timestamp);

                                                      return (

                                                            <tr
                                                                  key={log.id}
                                                                  className={
                                                                        log.level === "ERROR"
                                                                              ? "table-danger"
                                                                              : log.level === "WARN"
                                                                                    ? "table-warning"
                                                                                    : ""
                                                                  }
                                                            >

                                                                  <td className="fw-semibold">
                                                                        {log.action}
                                                                  </td>

                                                                  <td className="text-muted small">

                                                                        <div className="fw-semibold">
                                                                              {timestamp.date}
                                                                        </div>

                                                                        <div>
                                                                              {timestamp.time}
                                                                        </div>

                                                                  </td>

                                                                  <td>
                                                                        <span className="fw-bold small">
                                                                              {log.userEmail || "-"}
                                                                        </span>
                                                                  </td>

                                                                  <td className="text-center">
                                                                        {getLevelBadge(log.level)}
                                                                  </td>

                                                            </tr>

                                                      );

                                                })}

                                          </tbody>

                                    </Table>
                              )}

                        </div>
                  </div>

            </Container>
      );
};

export default Logs;