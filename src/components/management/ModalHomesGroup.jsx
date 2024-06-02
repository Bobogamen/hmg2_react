import React from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const ModalHomesGroup = ({ show, handleClose, input }) => {
  const { t } = useTranslation();

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
        {input ? (
          <div className="d-flex justify-content-center">
            <div>
              <form className="registrationForm">
                <div>
                  <label>{t('Name')}</label>
                  <input type="text" placeholder={t('Name')} name="name" id="name" value={input.name} />
                  <small className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">Validation text</small>
                </div>
                <div>
                  <label>{`${t('Number')} ${t('apartments')}/${t('homes')}`}</label>
                  <h6>{input.size}</h6>
                  <input type="number" placeholder="23" name="size" id="size" min={input.size} value={input.size} />
                  <small className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">Validation text</small>
                </div>
                <div>
                  <label>{`${t('Select')} ${t('type')}:`}</label>
                  <span>{input.type}</span>
                </div>
                <div>
                  <label>{`${t('Select')} ${t('initial date')}:`}</label>
                  <span>{input.initialDate}</span>
                </div>
                <div>
                  <label>{`${t('Select')} ${t('color')} ${t('for')} ${t('background')}`}</label>
                  <input type="color" name="backgroundColor" id="backgroundColor" style={{ width: '3em', margin: 'auto' }} />
                </div>
                <button type="submit" className="authentication-button mt-3">
                  {t('Edit')}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="d-flex justify-content-center">
            <div>
              <form className="registrationForm">
                <div>
                  <label>{t('Name')}</label>
                  <input type="text" placeholder={t('Name')} name="name" id="name" />
                  <small className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">Validation text</small>
                </div>
                <div>
                  <label>{`${t('Number')} ${t('apartments')}/${t('homes')}`}</label>
                  <input type="number" placeholder="23" name="size" id="size" />
                  <small className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">Validation text</small>
                </div>
                <div>
                  <label>{`${t('Select')} ${t('type')}`}</label>
                  <select id="type" name="type">
                    <option className="text-center">{t('apartements')}</option>
                  </select>
                </div>
                <div>
                  <label>{`${t('Select')} ${t('initial date')}`}
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
                  <input type="date" name="initialDate" id="initialDate" />
                  <small className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">Validation text</small>
                </div>
                <div>
                  <label>{`${t('Select')} ${t('color')} ${t('for')} ${t('background')}`}</label>
                  <input type="color" name="backgroundColor" id="backgroundColor" style={{ width: '3em', margin: 'auto' }} />
                </div>
                <button type="submit" className="authentication-button mt-3">
                  {t('Add')}
                </button>
              </form >
            </div >
          </div >
        )}
      </Modal.Body >
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>{t('Close')}</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalHomesGroup;