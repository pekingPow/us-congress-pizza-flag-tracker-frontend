import React, { useState, useEffect } from "react";
import OrderDataService from "../services/OrderService";
import { Link } from "react-router-dom";
import { useSortableData } from "./Sort/SortHook";
import { TableHeader } from "./TableHeader";

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchTitle, setSearchTitle] = useState("");
  const [popUpBox, setPopUpbox] = useState("none");
  const [errorMessage, setErrorMessage] = useState("");
  const [sortedField, setSortedField] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [sortType, setSortType] = useState("numeric");

  const sortOptions = { sortedField, sortDir, sortType };
  const sortedOrders = useSortableData(orders, sortOptions);

  const loginError = "You must be logged in to view this page";

  useEffect(() => {
    retrieveOrders();
  }, []);

  const onChangeSearchTitle = (e) => {
    const searchTitle = e.target.value;
    console.log(e);
    setSearchTitle(searchTitle);
  };

  const retrieveOrders = () => {
    OrderDataService.getAll()
      .then((response) => {
        setOrders(response.data.orders);
      })
      .catch((e) => {
        console.log(e);
        if (e.response?.status === 401) {
          setErrorMessage(loginError);
        } else {
          setPopUpbox("block");
          setErrorMessage(
            e.message +
              "." +
              "Check with admin if server is down or try logging out and logging in."
          );
        }
      });
  };

  const refreshList = () => {
    retrieveOrders();
    setCurrentOrder(null);
    setCurrentIndex(-1);
  };

  const setActiveOrder = (order, index) => {
    setCurrentOrder(order);
    setCurrentIndex(index);
  };

  const removeAllOrders = () => {
    OrderDataService.removeAll()
      .then((response) => {
        refreshList();
      })
      .catch((e) => {
        console.log(e);
        setPopUpbox("block");
        setErrorMessage(e.message);
      });
  };

  const findByOrderNumber = () => {
    OrderDataService.findByOrderNumber(searchTitle)
      .then((response) => {
        if ("error" in response.data) {
          setErrorMessage(response.data.error);
        } else {
          console.log("found", response.data);
          setOrders(response.data.orders);
        }
      })
      .catch((e) => {
        console.log(e);
        setPopUpbox("block");
        setErrorMessage(e.message);
      });
  };

  const clearSearch = () => {
    refreshList();
    setSearchTitle("");
    setErrorMessage("");
  };

  const formatDate = (dateString) => {
    return Intl.DateTimeFormat("en-US").format(Date.parse(dateString));
  };

  let ordersToDisplay = [];
  sortedOrders ? (ordersToDisplay = sortedOrders) : (ordersToDisplay = orders);

  const orderTbody = (
    <tbody className="flag-group">
      {ordersToDisplay.length &&
        ordersToDisplay.map((order, index) => (
          <tr
            className={
              "flag-group-item " + (index === currentIndex ? "active" : "")
            }
            onClick={() => setActiveOrder(order, index)}
            key={index}
          >
            <td>{order.order_number}</td>
            <td>{order.usa_state}</td>
            <td>{order.home_office_code}</td>
            <td>{order.status.description}</td>
            <td>{formatDate(order.created_at)}</td>
            <td>{formatDate(order.updated_at)}</td>
          </tr>
        ))}
    </tbody>
  );

  const closePopUpBox = () => {
    setPopUpbox("none");
  };

  if (errorMessage === loginError) {
    return errorMessage;
  } else
    return (
      <>
        <div className="list row">
          <div className="col-md-8">
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search by order number"
                value={searchTitle}
                onChange={onChangeSearchTitle}
              />
              <div className="input-group-append">
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={findByOrderNumber}
                >
                  Search
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-8">
            <h4>Orders List</h4>

            <table className="table">
              <TableHeader
                sortedField={sortedField}
                sortDir={sortDir}
                setSortedField={setSortedField}
                setSortType={setSortType}
                setSortDir={setSortDir}
              />
              {orderTbody}
            </table>
            {errorMessage || searchTitle ? (
              <button
                className="m-3 btn btn-sm btn-danger"
                onClick={clearSearch}
              >
                Clear search
              </button>
            ) : (
              <button
                className="m-3 btn btn-sm btn-danger"
                onClick={removeAllOrders}
              >
                Remove All
              </button>
            )}
          </div>
          <div className="col-md-4">
            {currentOrder ? (
              <div>
                <h4>Order</h4>
                <div>
                  <label>
                    <strong>Order Number:</strong>
                  </label>{" "}
                  {currentOrder.order_number}
                </div>
                <div>
                  <label>
                    <strong>Congressional Office:</strong>
                  </label>{" "}
                  {currentOrder.home_office_code}
                </div>

                <div>
                  <label>
                    <strong>Status:</strong>
                  </label>{" "}
                  {currentOrder.published ? "Published" : "Pending"}
                </div>

                <Link
                  to={"/orders/" + currentOrder.uuid}
                  className="badge badge-warning"
                >
                  Edit
                </Link>

                {` `}
                <Link
                  to={"/scan/" + currentOrder.uuid}
                  className="badge badge-warning"
                >
                  Scan
                </Link>
              </div>
            ) : (
              <div>
                <br />
                <p>Please click on an order...</p>
              </div>
            )}
          </div>
        </div>

        <div className="pop-container" style={{ display: popUpBox }}>
          <div className="pop-up" onClick={closePopUpBox}>
            <h3>{errorMessage}</h3>
          </div>
        </div>
      </>
    );
};

export default OrdersList;
