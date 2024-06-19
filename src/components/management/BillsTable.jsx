import React, { useState } from "react";
import { Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import settings from '../../assets/images/app/settings.png';
import add from '../../assets/images/app/add.png';
import edit from '../../assets/images/app/edit.png';
import ModalBill from "./ModalBill";


const BillsTable = ({ bills }) => {
      const [openFeeModal, setOpenFeeModal] = useState(false);

      const { t } = useTranslation();

      const handleOpen = () => setOpenFeeModal(true);
      const handleClose = () => setOpenFeeModal(false);

      return (
            <div className="border border-3 border-primary border-opacity-50 rounded-5 shadow-lg p-3 mx-1">
                  <div className="d-flex justify-content-center align-items-center">
                        <h4 className="text-capitalize fw-bold">{t('bills')}&nbsp;</h4>
                        <h4>{bills.length}{t('pcs.')}</h4>
                  </div>
                  <Table bordered striped hover size="sm">
                        <thead className="align-middle">
                              <tr className="fw-bold">
                                    <td className="text-capitalize">{t('added')}</td>
                                    <td className="w-50">{t('Name')}</td>
                                    <td><img src={settings} alt="settings" className="icon" /></td>
                              </tr>
                        </thead>
                        <tbody className="align-middle">
                              {bills.map(b => (
                                    <tr key={`b${b.id}`} id={b.id}>
                                          <td>{b.addedOn}</td>
                                          <td>{b.name}</td>
                                          <td><img src={edit} alt="edit" className="icon pointer" /></td>
                                    </tr>
                              ))}
                        </tbody>
                  </Table>
                  <ModalBill show={openFeeModal} handleClose={handleClose} action={'add'} data={"null"} />
                  <div className="img-button pointer m-auto mt-3" onClick={handleOpen}>
                        <img src={add} className="icon" alt="add" />
                        <span className="ms-1">{`${t('Add')} ${t('bill')}`}</span>
                  </div>
            </div >
      )
}

export default BillsTable;