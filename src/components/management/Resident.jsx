import React from "react";
import { useTranslation } from "react-i18next";

const Resident = (owner) => {

    const { t } = useTranslation();

    return (
        <div>
            <form className="registrationForm">
                <h3>Resident</h3>
                <div>
                    <label>{t('First name')}</label>
                    <input type="text" placeholder={t('First name')} name="firstName" id="firstName" value="" />
                    <small className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">Validation text</small>
                </div>
                <div>
                    <label>{t('Middle name')}</label>
                    <input type="text" placeholder={t('Middle name')} name="middleName" id="middleName" value="" />
                    <small className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">Validation text</small>
                </div>
                <div>
                    <label>{t('Last name')}</label>
                    <input type="text" placeholder={t('Last name')} name="lastName" id="lastName" value="" />
                    <small className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">Validation text</small>
                </div>
                <div>
                    <label>Email</label>
                    <input type="text" placeholder="Email" name="email" id="email" value="" />
                    <small className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">Validation text</small>
                </div>
                <div>
                    <label>{t('Telephone')}</label>
                    <input type="text" placeholder={t('Telephone')} name="phone" id="phone" value="" />
                    <small className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">Validation text</small>
                </div>
                <div className="modal-footer border-0 justify-content-center">
                    <button type="submit" id="modal-button" className="button mx-3 visible-hidden">
                        {t('Add')}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default Resident;