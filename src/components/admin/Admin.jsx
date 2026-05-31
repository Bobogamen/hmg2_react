import React from "react";
import { Card, Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Row className="justify-content-center g-3">

        {/* SETTINGS */}
        <Col xs={12} md={6} lg={4}>
          <Card className="shadow-sm text-center h-100">
            <Card.Body className="d-flex flex-column">
              <Card.Title>Application Settings</Card.Title>

              <Card.Text className="flex-grow-1">
                Manage application settings values
              </Card.Text>

              <Button
                className="w-100"
                onClick={() => navigate("application-settings")}
              >
                Open
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* LOGS */}
        <Col xs={12} md={6} lg={4}>
          <Card className="shadow-sm text-center h-100">
            <Card.Body className="d-flex flex-column">
              <Card.Title>Logs</Card.Title>

              <Card.Text className="flex-grow-1">
                View application logs
              </Card.Text>

              <Button
                className="w-100 btn-secondary"
                onClick={() => navigate("application-logs")}
              >
                Open
              </Button>
            </Card.Body>
          </Card>
        </Col>

      </Row>
    </Container>
  );
};

export default Admin;