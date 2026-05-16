import React from "react";
import { Card, Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Admin = () => {
    const navigate = useNavigate();

    return (
        <Container>
            <Row className="justify-content-center">

                <Col xs={12} md={6} lg={4}>
                    <Card className="shadow-sm text-center p-3">
                        <Card.Body>
                            <Card.Title>Application Settings</Card.Title>
                            <Card.Text>Manage application settings values</Card.Text>

                            <Button
                                className="w-100"
                                onClick={() => navigate("application-settings")}
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