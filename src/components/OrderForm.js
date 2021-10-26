import React from "react";
import { STATES } from "./states.js";
import { STATUSES } from "./Statuses.js";
import { baseURL } from "../http-common";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
  ComboboxOptionText,
} from "@reach/combobox";
import "@reach/combobox/styles.css";
import "./OrderForm.css";

const OrderForm = (props) => {
  const {
    order,
    status,
    setOrderFunc,
    setStatusFunc,
    setMessageFunc,
    saveOrderFunc,
    mode,
    deleteOrderFunc,
  } = props;

  const onKeyDownEvent = (event) => {
    if (event.key === "Enter") {
      event.currentTarget.blur();
      handleInputChange(event);
    }
  };

  const handleClick = (event) => {
    let clickEvent = {
      target: {
        name: "",
        value: "",
      },
    };
    clickEvent.target.value = event.target.innerText;
    clickEvent.target.name = event.target.className;
    handleInputChange(clickEvent);
  };

  const handleInputChange = (event) => {
    let { name, value } = event.target;
    console.log(name);
    console.log(value);
    if (name === "usa_state") {
      value = value.toUpperCase();
      setOrderFunc({ ...order, home_office_code: "" });
    }
    setOrderFunc((prevOrderFunc) => {
      return { ...prevOrderFunc, [name]: value };
    });
    if (setMessageFunc) {
      setMessageFunc("Changes not saved, Press Update to save changes");
    }
  };

  // responses from DB overwriting status values in order's state
  // handleStatusChange temporary until status info integrated into response.data
  const handleStatusChange = (event) => {
    const { name, value } = event.target;
    if (setStatusFunc) {
      setStatusFunc({ ...status, [name]: value });
    }
    if (setMessageFunc) {
      setMessageFunc("Changes not saved, Press Update to save changes");
    }
  };

  // putting this in Component State makes this check old state instead of what state is being updated to
  // and/or exceed maximum update depth error
  let districtMatchCheck = true;
  if (mode === "edit" && order.usa_state) {
    let currentDistricts = STATES.filter(
      (state) => state.name === order.usa_state
    );
    districtMatchCheck = currentDistricts[0].districts.includes(
      order.home_office_code
    );
    console.log("Current Office: ", order.home_office_code);
    console.log("Is Match: ", districtMatchCheck);
  }

  return (
    <div>
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
      </div>

      <div className="form-group, flex">
        <label htmlFor="usa_state">US State: {order.usa_state}</label>{" "}
        <select
          value={order.usa_state ? order.usa_state : "select"}
          id="usa_state"
          onChange={handleInputChange}
          name="usa_state"
        >
          <option value="select" key="blank" hidden disabled>
            Select
          </option>
          {STATES &&
            STATES.map((state, index) => {
              return (
                <option value={state.name} key={index}>
                  {state.name}
                </option>
              );
            })}
        </select>
        <Combobox aria-labelledby="usa_state">
          <ComboboxInput
            name="usa_state"
            onKeyDown={onKeyDownEvent}
            selectOnClick
          />
          <ComboboxPopover>
            <ComboboxList onClick={handleClick}>
              {STATES &&
                STATES.map((state, index) => {
                  return (
                    <ComboboxOption
                      value={state.name}
                      className="usa_state"
                      key={index}
                    />
                  );
                })}
            </ComboboxList>
          </ComboboxPopover>
        </Combobox>
      </div>

      <div className="form-group">
        <label htmlFor="home_office_code">Congressional Office:</label>{" "}
        <select
          value={order.home_office_code ? order.home_office_code : "select"}
          id="home_office_code"
          onChange={handleInputChange}
          name="home_office_code"
          required
        >
          <option value="select" key="blank" hidden disabled>
            Select
          </option>

          {STATES &&
            order.usa_state &&
            STATES.filter((state) => state.name === order.usa_state)[0][
              "districts"
            ].map((district, index) => {
              return (
                <option value={district} key={index}>
                  {district}
                </option>
              );
            })}
        </select>
      </div>

      {mode === "edit" ? (
        <>
          <div className="form-group">
            <label htmlFor="status_description">Status:</label>{" "}
            <select
              value={
                status.status_description ? status.status_description : "select"
              }
              id="status_description"
              onChange={handleStatusChange}
              name="status_description"
            >
              <option value="select" key="blank" hidden disabled>
                Select
              </option>
              {STATUSES &&
                STATUSES.map((element, index) => {
                  /* Old Filter by DEMO Organization Code was here
                   to be rewired to ACTUAL User Profile DB info  */
                  return (
                    <option value={element.description} key={index}>
                      #{element.sequence_num} {element.description}
                    </option>
                  );
                })}
            </select>
          </div>

          <div className="form-group">
            <label>QR Code</label>
            {order.uuid}
            <img
              src={baseURL + "/api/qrcode/" + order.uuid}
              alt="QR Code"
              align="right"
            />
          </div>
        </>
      ) : null}

      {mode === "edit" && (
        <button className="btn badge-danger mr-2" onClick={deleteOrderFunc}>
          Delete
        </button>
      )}
      <button
        disabled={
          !order.order_number ||
          !order.usa_state ||
          !order.home_office_code ||
          !districtMatchCheck
        }
        onClick={saveOrderFunc}
        className="btn btn-success"
      >
        {mode === "edit" ? "Update" : "Submit"}
      </button>

      <div>
        {!districtMatchCheck ? (
          <p>US State and Congressional Office must correspond</p>
        ) : (
          <p>&nbsp;</p>
        )}
      </div>
    </div>
  );
};

export default OrderForm;
