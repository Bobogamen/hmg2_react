import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { addCondominium, editCondominium } from "../../api/services/managementService";
import { useLoading } from "../../loader/LoadingContext";
import { Bounce, toast, Zoom } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { useUser } from "../../user/UserContext";
import formatDate from "../../utils/formatDate";

const ModalCondominium = ({ show, handleClose, inputData }) => {
  const { logout } = useUser();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setIsLoading } = useLoading();

  // Check if editing (inputData exists and has an ID)
  const isEditing = !!inputData?.id;

  // State for form data
  const [condominiumData, setCondominiumData] = useState({
    name: '',
    city: '',
    address: '',
    size: '',
    backgroundColor: '',
    startPeriod: ''
  });

  useEffect(() => {
    if (isEditing) {
      // Pre-fill form fields for editing
      setCondominiumData({
        name: inputData.name || '',
        city: inputData.city || '',
        address: inputData.address || '',
        size: inputData.size || '',
        backgroundColor: inputData.backgroundColor || '',
        startPeriod: inputData.startPeriod || '' // Store for displaying as text
      });
    }
  }, [inputData, isEditing]);

  const [condominiumErrors, setCondominiumError] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCondominiumData(prevState => ({
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
        response = await editCondominium({
          id: inputData.id,
          name: inputData.name,
          city: inputData.city,
          address: inputData.address,
          size: inputData.size,
          backgroundColor: inputData.backgroundColor
        });
      } else {
        // Send all fields when creating
        response = await addCondominium(condominiumData);
      }

      if (response.errors) {
        setCondominiumError(response.errors);
      } else {
        handleClose();
        setCondominiumData({
          name: '',
          city: '',
          address: '',
          size: '',
          backgroundColor: '',
          startPeriod: ''
        });
        setCondominiumError([]);
        toast.success(isEditing ? t('Condominium successfully updated') : t('Condominium successfully created'));
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
          {isEditing ? inputData.name : `${t('Create')} ${t('condominium')}`}
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
                  placeholder={t('placeholder_name_condominiums')}
                  name="name"
                  value={condominiumData.name}
                  onChange={handleChange}
                />
                {condominiumErrors.name?.map((error, index) => (
                  <small key={index} className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">
                    {t(error)}
                  </small>
                ))}
              </div>

              {/* City */}
              <div>
                <label>{t('City')}</label>
                <input
                  type="text"
                  placeholder={t('placeholder_city')}
                  name="city"
                  value={condominiumData.city}
                  onChange={handleChange}
                />
                {condominiumErrors.city?.map((error, index) => (
                  <small key={index} className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">
                    {t(error)}
                  </small>
                ))}
              </div>

              {/* Address */}
              <div>
                <label>{t('Address')}</label>
                <input
                  type="text"
                  placeholder={t('placeholder_address')}
                  name="address"
                  value={condominiumData.address}
                  onChange={handleChange}
                />
                {condominiumErrors.address?.map((error, index) => (
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
                  value={condominiumData.size}
                  onChange={handleChange}
                />
                {condominiumErrors.size?.map((error, index) => (
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
                    {formatDate(condominiumData.startPeriod, i18n.language)}
                  </p>
                ) : (
                  <>
                    <input
                      type="date"
                      name="startPeriod"
                      value={condominiumData.startPeriod}
                      onChange={handleChange}
                    />
                    {condominiumErrors.startPeriod?.map((error, index) => (
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
                  value={condominiumData.backgroundColor}
                  onChange={handleChange}
                  style={{ width: '3em', margin: 'auto' }}
                />
                {condominiumErrors.backgroundColor && (
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

export default ModalCondominium;