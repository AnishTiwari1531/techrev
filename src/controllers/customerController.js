const customerModel = require("../models/customerModel");
const addressModel = require("../models/addressModel");
const { uploadFile } = require("../awsS3/aws");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { isFname, isLname, isUname, isEmail, isPhone, isDob, isGender, isPassword, trimAndUpperCase, removeSpaces, isValidObjectId, isValidAddress, isAddressLine, isZipCode, isImageFile } = require("../validators/validate");


//=============================Insert Api============================================================================================================

const insertCustomer = async function (req, res) {
    try {
        let { firstName, lastName, userName, email, phone, dob, gender, password, confirmPassword, address, landmark, city, state, country, zipCode } = req.body;
        let files = req.files;

        if (!Object.keys(req.body).length)
            return res.status(400).send({ status: false, message: "Bad Request, Please enter the details in the request body" });

        const error = {};

        if (isFname(firstName) !== true) error.FnameError = isFname(firstName);
        if (isLname(lastName) !== true) error.lnameError = isLname(lastName);
        if (isUname(userName) !== true) error.UnameError = isUname(userName);
        if (isEmail(email) !== true) error.emailError = isEmail(email);
        if (isPhone(phone) !== true) error.phoneError = isPhone(phone);
        if (isDob(dob) !== true) error.dobError = isDob(dob);
        if (isGender(gender) !== true) error.genderError = isGender(gender);
        if (isPassword(password) !== true) error.passwordError = isPassword(password);
        if (isPassword(confirmPassword) !== true) error.confirmPasswordError = isPassword(confirmPassword);

        if (isImageFile(files) !== true) error.filesError = isImageFile(files);

        if (isAddressLine(address) !== true) error.addressError = isAddressLine(address);
        if (isAddressLine(landmark) !== true) error.landmarkError = isAddressLine(landmark);
        if (isValidAddress(city) !== true) error.cityError = isValidAddress(city);
        if (isValidAddress(state) !== true) error.stateError = isValidAddress(state);
        if (isValidAddress(country) !== true) error.countryError = isValidAddress(country);
        if (isZipCode(zipCode) !== true) error.zipCodeError = isZipCode(zipCode);


        if (Object.keys(error).length > 0) return res.status(400).send({ status: false, message: { error } })
        firstName = trimAndUpperCase(firstName);
        lastName = trimAndUpperCase(lastName);
        email = removeSpaces(email);
        phone = removeSpaces(phone);

        let image = await uploadFile(files[0])

        if (password !== confirmPassword) {
            return res.status(400).send({ status: false, message: "Password do not match" })
        }
        const hash = bcrypt.hashSync(password, 10); // para1:password, para2:saltRound

        //======DB calls For Uniqueness===//
        let checkUserName = await customerModel.findOne({ userName: userName });
        if (checkUserName) return res.status(400).send({ status: false, message: " This userName is already used." });

        let checkEmail = await customerModel.findOne({ email: email });
        if (checkEmail) return res.status(400).send({ status: false, message: " This Email is already used." });

        const lastTenNum = phone.slice(phone.length - 10);
        let CheckPhone = await customerModel.findOne({ phone: new RegExp(lastTenNum + '$') });
        if (CheckPhone) return res.status(400).send({ status: false, message: "phone Number should be Unique " });

        //============creation==============//
        let customerRegister = { firstName, lastName, userName, email, phone, dob, gender, password: hash, confirmPassword: hash, image }
        let customerData = await customerModel.create(customerRegister);

        let customerId = customerData._id
        const addressData = await addressModel.create({ customerId, address, landmark, city, state, country, zipCode })
        console.log(customerData, addressData)
        return res.status(201).send({ status: true, message: "User created successfully", data: { customerData, addressData } });       //"User created successfully"
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message });
    }
};

//=======================================Login Api==========================================================================================================

const customerLogin = async (req, res) => {
    try {
        const body = req.body;
        let { userName, firstName, lastName, password, confirmPassword } = body;

        if (!Object.keys(req.body).length)
            return res.status(400).send({ status: false, message: "Bad Request, Please enter the details in the request body" });

        const error = {};
        if (isFname(firstName) !== true) error.FnameError = isFname(firstName);
        if (isLname(lastName) !== true) error.lnameError = isLname(lastName);
        if (isUname(userName) !== true) error.UnameError = isUname(userName);
        if (isPassword(password) !== true) error.passwordError = isPassword(password);
        if (isPassword(confirmPassword) !== true) error.confirmPasswordError = isPassword(confirmPassword);

        if (Object.keys(error).length > 0) return res.status(400).send({ status: false, message: { error } });
        firstName = trimAndUpperCase(firstName);
        lastName = trimAndUpperCase(lastName);

        let customer = await customerModel.findOne({ userName });
        console.log(userName)
        if (!customer) return res.status(400).send({ status: false, message: "Invalid userName." });
        if (customer.firstName !== firstName) return res.status(400).send({ status: false, message: "Invalid firstName !" });
        if (customer.lastName !== lastName) return res.status(400).send({ status: false, message: "Invalid lastName !" });
        if (password !== confirmPassword) return res.status(400).send({ status: false, message: "Password does not match" });
        if (customer) {
            const Passwordmatch = bcrypt.compareSync(body.password, customer.password);
            if (Passwordmatch) {
                const generatedToken = jwt.sign({
                    customerId: customer._id,
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + 3600 * 24 * 15
                }, 'TechRevTaskPassword')
                res.setHeader('Authorization', 'Bearer ' + generatedToken);

                return res.status(200).send({
                    "status": true, message: "customer login successfull",
                    data: { customerId: customer._id, token: generatedToken, }
                });
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: false, message: error.message });
    }
};

//========================GetById Api=========================================================================================================================

const selectCustomerById = async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).send({ status: false, message: "Request Body is empty" });
        }
        let customerId = req.body.customerId;
        if (customerId === "") return res.status(400).send({ status: false, message: "Please provide data" });
        if (!isValidObjectId(customerId)) {
            return res.status(400).send({ status: false, message: "Please Provide a valid customerId" });
        }

        let customer = await addressModel.findOne({ customerId }).populate({
            path: 'customerId',
            select: { 'firstName': 1, 'lastName': 1, 'userName': 1, 'email': 1, 'phone': 1, 'dob': 1, 'gen': 1, '_id': 0 },
        });


        if (!customer || customer.isDeleted == true) {
            return res.status(404).send({ status: false, msg: "No customer Found" });
        }
        return res.status(200).send({ status: true, message: 'customer found successfully', data: customer });
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}

//==========================Get Api=======================================================================================================================

const selectCustomers = async (req, res) => {
    try {
        let filterData = { isDeleted: false };
        let data = req.query;
        if (Object.keys(data).length === 0) return res.status(400).send({ status: false, message: "Nothing to search" });

        for (let el in data) {
            if (data[el] === "") return res.status(400).send({ status: false, message: "Field cannot be empty" });
            filterData[el] = data[el];
        }

        let customer = await customerModel.find(filterData).select({ password: 0, confirmPassword: 0, __v: 0, _id: 0, isDeleted: 0, });
        if (customer.length == 0) return res.status(404).send({ status: false, message: "No match found" });
        return res.status(200).send({ status: true, message: 'customer found successfully', data: customer });
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}

//===============================Update Api=================================================================================================================

const updateCustomer = async (req, res) => {
    try {
        let filterData = { isDeleted: false };
        let { firstName, lastName, userName, email, phone, dob, gender, password, confirmPassword, address, landmark, city, state, country, zipCode } = req.body;
        let files = req.files;

        if (Object.keys(req.body).length === 0 || !files) return res.status(400).send({ status: false, message: "Nothing to update" });
        //console.log(req.body,files.length);

        const error = {};
        if (firstName && isFname(firstName) !== true) error.FnameError = isFname(firstName);
        if (lastName && isLname(lastName) !== true) error.lnameError = isLname(lastName);
        if (userName && isUname(userName) !== true) error.UnameError = isUname(userName);
        if (email && isEmail(email) !== true) error.emailError = isEmail(email);
        if (phone && isPhone(phone) !== true) error.phoneError = isPhone(phone);
        if (dob && isDob(dob) !== true) error.dobError = isDob(dob);
        if (gender && isGender(gender) !== true) error.genderError = isGender(gender);
        if (password && isPassword(password) !== true) error.passwordError = isPassword(password);
        if (confirmPassword && isPassword(confirmPassword) !== true) error.confirmPasswordError = isPassword(confirmPassword);

        let imageLink;
        if (files.length) {
            if (isImageFile(files) !== true) error.filesError = isImageFile(files);
            else imageLink = await uploadFile(files[0])
        }

        if (address && isAddressLine(address) !== true) error.addressError = isAddressLine(address);
        if (landmark && isAddressLine(landmark) !== true) error.landmarkError = isAddressLine(landmark);
        if (city && isValidAddress(city) !== true) error.cityError = isValidAddress(city);
        if (state && isValidAddress(state) !== true) error.stateError = isValidAddress(state);
        if (country && isValidAddress(country) !== true) error.countryError = isValidAddress(country);
        if (zipCode && isZipCode(zipCode) !== true) error.zipCodeError = isZipCode(zipCode);


        if (Object.keys(error).length > 0) return res.status(400).send({ status: false, message: { error } });

        if (firstName) firstName = trimAndUpperCase(firstName);
        if (lastName) lastName = trimAndUpperCase(lastName);
        if (email) email = removeSpaces(email);
        if (phone) phone = removeSpaces(phone);

        if (password || confirmPassword) {
            if (password !== confirmPassword) {
                return res.status(400).send({ status: false, message: "Password do not match" });
            }
            else {
                req.body.password = bcrypt.hashSync(confirmPassword, 10);
                req.body.confirmPassword = req.body.password;
            }
        }
        req.body.image = imageLink;

        for (let el in req.body) {
            if (req.body[el] === "") return res.status(400).send({ status: false, message: "Field cannot be empty" });
            filterData[el] = req.body[el];
        }
        let customerId = req.id;

        let customer = await customerModel.findOneAndUpdate({ _id: customerId }, { $set: filterData }, { new: true });

        let addressLine = await addressModel.findOneAndUpdate({ customerId }, { $set: filterData }, { new: true });
        return res.status(200).send({ status: true, message: 'customer found successfully', data: { customer, addressLine } });

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}

//=========================Delete Api========================================================================================================================

const deleteCustomer = async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).send({ status: false, message: "Request Body is empty" });
        }
        let customerId = req.body.customerId;
        if (!isValidObjectId(customerId)) {
            return res.status(400).send({ status: false, message: "Please Provide a valid customerId" });
        }

        let customer = await addressModel.findOne({ customerId });
        if (!customer || customer.isDeleted == true) {
            return res.status(404).send({ status: false, msg: "No customer Found" });
        }
        await addressModel.findOneAndUpdate({ customerId }, { $set: { isDeleted: true } }, { new: true });
        await customerModel.findOneAndUpdate({ _id: customerId }, { $set: { isDeleted: true } }, { new: true });
        return res.status(204).send({ status: true, message: "Customer Deleted Succesfully" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}


//=================================================================================================================================================

module.exports = { insertCustomer, customerLogin, selectCustomerById, selectCustomers, updateCustomer, deleteCustomer };

//=================================================================================================================================================