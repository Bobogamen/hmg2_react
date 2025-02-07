import React from "react";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
      const navigate = useNavigate();
    
      return (
        <>
          <div className="container-fluid">
            <div className="container align-items-center mt-5">
              <p className="h1 text-center mt-5">Status code: 404 Not found</p>
              <p className="h4 text-center">
                The resource you were trying to reach couldn't be found.
              </p>
            </div>
            <div className="col text-center mt-5">
              <button className="btn btn-primary" onClick={() => navigate(-1)}>
                Got to Home
              </button>
            </div>
          </div>
        </>
      );
    };
    
    export default NotFoundPage;