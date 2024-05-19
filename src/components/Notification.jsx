import React, { useEffect, useState } from "react";
import '../Notification.css'

const Notification = () => {
      const [success, setSuccess] = useState(false);
      const [fail, setFail] = useState(false);

      useEffect(() => {
            setSuccess(false)
            setFail(false)
      }, [])

      return (
            <section className="notification">
                  {success ?
                        <p id="fail" className="bg-success text-light rounded mb-1 px-1">Successfull</p>
                        : null}
                  {fail ?
                        <p id="success" className="bg-danger text-light rounded mb-1 px-1">Fail</p>
                        : null}
            </section>
      )
}

export default Notification;