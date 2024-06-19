import React from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const ModalHome = ({ show, handleClose, action, data }) => {
    const { t } = useTranslation();

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>
                    <div className="d-grid">
                        <span>{t('Add')} {t('home')} {t('in')}</span>
                        <span className="fst-italic">{data.name}</span>
                    </div>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex justify-content-center">
                    <div>
                        <form className="registrationForm">
                            <div>
                                <label className="text-capitalize">{t('floor')}</label>
                                <input type="text" placeholder={t('floor')} name="floor" id="floor" value="" />
                                <small className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">Validation text</small>
                            </div>
                            <div>
                                <label>{t('Name')}</label>
                                <input type="text" placeholder={t('Name')} name="name" id="name" value="" />
                                <small className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">Validation text</small>
                            </div>
                            <button type="submit" className="authentication-button mt-3">
                                {t('Edit')}
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

export default ModalHome;