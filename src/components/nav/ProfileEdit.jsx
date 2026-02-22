import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../user/UserContext";
import { useTranslation } from "react-i18next";
import { editProfile } from "../../api/services/profileService";
import { toast, Bounce } from "react-toastify";
import { useLoading } from "../../loader/LoadingContext";

export default function ProfileEdit() {

      const { user, updateUser } = useUser();
      const { t } = useTranslation();
      const { setIsLoading } = useLoading();
      const navigate = useNavigate();

      const [formData, setFormData] = useState({
            name: "",
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: ""
      });

      const [showPasswords, setShowPasswords] = useState({
            currentPassword: false,
            newPassword: false,
            confirmNewPassword: false
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
                  const userResponse  = await editProfile(formData);

                  updateUser(userResponse , null, false);

                  toast.success(t("Profile updated!"));

                  navigate("/profile")

            } catch (error) {

                  if (error.isValidationError) {
                        setErrors(error.errors);
                        return;
                  }

                  toast.error(t("error.message"), { transition: Bounce });
            } finally {
                  setIsLoading(false);
            }
      };

      const togglePassword = (field) => {
            setShowPasswords(prev => ({
                  ...prev,
                  [field]: !prev[field]
            }));
      };


      return (
            <div className="container mt-4">
                  <div className="row justify-content-center">
                        <div className="col-md-8 col-lg-6">
                              <div className="card shadow border-0 rounded-4">
                                    <div className="card-header bg-secondary bg-opacity-75 text-white text-center fw-bold rounded-top-4">
                                          {t("Edit")} {t("Profile")}
                                    </div>

                                    <div className="card-body">
                                          <form onSubmit={handleSubmit}>
                                                <div className="border border-3 rounded-3 p-2">
                                                      {/* ================= PROFILE SECTION ================= */}
                                                      <h6 className="fw-bold mb-3 text-secondary">
                                                            {t("Profile information")}
                                                      </h6>

                                                      {/* Name */}
                                                      <div className="mb-3">
                                                            <label className="smaller">{t("Name")}</label>
                                                            <input
                                                                  type="text"
                                                                  name="name"
                                                                  className="form-control"
                                                                  value={formData.name}
                                                                  onChange={handleChange} />
                                                            {errors.name?.map((error, index) => (
                                                                  <small key={index} className="bg-danger text-light rounded mt-1 mx-2 px-1 d-inline-block">
                                                                        {t(error)}
                                                                  </small>
                                                            ))}
                                                      </div>

                                                      {/* Current Password */}
                                                      <div className="mb-4">
                                                            <label>{t("Current password")}</label>
                                                            <div className="position-relative">
                                                                  <input
                                                                        type={showPasswords.currentPassword ? "text" : "password"}
                                                                        name="currentPassword"
                                                                        className="form-control pe-5"
                                                                        value={formData.currentPassword}
                                                                        onChange={handleChange} />
                                                                  <button
                                                                        type="button"
                                                                        className="btn btn-sm position-absolute top-50 end-0 translate-middle-y fs-5"
                                                                        onClick={() => togglePassword("currentPassword")}>
                                                                        {showPasswords.currentPassword ? "🙈" : "👁"}
                                                                  </button>
                                                            </div>
                                                            {errors.currentPassword?.map((error, index) => (
                                                                  <small key={index} className="bg-danger text-light rounded mt-1 mx-2 px-1 d-inline-block">
                                                                        {t(error)}
                                                                  </small>
                                                            ))}
                                                      </div>
                                                </div>

                                                <hr />
                                                <div className="border border-3 rounded-3 p-2">
                                                      {/* ================= PASSWORD SECTION ================= */}
                                                      <h6 className="fw-bold mb-3 text-secondary">
                                                            {t("Change password")}
                                                      </h6>

                                                      {/* New Password */}
                                                      <div className="mb-3 position-relative">
                                                            <label>{t("New password")}</label>
                                                            <div className="position-relative">
                                                                  <input
                                                                        type={showPasswords.newPassword ? "text" : "password"}
                                                                        name="newPassword"
                                                                        className="form-control pe-5"
                                                                        value={formData.newPassword}
                                                                        onChange={handleChange} />
                                                                  <button
                                                                        type="button"
                                                                        className="btn btn-sm position-absolute top-50 end-0 translate-middle-y fs-5"
                                                                        onClick={() => togglePassword("newPassword")}>
                                                                        {showPasswords.newPassword ? "🙈" : "👁"}
                                                                  </button>
                                                            </div>
                                                            {errors.newPassword?.map((error, index) => (
                                                                  <small key={index} className="bg-danger text-light rounded mt-1 mx-2 px-1 d-inline-block">
                                                                        {t(error)}
                                                                  </small>
                                                            ))}
                                                      </div>

                                                      {/* Confirm New Password */}
                                                      <div className="mb-4 position-relative">
                                                            <label>{t("Confirm")} {t("New password")}</label>
                                                            <div className="position-relative">
                                                                  <input
                                                                        type={showPasswords.confirmNewPassword ? "text" : "password"}
                                                                        name="confirmNewPassword"
                                                                        className="form-control pe-5"
                                                                        value={formData.confirmNewPassword}
                                                                        onChange={handleChange} />
                                                                  <button
                                                                        type="button"
                                                                        className="btn btn-sm position-absolute top-50 end-0 translate-middle-y fs-5"
                                                                        onClick={() => togglePassword("confirmNewPassword")}>
                                                                        {showPasswords.confirmNewPassword ? "🙈" : "👁"}
                                                                  </button>
                                                            </div>
                                                            {errors.confirmNewPassword?.map((error, index) => (
                                                                  <small key={index} className="bg-danger text-light rounded mt-1 mx-2 px-1 d-inline-block">
                                                                        {t(error)}
                                                                  </small>
                                                            ))}
                                                      </div>
                                                </div>
                                                <div className="mt-3">
                                                      {/* Buttons */}
                                                      <div className="d-flex justify-content-between">
                                                            <button type="submit" className="btn btn-success">
                                                                  {t("Save")}
                                                            </button>

                                                            <button
                                                                  type="button"
                                                                  className="btn btn-secondary"
                                                                  onClick={() => navigate("/profile")}>
                                                                  {t("Cancel")}
                                                            </button>
                                                      </div>
                                                </div>
                                          </form>
                                    </div>
                              </div>
                        </div>
                  </div>
            </div>

      );
}