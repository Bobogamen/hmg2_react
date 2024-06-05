import React from "react";
import { Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import settings from '../../assets/images/app/settings.png';
import edit from '../../assets/images/app/edit.png';


const RepairsTable = ({ repairs }) => {

      const { t } = useTranslation();

      return (
            <div className="border border-3 border-primary border-opacity-50 rounded-5 shadow-lg p-1 mx-1">
                  <div>
                        <h4 className="fw-bold text-capitalize">{t('repairs')}</h4>
                  </div>
                  <Table variant="warning" bordered hover size="sm">
                        <thead>
                              <tr className="fw-bold">
                                    <td className="text-capitalize">{t('initial date')}</td>
                                    <td className="w-50">{t('Name')}</td>
                                    <td className="text-capitalize">{t('budget')}</td>
                                    <td><img src={settings} alt="settings" className="icon pointer" /></td>
                              </tr>
                        </thead>
                        <tbody>
                              {repairs.map(r => (
                                    <tr key={`r${r.id}`} id={r.id}>
                                          <td>{r.startDate}</td>
                                          <td>{r.name}</td>
                                          <td>{r.budget}</td>
                                          <td><img src={edit} alt="edit" className="icon" /></td>
                                    </tr>
                              ))}
                        </tbody>
                  </Table>
            </div >
      )
}

export default RepairsTable;