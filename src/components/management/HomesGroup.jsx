import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

const HomesGroup = () => {
      const { id } = useParams()
      const { t } = useTranslation();

      const hideMessages = () => {
            const cards = document.querySelectorAll('.warning-card');
            cards.forEach(c => c.classList.add('d-none'))
      }
      const showMessage = (input) => {
            hideMessages()
            const divForShowing = input.target.nextElementSibling;
            divForShowing.classList.remove('d-none')
      }

      return (
            <>
                  {id ? (
                        <div>
                              <h1>HomesGroup{id}</h1>
                        </div>
                  ) : (
                        <>
                              <h2 className="mt-2">{`${t('Create')} ${t('group')}`}</h2>
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
                                          </form>
                                    </div>
                              </div>
                        </>
                  )}
            </>
      )
}

export default HomesGroup;

const homesGroup = {
      id: 1,
      name: 'кв. Надежда бл. 103 вх. А',
      type: 'Жилищен блок',
      initialDate: '1-10-2018',
      homes: [
            {
                  id: 1,
                  floor: '1',
                  name: '1',
                  owner: 'Милен',
                  residentsSize: 3,
                  totalForMonth: 0.0
            },
            {
                  id: 2,
                  floor: '1',
                  name: '2',
                  owner: 'Кирил',
                  residentsSize: 1,
                  totalForMonth: 0.0
            },
            {
                  id: 3,
                  floor: '2',
                  name: '3',
                  owner: 'Веска Берова',
                  residentsSize: 2,
                  totalForMonth: 0.0
            }

      ],
      fees: [
            {
                  id: 1,
                  addedOn: '27-09-2023',
                  name: 'Живущ ет. 1 или 2',
                  value: 3,
                  homes: 5
            },
            {
                  id: 2,
                  addedOn: '27-09-2023',
                  name: 'Живущ ет. 3 до 8',
                  value: 7,
                  homes: 18
            },
            {
                  id: 3,
                  addedOn: '27-09-2023',
                  name: 'Управление',
                  value: 3,
                  homes: 23
            }
      ],
      bills: [
            {
                  id: 1,
                  addedOn: '27-09-2023',
                  name: 'Такса АСАНСЬОР',
            },
            {
                  id: 2,
                  addedOn: '27-09-2023',
                  name: 'Ток АСАНСЬОР',
            },
            {
                  id: 3,
                  addedOn: '27-09-2023',
                  name: 'Ток Стълби',
            }
      ]
}

console.log(homesGroup)