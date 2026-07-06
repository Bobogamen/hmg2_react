import { Bounce, toast, Zoom } from "react-toastify";

const errorHandler = (error, handleClose = () => {}, navigate, t, logout) => {

      if (error.code === 'ERR_NETWORK') {
            toast.error(t('Server not responding'), { transition: Bounce });
      } else if (error.response?.status === 401 || error.message.includes('Please log in again')) {
            handleClose();
            logout();
            navigate('/');
            toast.warning(t("auth:pleaseLoginAgain"), { transition: Zoom });
      } else {
            toast.error(t("server:error"), { transition: Bounce });
      }
}

export default errorHandler;