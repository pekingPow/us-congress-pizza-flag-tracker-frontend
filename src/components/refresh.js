import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import PopUpBoxComponent from "./popUpBoxComponent";
import OrderDataService from "../service/orderService";
import styles from "../style/orderForm.module.css";

//This component should be removed prior to production

const Refresh = () => {
  const initialMessageState = {
    checkSaved: true,
    isLastChangeUSState: false,
    text: "Please wait a moment for the database to reset.",
  };

  const [message, setMessage] = useState(initialMessageState);
  const [popUpBox, setPopUpBox] = useState("none");
  const [redirectNow, setRedirectNow] = useState("");

  const resetDatabase = () => {
    setPopUpBox("block");
    return OrderDataService.reset()
      .then((response) => {
        setRedirectNow("yes");
      })
      .catch((e) => {
        setMessage({
          ...message,
          text: "Network Error, please see your IT Administrator",
        });
      });
  };

  const closePopUpBox = () => {
    setPopUpBox("none");
    setMessage({
      ...message,
      text: "Please wait a moment for the database to reset.",
    });
  };

  return (
    <>
      <div className={styles.formContainer}>
        <button onClick={resetDatabase} className={`btn btn-success`}>
          Reset Database
        </button>
      </div>
      {redirectNow ? <Redirect to="/" /> : <></>}
      <PopUpBoxComponent
        closePopUpBox={closePopUpBox}
        message={message}
        popUpBox={popUpBox}
      />
    </>
  );
};

export default Refresh;
