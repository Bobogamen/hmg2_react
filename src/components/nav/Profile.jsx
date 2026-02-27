import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../user/UserContext";
import { useTranslation } from "react-i18next";
import profile_edit from "../../assets/images/app/profile_edit.png"

const Profile = () => {
      const { user } = useUser();
      const { t } = useTranslation();
      const navigate = useNavigate();
      
      return (
            <div className="container mt-4">
                  <div className="row justify-content-center">

                        {/* PROFILE CARD */}
                        <div className="col-md-8 col-lg-6">
                              <div className="card my-4 shadow border-0 rounded-4">
                                    <div className="card-header bg-secondary bg-opacity-75 text-white text-center fw-bold rounded-top-4">
                                          {t("Profile")}
                                    </div>

                                    <div className="card-body text-center">
                                          <p className="mb-2"><strong>{t("name")}:</strong> {user.name}</p>
                                          <p className="mb-2"><strong>{t("email")}:</strong> {user.email}</p>
                                          <p className="mb-2"><strong>{t("roles")}:</strong> {user.roles.join(", ")}</p>

                                          <div className="mt-3 d-flex justify-content-center">
                                                <div className="img-button pointer"
                                                      onClick={() => navigate("/profile/edit")}>
                                                      <img src={profile_edit} className="icon" alt="edit" />
                                                      <span className="ms-2">{t("Edit")}</span>
                                                </div>
                                          </div>
                                    </div>
                              </div>
                        </div>

                        {/* CONDOMINIUM CARD */}
                        <div className="col-12 col-md-10 col-lg-8">
                              <div className="card my-4 shadow border-0 rounded-4">
                                    <div className="card-header bg-success bg-opacity-75 text-white text-center fw-bold rounded-top-4">
                                          {t("Condominium")}
                                    </div>

                                    {user.condominiums.length === 0 ? (
                                          <div className="card-body text-center">
                                                <h5 className="text-muted">
                                                      {t("No condominuims added")}
                                                </h5>
                                          </div>
                                    ) : (
                                          <div className="card-body">
                                                <div className="table-responsive">
                                                      <table className="table table-striped table-hover align-middle">
                                                            <thead className="table-light">
                                                                  <tr>
                                                                        <th>{t("name")}</th>
                                                                        <th>{t("homes")}</th>
                                                                        <th>{t("start date")}</th>
                                                                        <th>{t("background")}</th>
                                                                  </tr>
                                                            </thead>
                                                            <tbody>
                                                                  {user.condominiums.map((condo) => (
                                                                        <tr key={condo.id}>
                                                                              <td>{condo.name}</td>
                                                                              <td>{condo.type}</td>
                                                                              <td>{condo.size}</td>
                                                                              <td>{condo.startPeriod}</td>
                                                                        </tr>
                                                                  ))}
                                                            </tbody>
                                                      </table>
                                                </div>
                                          </div>
                                    )}
                              </div>
                        </div>

                  </div>
            </div>
      );
};

export default Profile;