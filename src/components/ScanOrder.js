import React, { useState, useEffect } from "react";
import OrderDataService from "../services/OrderService";
import { STATUSES } from "./Statuses.js";

const ScanOrder = (props) => {
  const initialOrderState = {
    uuid: null,
    title: "",
    description: "",
    published: false,
    order_number: "",
    home_office_code: "",
    usa_state: "",

    status: {
      description: "",
      id: "",
      sequence_num: "",
      status_federal_office_code: "",
      // tags: "", // not currently received from Backend
    },
  };

  const initialMessageState = {
    success: "",
  };

  const [order, setOrder] = useState(initialOrderState);
  const [message, setMessage] = useState(initialMessageState);

  const getOrder = (id) => {
    OrderDataService.get(id)
      .then((response) => {
        setOrder(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(() => {
    getOrder(props.match.params.id);
  }, [props.match.params.id]);

  const dynamicSort = (property) => {
    let sortOrder = 1;

    if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }

    return function (a, b) {
      let result =
        a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
      return result * sortOrder;
    };
  };

  let nextDesc = "";
  let nextId = null;
  let nextSeq = null;
  let nextStatusFedOfficeCode = "";
  // let nextTags = ""; // not currently received from Backend

  if (STATUSES && order) {
    STATUSES.sort(dynamicSort("sequence_num"));

    const currentSeq = order.status.sequence_num;

    for (let i = 0; i < STATUSES.length - 1; i++) {
      if (STATUSES[i].sequence_num > currentSeq) {
        nextDesc = STATUSES[i].description;
        nextId = STATUSES[i].id;
        nextSeq = STATUSES[i].sequence_num;
        nextStatusFedOfficeCode = STATUSES[i].status_federal_office_code;
        // nextTags = STATUSES[i].tags; // not currently received from Backend
        break;
      }
      if (i === STATUSES.length - 2) {
        nextDesc = "FINAL";
      }
    }
  }

  const handleUpdate = () => {
    setOrder({
      ...order,
      status: {
        description: nextDesc,
        id: nextId,
        sequence_num: nextSeq,
        status_federal_office_code: nextStatusFedOfficeCode,
      },
    });
  };

  const updateOrder = () => {
    OrderDataService.update(order.uuid, order)
      .then((response) => {
        console.log("Resp: ", response);
        setMessage({
          ...message,
          success: "The order was updated successfully!",
        });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <div>
      {order ? (
        <>
          <div className="form-group">
            <label htmlFor="order_number">
              Order Number: <strong>{order.order_number}</strong>
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="usa_state">
              US State: <strong>{order.usa_state}</strong>
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="home_office_code">
              Congressional Office: <strong>{order.home_office_code}</strong>
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="current_status">
              Current Status:{" "}
              {order.status.description ? (
                <strong>
                  #{order.status.sequence_num} - {order.status.description}
                </strong>
              ) : (
                <strong>Missing status...</strong>
              )}
            </label>
          </div>
          {nextDesc === "FINAL" ? (
            <div className="form-group">
              <label htmlFor="next_status">
                <strong>Order Complete</strong>
              </label>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="next_status">
                  Next Status:{" "}
                  {STATUSES && order ? (
                    <strong>
                      #{nextSeq} - {nextDesc}
                    </strong>
                  ) : (
                    <strong>Missing data needed to generate next Status</strong>
                  )}
                </label>
              </div>
              <button onClick={handleUpdate} className="btn btn-success">
                {"Update Status"}
              </button>{" "}
              <button onClick={updateOrder} className="btn btn-success">
                {"Save"}
              </button>
            </>
          )}
          <p>{message.success}</p>
        </>
      ) : (
        <div>
          <br />
          <p>Please click on an order...</p>
        </div>
      )}
    </div>
  );
};

export default ScanOrder;