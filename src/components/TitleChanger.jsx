import React from "react"
import { Helmet } from 'react-helmet'
import { useTranslation } from "react-i18next"

const TitleChanger = () => {
      const { t } = useTranslation();

      return (
            <Helmet>
                  <title>{t('homepage:homeManager')}</title>
            </Helmet>
      )
}

export default TitleChanger;