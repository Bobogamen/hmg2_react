import React, { useState } from "react";
import { Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import settings from '../../assets/images/app/settings.png';
import home from '../../assets/images/app/home.png';
import addHome from '../../assets/images/app/add_home.png';
import addResident from '../../assets/images/app/add_resident.png';
import { Link } from "react-router-dom";
import ModalHome from "./ModalHome";
import ModalResident from "./ModalResident";


const HomesTable = ({ homesGroup }) => {
      const [openHomeModal, setOpenHomeModal] = useState(false);
      const [openResidentModal, setOpenResidentModal] = useState(false);

      const handleOpenHomeModal = () => setOpenHomeModal(true);
      const handleCloseHomeModal = () => setOpenHomeModal(false);

      const handleOpenResidentModal = () => setOpenResidentModal(true);
      const handleCloseResidentModal = () => setOpenResidentModal(false);

      const { t } = useTranslation();

      return (
            <div className="border border-3 border-primary border-opacity-50 rounded-5 shadow-lg p-3 mx-1">

                  <div className="d-flex justify-content-center align-items-center">
                        <h4 className="text-capitalize fw-bold">{t('homes')}&nbsp;</h4>
                        <h4>{homesGroup?.homes?.length || 0}{t('pcs.')}</h4>
                  </div>

                  {homesGroup.homes ? (
                        <Table bordered striped hover size="sm">
                              <thead className="align-middle">
                                    <tr className="fw-bold">
                                          <td>{t('fl')}</td>
                                          <td>{t('apt')}</td>
                                          <td className="w-50">{t('Owner')}</td>
                                          <td>{t('Residents')}</td>
                                          <td>{t('Total')}(лв.)</td>
                                          <td><img src={settings} alt="settings" className="icon" /></td>
                                    </tr>
                              </thead>
                              <tbody className="align-middle">
                                    {homesGroup?.homes?.map(h => (
                                          <tr key={`h${h.id}`} id={h.id}>
                                                <td>{h.floor}</td>
                                                <td>{h.name}</td>
                                                <td>{h.owner}</td>
                                                <td>{h.residentsSize}</td>
                                                <td>{h.totalForMonth}</td>
                                                <td>
                                                      <div className="d-flex justify-content-evenly">
                                                            <Link to={`/management/homesGroup/${homesGroup.id}/home/${h.id}`} className="text-decoration-none text-dark" key={h.id}>
                                                                  <img src={home} alt="home" className="icon" />
                                                            </Link>
                                                            <img src={addResident} alt="add_resident" className="icon pointer" onClick={handleOpenResidentModal} />
                                                      </div>
                                                </td>
                                          </tr>
                                    ))}
                              </tbody>
                        </Table>) : (
                        <div>
                              <p className="fw-bold">{t('No homes added')}</p>
                        </div>
                  )}
                  <ModalResident show={openResidentModal} handleClose={handleCloseResidentModal} input={false} />
                  <ModalHome show={openHomeModal} handleClose={handleCloseHomeModal} action={'add'} data={homesGroup} />
                  <div className="img-button pointer m-auto mt-3" onClick={handleOpenHomeModal}>
                        <img src={addHome} className="icon" alt="add" />
                        <span className="ms-1">{`${t('Add')} ${t('home')}`}</span>
                  </div>
            </div >
      )
}

export default HomesTable;