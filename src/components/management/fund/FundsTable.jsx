import React, { useState } from "react";
import { Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import settings from '../../../assets/images/app/settings.png';
import edit from '../../../assets/images/app/edit.png';
import ModalFund from "./ModalFund";


const FundsTable = ({ funds }) => {
      const [openFeeModal, setOpenFeeModal] = useState(false);

      const { t } = useTranslation();

      const handleClose = () => setOpenFeeModal(false);

      return (
            <div className="bg-secondary bg-opacity-50  border border-3 border-primary border-opacity-75 rounded-5 shadow-lg p-3 mx-1">
                  <div className="d-flex justify-content-center align-items-center">
                        <h4 className="text-capitalize fw-bold">{t('funds')}&nbsp;</h4>
                        <h4>{funds.length}{t('pcs.')}</h4>
                  </div>
                  <Table bordered striped hover size="sm">
                        <thead className="align-middle">
                              <tr className="fw-bold">
                                    <td className="text-capitalize">{t('initial date')}</td>
                                    <td className="w-50">{t('Name')}</td>
                                    <td className="text-capitalize">{t('budget')}(лв.)</td>
                                    <td><img src={settings} alt="settings" className="icon pointer" /></td>
                              </tr>
                        </thead>
                        <tbody className="align-middle">
                              {funds.map(f => (
                                    <tr key={`r${f.id}`} id={f.id}>
                                          <td>{f.startDate}</td>
                                          <td>{f.name}</td>
                                          <td>{f.budget}</td>
                                          <td><img src={edit} alt="edit" className="icon" /></td>
                                    </tr>
                              ))}
                        </tbody>
                  </Table>
                  <ModalFund show={openFeeModal} handleClose={handleClose} action={'add'} data={"null"} />
            </div >
      )
}

export default FundsTable;