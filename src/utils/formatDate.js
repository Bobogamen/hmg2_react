import { format } from 'date-fns';
import { bg, enGB } from 'date-fns/locale';

const formatDate = (date, language) => {
  const parsedDate = new Date(date);

  if (isNaN(parsedDate)) {
    return null;
  }

  const locale = language === 'bg' ? bg : enGB;
  return format(parsedDate, 'dd-MMM-yyyy', { locale });
};

export default formatDate;