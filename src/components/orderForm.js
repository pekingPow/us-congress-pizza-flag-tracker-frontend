import React, { useState } from "react";
import Select from "react-select";
import { STATES } from "./states.js";
import styles from "../style/orderForm.module.css";

const OrderForm = (props) => {
  const {
    order,
    message,
    setOrderFunc,
    setMessageFunc,
    saveOrderFunc,
    mode,
    deleteOrderFunc,
    statuses,
    loading,
  } = props;

  const [whyCantIUpdate, setWhyCantIUpdate] = useState(false);

  let optionUSStates = [];
  if (STATES) {
    optionUSStates = STATES.map((state) => ({
      label: state.name,
      name: "usa_state",
      value: state.name,
    }));
  }

  let optionDistricts = [];
  if (STATES && order.usa_state) {
    optionDistricts = STATES.filter(
      (state) => state.name === order.usa_state
    )[0]["districts"].map((district) => ({
      label: district,
      name: "home_office_code",
      value: district,
    }));
  }

  let optionStatuses = [];
  if (statuses) {
    optionStatuses = statuses.map((status) =>
      /* Old Filter by DEMO Organization Code was here
        to be rewired to ACTUAL User Profile DB info  */
      ({
        label: `#${status.sequence_num} ${status.description}`,
        name: "order_status_id",
        value: status.sequence_num,
      })
    );
  }

  // putting this in Component State makes this check old state instead of what state is being updated to
  // and/or exceed maximum update depth error
  let districtMatchCheck = true;
  if (order.usa_state && order.home_office_code) {
    let currentDistricts = STATES.filter(
      (state) => state.name === order.usa_state
    );
    districtMatchCheck = currentDistricts[0].districts.includes(
      order.home_office_code
    );
  }

  const handleInputChange = (event) => {
    let { name, value } = event;
    if (event.target) {
      name = event.target.name;
      value = event.target.value;
    }
    setMessageFunc({
      ...message,
      isLastChangeUSState: false,
      text: "",
      checkSaved: false,
    });
    if (name === "usa_state") {
      setOrderFunc({ ...order, home_office_code: "" });
      setMessageFunc((prevMessageFunc) => {
        return { ...prevMessageFunc, isLastChangeUSState: true };
      });
    }
    setOrderFunc((prevOrderFunc) => {
      return { ...prevOrderFunc, [name]: value };
    });
    setWhyCantIUpdate(false);
    if (name === "order_status_id") {
      handleStatusChange(event);
    }
  };

  const handleStatusChange = (event) => {
    // the backend doesn't need this but the frontend does need it to make select box display correctly
    let { name, value, label } = event;

    for (let i = 0; i < label.length; i++) {
      if (label[i] === " ") {
        let result = label.slice(i + 1);
        label = result;
        break;
      }
    }

    setOrderFunc((prevOrderFunc) => {
      return {
        ...prevOrderFunc,
        status: { sequence_num: value, description: label },
      };
    });
  };

  const whyNoSave = () => {
    setWhyCantIUpdate(true);
  };

  // used to set Submit button className in addition to handleSave function
  let disableButton = false;
  if (
    !order.order_number ||
    !order.usa_state ||
    !order.home_office_code ||
    !districtMatchCheck
  ) {
    disableButton = true;
  }

  const handleSave = () => {
    if (disableButton) {
      whyNoSave();
    } else {
      saveOrderFunc();
    }
  };

  return (
    <>
      <div className={styles.formContainer}>
        {mode === "edit" ? (
          <h1 className={styles.title}>Edit Order</h1>
        ) : (
          <h1 className={styles.title}>Add Order</h1>
        )}
        {mode === "edit" && loading ? (
          "Loading..."
        ) : (
          <>
            <div className={styles.constituentBox}>
              {order.person === undefined ? (
                <></>
              ) : (
                <>
                  <h5 className={styles.constituent}>{order.person.name}</h5>
                  <h5 className={styles.constituent}>{order.person.phone}</h5>
                  <h5 className={styles.constituent}>{order.person.address}</h5>
                  <h5 className={styles.constituent}>{order.person.town}</h5>
                </>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="order_number">Order Number</label>
              <input
                type="text"
                className="form-control"
                id="order_number"
                required
                value={order.order_number}
                onChange={handleInputChange}
                name="order_number"
              />
              {!order.order_number && whyCantIUpdate ? (
                <p className={styles.validationMessage}>
                  Enter a valid Order Number
                </p>
              ) : (
                ""
              )}
            </div>

            <span className={styles.flexContainer}>
              <div className={styles.formGroup}>
                <label htmlFor="edit-us-state">US State:</label>{" "}
                <Select
                  inputId="edit-us-state"
                  onChange={handleInputChange}
                  options={optionUSStates}
                  value={{
                    label: order.usa_state,
                    name: "usa_state",
                    value: order.usa_state,
                  }}
                />
                {!order.usa_state && whyCantIUpdate ? (
                  <p className={styles.validationMessage}>Pick a US State</p>
                ) : (
                  ""
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="edit-office">District:</label>{" "}
                {order.usa_state ? (
                  message.isLastChangeUSState ? (
                    <Select
                      inputId="edit-office"
                      onChange={handleInputChange}
                      options={optionDistricts}
                      value={null}
                    />
                  ) : (
                    <Select
                      inputId="edit-office"
                      onChange={handleInputChange}
                      options={optionDistricts}
                      value={{
                        label: order.home_office_code,
                        name: "home_office_code",
                        value: order.home_office_code,
                      }}
                    />
                  )
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    value="Pick a US State first..."
                    readOnly="readOnly"
                  />
                )}
                {!order.home_office_code && whyCantIUpdate ? (
                  <p className={styles.validationMessage}>
                    Pick a Congressional Office
                  </p>
                ) : (
                  ""
                )}
                {!districtMatchCheck && whyCantIUpdate ? (
                  <p className={styles.validationMessage}>
                    US State and Congressional Office must correspond
                  </p>
                ) : (
                  ""
                )}
              </div>
            </span>

            {mode === "edit" ? (
              <>
                <div className="form-group">
                  <label htmlFor="edit-status">Status:</label>{" "}
                  <Select
                    inputId="edit-status"
                    onChange={handleInputChange}
                    options={optionStatuses}
                    value={{
                      label: `#${order.status.sequence_num} ${order.status.description}`,
                      name: "order_status_id",
                      value: order.status.sequence_num,
                    }}
                  />
                </div>

                {/* <div className="form-group">
                  <label>QR Code</label>
                  {order.uuid}
                  <img
                    src={baseURL + "/qrcode/" + order.uuid}
                    className={styles.qrImage}
                    alt="QR Code"
                    align="center"
                  />
                </div> */}
              </>
            ) : null}

            {mode === "edit" && (
              <button
                className="btn badge-danger mr-2"
                onClick={deleteOrderFunc}
              >
                Delete
              </button>
            )}
            <button
              onClick={handleSave}
              className={`btn btn-success ${disableButton ? "btn-why" : ""}`}
            >
              {mode === "edit" ? "Update" : "Submit"}
            </button>

            {!message.checkSaved ? (
              <p className={styles.validationMessage}>
                Changes not saved, press {mode === "edit" ? "Update" : "Submit"}{" "}
                to save changes
              </p>
            ) : (
              ""
            )}
          </>
        )}
      </div>
    </>
  );
};

export default OrderForm;
