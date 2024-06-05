import React from "react";
import { Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import settings from '../../assets/images/app/settings.png';
import edit from '../../assets/images/app/edit.png';


const BillsTable = ({ bills }) => {

      const { t } = useTranslation();

      return (
            <div className="border border-3 border-primary border-opacity-50 rounded-5 shadow-lg p-1 mx-1">
                  <div>
                        <h4 className="fw-bold text-capitalize">{t('bills')}</h4>
                  </div>
                  <Table variant="warning" bordered hover size="sm">
                        <thead>
                              <tr className="fw-bold">
                                    <td className="text-capitalize">{t('added')}</td>
                                    <td className="w-50">{t('Name')}</td>
                                    <td><img src={settings} alt="settings" className="icon" /></td>
                              </tr>
                        </thead>
                        <tbody>
                              {bills.map(b => (
                                    <tr key={`b${b.id}`} id={b.id}>
                                          <td>{b.addedOn}</td>
                                          <td>{b.name}</td>
                                          <td><img src={edit} alt="edit" className="icon pointer" /></td>
                                    </tr>
                              ))}
                        </tbody>
                  </Table>
            </div >
      )
}

export default BillsTable;