import userLabels from "./userLabels";
import React, { useEffect } from "react";
import { Card, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useBreadcrumb } from "../breadcrumb/BreadcrumpContext";

const Admin = () => {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbs([
      {
        label: "Admin"
      }
    ]);
  }, [setBreadcrumbs]);


  return (
    <div>
      <Row className="justify-content-center g-3">
        <Col xs={12} md={6} lg={4}>
          <Card className="shadow-sm text-center h-100 p-3">
            <Card.Body className="d-flex flex-column">
              <Card.Title>{userLabels.title}</Card.Title>
              <Card.Text className="flex-grow-1">{userLabels.description}</Card.Text>
              <Button variant="success" className="w-100" onClick={() => navigate("users")}>
                {userLabels.open}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* SETTINGS */}
        <Col xs={12} md={6} lg={4}>
          <Card className="shadow-sm text-center h-100 p-3">
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
          <Card className="shadow-sm text-center h-100 p-3">
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
    </div>
  );
};

export default Admin;
