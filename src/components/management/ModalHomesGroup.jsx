import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { addHomesGroup, editHomesGroup } from "../../api/services/managementService";
import { useLoading } from "../../loader/LoadingContext";
import { Bounce, toast, Zoom } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { useUser } from "../../user/UserContext";
import formatDate from "../../utils/formatDate";

const ModalHomesGroup = ({ show, handleClose, inputData }) => {
  const { logout } = useUser();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setIsLoading } = useLoading();

  // Check if editing (inputData exists and has an ID)
  const isEditing = !!inputData?.id;

  // State for form data
  const [homesGroupData, setHomesGroupData] = useState({
    name: '',
    size: '',
    backgroundColor: '',
    startPeriod: ''
  });

  useEffect(() => {
    if (isEditing) {
      // Pre-fill form fields for editing
      setHomesGroupData({
        name: inputData.name || '',
        size: inputData.size || '',
        backgroundColor: inputData.backgroundColor || '',
        startPeriod: inputData.startPeriod || '' // Store for displaying as text
      });
    }
  }, [inputData, isEditing]);

  const [homesGroupErrors, setHomesGroupError] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHomesGroupData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let response;
      if (isEditing) {
        // Send only allowed fields when editing
        response = await editHomesGroup({
          id: inputData.id,
          name: homesGroupData.name,
          size: homesGroupData.size,
          backgroundColor: homesGroupData.backgroundColor
        });
      } else {
        // Send all fields when creating
        response = await addHomesGroup(homesGroupData);
      }

      if (response.errors) {
        setHomesGroupError(response.errors);
      } else {
        handleClose();
        setHomesGroupData({
          name: '',
          size: '',
          backgroundColor: '',
          startPeriod: ''
        });
        setHomesGroupError([]);
        toast.success(isEditing ? t('Group successfully updated') : t('Group successfully created'));
      }
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        toast.error(t('Server not responding'), { transition: Bounce });
      } else if (error.response?.status === 401 || error.message.includes('Please log in again')) {
        handleClose();
        logout();
        navigate('/');
        toast.warning(t('Please, log in again'), { transition: Zoom });
      } else {
        toast.error(t('Server error'), { transition: Bounce });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">
          {isEditing ? inputData.name : `${t('Create')} ${t('group')}`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex justify-content-center">
          <div>
            <form className="registrationForm" onSubmit={handleSubmit}>
              {/* Name */}
              <div>
                <label>{t('Name')}</label>
                <input
                  type="text"
                  placeholder={t('Name')}
                  name="name"
                  value={homesGroupData.name}
                  onChange={handleChange}
                />
                {homesGroupErrors.name?.map((error, index) => (
                  <small key={index} className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">
                    {t(error)}
                  </small>
                ))}
              </div>

              {/* Size */}
              <div>
                <label>{`${t('Number')} ${t('apartments')}/${t('homes')}`}</label>
                <input
                  type="number"
                  placeholder="23"
                  name="size"
                  value={homesGroupData.size}
                  onChange={handleChange}
                />
                {homesGroupErrors.size?.map((error, index) => (
                  <small key={index} className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">
                    {t(error)}
                  </small>
                ))}
              </div>

              {/* Start Period */}
              <div>
                <label>{`${t('Select')} ${t('start date')}`}</label>
                {isEditing ? (
                  <p className="fw-bold text-danger border border-2 border-dark rounded px-1 mt-1">
                    {formatDate(homesGroupData.startPeriod, i18n.language)}
                  </p>
                ) : (
                  <>
                    <input
                      type="date"
                      name="startPeriod"
                      value={homesGroupData.startPeriod}
                      onChange={handleChange}
                    />
                    {homesGroupErrors.startPeriod?.map((error, index) => (
                      <small key={index} className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">
                        {t(error)}
                      </small>
                    ))}
                  </>
                )}
              </div>

              {/* Background Color */}
              <div>
                <label>{`${t('Select')} ${t('color')} ${t('for')} ${t('background')}`}</label>
                <input
                  type="color"
                  name="backgroundColor"
                  value={homesGroupData.backgroundColor}
                  onChange={handleChange}
                  style={{ width: '3em', margin: 'auto' }}
                />
                {homesGroupErrors.backgroundColor && (
                  <small className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">
                    {t('choose color')}
                  </small>
                )}
              </div>

              {/* Submit Button */}
              <button type="submit" className="authentication-button mt-3">
                {isEditing ? t('Save') : t('Add')}
              </button>
            </form>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>{t('Close')}</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalHomesGroup;