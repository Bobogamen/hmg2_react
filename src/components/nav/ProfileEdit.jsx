import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../user/UserContext";
import { useTranslation } from "react-i18next";
import { editProfile } from "../../api/services/profileService";
import { toast, Bounce } from "react-toastify";
import { useLoading } from "../../loader/LoadingContext";

export default function ProfileEdit() {

      const { user, saveUser } = useUser();
      const { t } = useTranslation();
      const { setIsLoading } = useLoading();
      const navigate = useNavigate();

      const [formData, setFormData] = useState({
            name: "",
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: ""
      });

      const [errors, setErrors] = useState({});

      useEffect(() => {
            if (user) {
                  setFormData(prev => ({
                        ...prev,
                        name: user.name
                  }));
            }
      }, [user]);

      if (!user) {
            return (
                  <div className="container mt-4 text-center">
                        <div className="spinner-border text-secondary" />
                  </div>
            );
      }

      const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({
                  ...prev,
                  [name]: value
            }));
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            setIsLoading(true);
            setErrors({});

            try {
                  const response = await editProfile(formData);

                  if (response?.errors) {
                        setErrors(response.errors);
                  } else {
                        toast.success(t("Profile updated successfully"));

                        if (response?.user) {
                              saveUser(response.user, true);
                        }

                        navigate("/profile");
                  }

            } catch (error) {
                  if (error.code === "ERR_NETWORK") {
                        toast.error(t("Server not responding"), { transition: Bounce });
                  } else {
                        toast.error(t("Server error"), { transition: Bounce });
                  }
            } finally {
                  setIsLoading(false);
            }
      };

      return (
            <div className="container mt-4">
                  <div className="row justify-content-center">
                        <div className="col-10 col-md-8 col-lg-6">
                              <div className="card shadow border-0 rounded-4">
                                    <div className="card-header bg-secondary bg-opacity-75 text-white text-center fw-bold rounded-top-4">
                                          {t("Edit")} {t("Profile")}
                                    </div>
                                    <div className="card-body">
                                          <form onSubmit={handleSubmit}>

                                                {/* Name */}
                                                <div className="mb-3">
                                                      <label>{t("Name")}</label>
                                                      <input
                                                            type="text"
                                                            name="name"
                                                            className="form-control"
                                                            value={formData.name}
                                                            onChange={handleChange}
                                                      />
                                                      {errors.name?.map((error, index) => (
                                                            <small key={index} className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">
                                                                  {t(error)}
                                                            </small>
                                                      ))}
                                                </div>

                                                <hr />

                                                {/* Current Password */}
                                                <div className="mb-3">
                                                      <label>{t("Current password")}</label>
                                                      <input
                                                            type="password"
                                                            name="currentPassword"
                                                            className="form-control"
                                                            value={formData.currentPassword}
                                                            onChange={handleChange}
                                                      />
                                                      {errors.currentPassword?.map((error, index) => (
                                                            <small key={index} className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">
                                                                  {t(error)}
                                                            </small>
                                                      ))}
                                                </div>

                                                {/* New Password */}
                                                <div className="mb-3">
                                                      <label>{t("New password")}</label>
                                                      <input
                                                            type="password"
                                                            name="newPassword"
                                                            className="form-control"
                                                            value={formData.newPassword}
                                                            onChange={handleChange}
                                                      />
                                                      {errors.newPassword?.map((error, index) => (
                                                            <small key={index} className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">
                                                                  {t(error)}
                                                            </small>
                                                      ))}
                                                </div>

                                                {/* Confirm New Password */}
                                                <div className="mb-3">
                                                      <label>{t("Confirm")} {t("New password")}</label>
                                                      <input
                                                            type="password"
                                                            name="confirmNewPassword"
                                                            className="form-control"
                                                            value={formData.confirmNewPassword}
                                                            onChange={handleChange}
                                                      />
                                                      {errors.confirmNewPassword?.map((error, index) => (
                                                            <small key={index} className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">
                                                                  {t(error)}
                                                            </small>
                                                      ))}
                                                </div>

                                                <div className="d-flex justify-content-between">
                                                      <button type="submit" className="btn btn-success">
                                                            {t("Save")}
                                                      </button>

                                                      <button
                                                            type="button"
                                                            className="btn btn-secondary"
                                                            onClick={() => navigate("/profile")}
                                                      >
                                                            {t("Cancel")}
                                                      </button>
                                                </div>

                                          </form>
                                    </div>
                              </div>
                        </div>
                  </div>
            </div>

      );
}