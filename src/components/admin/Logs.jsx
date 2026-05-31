import React, { useEffect, useMemo, useState } from "react";
import { Card, Container, Spinner, Table, Badge, Row, Col, Form, Dropdown } from "react-bootstrap";
import { getLogs } from "../../api/services/logService";

const Logs = () => {
      const [logs, setLogs] = useState([]);
      const [loading, setLoading] = useState(true);

      const [emailFilter, setEmailFilter] = useState("");
      const [actionFilter, setActionFilter] = useState("");
      const [levelFilter, setLevelFilter] = useState("ALL");

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
                        return <Badge bg="danger">{level}</Badge>;
                  case "WARN":
                        return <Badge bg="warning">{level}</Badge>;
                  case "INFO":
                        return <Badge bg="info">{level}</Badge>;
                  default:
                        return <Badge bg="secondary">{level}</Badge>;
            }
      };

      const formatDate = (timestamp) =>
            timestamp ? new Date(timestamp).toLocaleString() : "-";

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

                              <Row className="g-3 align-items-center">

                                    {/* EMAIL */}
                                    <Col lg={4} md={6}>
                                          <Form.Group>
                                                <Form.Label className="small text-muted fw-semibold">
                                                      👤 User Email
                                                </Form.Label>

                                                <Form.Control
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
                                          className="align-middle mb-0"
                                    >

                                          <thead className="table-light">
                                                <tr>
                                                      <th className="text-uppercase small text-muted" style={{ width: "180px" }}>
                                                            🕒 Time
                                                      </th>

                                                      <th className="text-uppercase small text-muted" style={{ width: "120px" }}>
                                                            ⚡ Level
                                                      </th>

                                                      <th className="text-uppercase small text-muted">
                                                            📌 Action
                                                      </th>

                                                      <th className="text-uppercase small text-muted" style={{ width: "250px" }}>
                                                            👤 User
                                                      </th>
                                                </tr>
                                          </thead>

                                          <tbody>
                                                {filteredLogs.map((log) => (
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
                                                            <td className="text-muted small">
                                                                  {formatDate(log.timestamp)}
                                                            </td>

                                                            <td>{getLevelBadge(log.level)}</td>

                                                            <td className="fw-semibold">
                                                                  {log.action}
                                                            </td>

                                                            <td>
                                                                  <span className="badge bg-dark">
                                                                        {log.userEmail || "-"}
                                                                  </span>
                                                            </td>
                                                      </tr>
                                                ))}
                                          </tbody>

                                    </Table>
                              )}

                        </div>
                  </div>

            </Container>
      );
};

export default Logs;