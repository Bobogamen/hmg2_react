import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { addHomesGroup } from "../../api/services/managementService";
import { useLoading } from "../../loader/LoadingContext";
import { toast } from "react-toastify";

const ModalHomesGroup = ({ show, handleClose, input }) => {
  const { t } = useTranslation();
  const { setIsLoading } = useLoading();
  const [homesGroupData, setHomesGroupData] = useState({
    name: '',
    size: '',
    type: '',
    startPeriod: '',
    backgroundColor: ''
  })

  const [homesGroupErrors, setHomesGroupError] = useState([])


  const handleChange = (e) => {
    const { name, value } = e.target;
    setHomesGroupData(prevState => ({
      ...prevState,
      [name]: value
    }))

  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true)

    const response = await addHomesGroup(homesGroupData);

    if (response.errors) {
      console.log(response.errors)
      setHomesGroupError(response.errors);
      setIsLoading(false);
      return
    } else {
      handleClose();
      setHomesGroupData({})
      setHomesGroupError([]);
      setIsLoading(false)
      toast.success(t('Successful Registration'));
      console.log(response)
    }
    // else {
    //     const data = await login(userData.email, userData.password);
    //     saveUser(data, false);
    //     navigate('/management')
    //     toast.success(t('Successful Login'), { transition: Bounce });
    // }

    // setIsLoading(false);
    // navigate('/management');
  };

  const hideMessages = () => {
    const cards = document.querySelectorAll('.warning-card');
    cards.forEach(c => c.classList.add('d-none'));
  };

  const showMessage = (event) => {
    hideMessages();
    const divForShowing = event.target.nextElementSibling;
    divForShowing.classList.remove('d-none');
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{input ? input.name : `${t('Create')} ${t('group')}`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex justify-content-center">
          <div>
            <form className="registrationForm" onSubmit={handleSubmit}>
              <div>
                <label>{t('Name')}</label>
                <input type="text" placeholder={t('Name')} name="name" id="name" value={homesGroupData.name} onChange={handleChange} />
                {homesGroupErrors.name ? homesGroupErrors.name.map((error, index) => (
                  <small key={index} className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">{t(error)}</small>
                )) : null}
              </div>
              <div>
                <label>{`${t('Number')} ${t('apartments')}/${t('homes')}`}</label>
                <input type="number" placeholder="23" name="size" id="size" value={homesGroupData.size} onChange={handleChange} />
                {homesGroupErrors.size ? homesGroupErrors.size.map((error, index) => (
                  <small key={index} className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">{t(error)}</small>
                )) : null}
              </div>
              <div>
                <label>{`${t('Select')} ${t('type')}`}</label>
                <select id="type" name="type" disabled>
                  <option className="text-center" value="{homesGroupData.type}" onChange={handleChange} >{t('Apartments building')}</option>
                </select>
                {homesGroupErrors.type ? homesGroupErrors.type.map((error, index) => (
                  <small key={index} className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">{t(error)}</small>
                )) : null}
              </div>
              <div>
                <label>{`${t('Select')} ${t('start date')}`}
                  <span className="pointer" onMouseOver={showMessage} onMouseOut={hideMessages}>&#9432;</span>
                  <div className="warning-card d-none">
                    <span>{t('WARNING!')}</span>
                    <div className="d-flex justify-content-center align-items-center">
                      <span className="fw-lighter">{`${t('After creation,')}`}&nbsp;</span>
                      <span className="fw-lighter fst-italic">{`${t('initial date')}`}</span>
                    </div>
                    <span>{t('CANNOT BE CHANGED!')}</span>
                  </div>
                  <span className="pointer" onMouseOver={showMessage} onMouseOut={hideMessages}>&#9888;</span>
                  <div className="warning-card d-none">
                    <div className="d-flex justify-content-center align-items-center">
                      <span className="fst-italic fw-lighter">{`${t('initial date')}`}&nbsp;</span>
                      <span className="fw-lighter">{`${t('is')}`}&nbsp;</span>
                      <span className="fw-lighter fw-bold text-uppercase">{`${t('month')}`}&nbsp;</span>
                      <span className="fw-lighter">{`${t('and')}`}&nbsp;</span>
                      <span className="fw-lighter fw-bold text-uppercase">{`${t('year')},`}&nbsp;</span>
                    </div>
                    <span className="fw-lighter">{`${t('of which reports begins!')}`}&nbsp;</span>
                    <span>{t('EXAMPLE: May 2020')}</span>
                  </div>
                </label>
                <input type="date" name="startPeriod" id="startPeriod" value={homesGroupData.startPeriod} onChange={handleChange} />
                {homesGroupErrors.startPeriod ? homesGroupErrors.startPeriod.map((error, index) => (
                  <small key={index} className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">{t(error)}</small>
                )) : null}
              </div>
              <div>
                <label>{`${t('Select')} ${t('color')} ${t('for')} ${t('background')}`}</label>
                <input type="color" name="backgroundColor" id="backgroundColor" value={homesGroupData.backgroundColor} onChange={handleChange}
                  style={{ width: '3em', margin: 'auto' }} />
                  {homesGroupErrors.backgroundColor ? homesGroupErrors.backgroundColor.map((error, index) => (
                  <small key={index} className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">{t(error)}</small>
                )) : null}
              </div>
              <button type="submit" className="authentication-button mt-3">
                {t('Add')}
              </button>
            </form >
          </div >
        </div >
      </Modal.Body >
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>{t('Close')}</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalHomesGroup;