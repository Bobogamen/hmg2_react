import React from "react";
import { Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import settings from '../../assets/images/app/settings.png';


const HomesTable = ({ homes }) => {

      const { t } = useTranslation();

      return (
            <div className="border border-3 border-primary border-opacity-50 rounded-5 shadow-lg p-1 mx-1">
                  <div className="d-flex justify-content-center align-items-center">
                        <h4 className="text-capitalize fw-bold">{t('homes')}&nbsp;</h4>
                        <h4>- {homes.length}{t('pcs.')}</h4>
                  </div>
                  <Table variant="warning" bordered hover size="sm">
                        <thead>
                              <tr className="fw-bold">
                                    <td>{t('fl')}</td>
                                    <td>{t('apt')}</td>
                                    <td>{t('Owner')}</td>
                                    <td>{t('Residents')}</td>
                                    <td>{`${t('Total')}(лв.)`}</td>
                                    <td><img src={settings} alt="settings" className="icon" /></td>
                              </tr>
                        </thead>
                        <tbody>
                              {homes.map(h => (
                                    <tr key={h.key} id={h.id}>
                                          <td>{h.floor}</td>
                                          <td>{h.name}</td>
                                          <td>{h.owner}</td>
                                          <td>{h.residentsSize}</td>
                                          <td>{h.totalForMonth}</td>
                                          <td></td>
                                    </tr>
                              ))}
                        </tbody>
                  </Table>
            </div >
      )
}

export default HomesTable;