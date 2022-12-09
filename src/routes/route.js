const express = require('express');
const router = express.Router();
const { authentication, authorisation } = require("../Middleware/auth");
const { insertCustomer, customerLogin, selectCustomerById, selectCustomers, updateCustomer, deleteCustomer } = require("../controllers/customerController");

//=================================================================================================================================================

router.post("/register", insertCustomer);
router.post("/login", customerLogin);
router.post("/selectCustomerById", selectCustomerById);
router.get("/selectCustomers", selectCustomers);
router.post("/deleteCustomer", authentication, authorisation, deleteCustomer);
router.post("/updateCustomer", authentication, authorisation, updateCustomer);


// if api is invalid OR wrong URL
router.all("/**", function (req, res) {
    res.status(404).send({
        status: false,
        message: "The api you request is not available"
    });
})

//=================================================================================================================================================

module.exports = router;

//=================================================================================================================================================
