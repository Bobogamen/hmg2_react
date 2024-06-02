import React from "react";
import { Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import settings from '../../assets/images/app/settings.png';


const FeesTable = ({ fees }) => {

      const { t } = useTranslation();

      return (
            <div className="border border-3 border-primary border-opacity-50 rounded-5 shadow-lg p-1 mx-1">
                  <div>
                        <h4 className="fw-bold text-capitalize">{t('fees')}</h4>
                  </div>
                  <Table variant="warning" bordered hover size="sm">
                        <thead>
                              <tr className="fw-bold">
                                    <td>{t('added')}</td>
                                    <td>{t('name')}</td>
                                    <td>{t('value')}</td>
                                    <td>{t('homes')}</td>
                                    <td><img src={settings} alt="settings" className="icon" /></td>
                              </tr>
                        </thead>
                        <tbody>
                              {fees.map(f => (
                                    <tr key={f.key} id={f.id}>
                                          <td>{f.addedOn}</td>
                                          <td>{f.name}</td>
                                          <td>{f.value}</td>
                                          <td>{f.homes}</td>
                                          <td></td>
                                    </tr>
                              ))}
                        </tbody>
                  </Table>
            </div >
      )
}

export default FeesTable;