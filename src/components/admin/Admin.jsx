import React, { useState } from "react";
import { Button, Card, Container } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import ApplicationSettings from "./ApplicationSettings";

const Admin = () => {
      const { t } = useTranslation();
      const [showSettings, setShowSettings] = useState(false);

      return (
            <Container
                  fluid
                  className="justify-content-center align-items-center py-4">
                  <div>

                        {/* HEADER */}
                        <div className="text-center">
                              <h3 className="title my-3 text-bg-primary bg-opacity-75">{t("dashboard:admin")}</h3>

                              {showSettings && (
                                    <Button
                                          variant="secondary "
                                          size="sm"
                                          onClick={() => setShowSettings(false)}
                                          className="my-2"
                                    >
                                          ← Back
                                    </Button>
                              )}
                        </div>

                        {/* DASHBOARD VIEW */}
                        {!showSettings && (
                              <div className="d-flex justify-content-center">
                                    <Card className="shadow-sm text-center p-4">
                                          <Card.Body>

                                                <Card.Title>
                                                      Application Settings
                                                </Card.Title>

                                                <Card.Text className="text-muted">
                                                      Manage system configuration values
                                                </Card.Text>

                                                <Button
                                                      className="mt-3 w-100"
                                                      onClick={() => setShowSettings(true)}
                                                >
                                                      Open Settings
                                                </Button>

                                          </Card.Body>
                                    </Card>
                              </div>
                        )}

                        {/* SETTINGS VIEW */}
                        {showSettings && (
                              <div>
                                    <ApplicationSettings />
                              </div>
                        )}

                  </div>
            </Container>
      );
};

export default Admin;