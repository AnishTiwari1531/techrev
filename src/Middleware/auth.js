const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const customerModel = require('../models/customerModel.js');

//=================================================================================================================================================

const authentication = async function (req, res, next) {
  try {
    let token = req.headers["authorization"];
    if (!token) {
      return res.status(401).send({ status: false, message: "Missing authentication token in request" });
    }
    token = token.substring(7);
    const decoded = jwt.decode(token);
    if (!decoded) {
      return res.status(401).send({ status: false, message: "Invalid authentication token in request headers." });
    }
    if (Date.now() > (decoded.exp) * 1000) {
      return res.status(440).send({ status: false, message: "Session expired! Please login again." }) //​​440 Login Timeout
    }
    jwt.verify(token, "TechRevTaskPassword", function (err, decoded) {
      if (err) {
        return res.status(400).send({ status: false, message: "token invalid" });
      }
      else {
        req.customerId = decoded.customerId;
        req.token = decoded;
        return next();
      }
    });

  }
  catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//------------------------------------Authorisation----------------------------------------------------------------//
const authorisation = async function (req, res, next) {     //userId from params
  try {
    const customerId = req.customerId;
    if (!customerId) return res.status(400).send({ status: false, message: "enter customer id l" }); // handled by postman as well
    if (!mongoose.Types.ObjectId.isValid(customerId)) return res.status(400).send({ status: false, message: "enter a valid customer id in url path" });

    const customer = await customerModel.findById(customerId);
    if (!customer) return res.status(404).send({ status: false, message: "customer does not exist" });  //new changes added

    const loggedInCustomerId = req.token.customerId;
    req.id = loggedInCustomerId;
    if (loggedInCustomerId !== customerId) return res.status(403).send({ status: false, message: `customer ${loggedInCustomerId} is not authorised to make changes in ${customerId}` });
    next();

  } catch (err) {
    console.log(err);
    return res.status(500).send({ status: false, message: err.message });
  }
}

//=================================================================================================================================================

module.exports = { authentication, authorisation };

//=================================================================================================================================================