const mongoose = require("mongoose")

//--------------------------Validator------------------------------------------------------
// const isValid = function (value) {
//     if (typeof value === "undefined" || value === null) return false;
//     if (typeof value === "string" && value.trim().length === 0) return false;
//     return true;
// };
// const isValidRequestBody = function (requestBody) {
//     return Object.keys(requestBody).length > 0;
// }
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

//validate fname & lname
function isFname(x) {
    if (!x) return "mandatory fname is missing";
    if (typeof x !== "string") return "Data type Error : fname must be a string type";
    if (x.length > 64) return "fname exceeded maximum charaters limit which is 64";
    const regEx = /^[a-zA-Z]+\s?[a-zA-Z]+\s?[a-zA-Z]{1,20}$/;
    if (!regEx.test(x)) return "invalid format of fname"
    return true;
}


function isLname(x) {
    if (!x) return "mandatory lname is missing";
    if (typeof x !== "string") return "Data type Error : fname must be a string type";
    if (x.length > 64) return "lname exceeded maximum charaters limit which is 64";
    const regEx = /^[a-zA-Z]+\s?[a-zA-Z]+\s?[a-zA-Z]{1,20}$/;
    if (!regEx.test(x)) return "invalid format of lname"
    return true;
}

function isUname(x) {
    if (!x) return "mandatory userName is missing";
    if (typeof x !== "string") return "Data type Error : userName must be a string type";
    if (x.length > 64) return "userName exceeded maximum charaters limit which is 64";
    const regEx = /^[a-zA-Z]+\s?[a-zA-Z]+\s?[a-zA-Z]{1,20}$/;
    if (!regEx.test(x)) return "invalid format of userName"
    return true;
}

//email
function isEmail(x) {
    if (!x) return "mandatory email is missing";
    if (typeof x !== "string") return "Data type Error : email must be a string type";
    const regEx =  /^[a-zA-Z]{1}[A-Za-z0-9._]{1,100}[@]{1}[a-z]{2,15}[.]{1}[a-z]{2,10}$/;
    if (!regEx.test(x)) return "invalid email format";
    x = x.split("@");
    if (x[0].length > 64) return "email exceeded the maximum characters in local part";
    if (x[1].length > 255) return "email exceeded the maximum characters in domain part";
    return true;
}


//profileImage : pending

//phone
function isPhone(x) {
    if (!x) return "mandatory phone no. is missing";
    if (typeof x !== "string") return "Data type Error : phone no. must be a string type";
    const regEx = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
    if (!regEx.test(x)) return "invalid phone number";
    return true;
}

//dob
function isDob(x) {
    if (!x) return "mandatory dob is missing";
    if (typeof x !== "string") return "Data type Error : dob must be a string type";
    const regEx = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
    if (!regEx.test(x)) return "invalid dob format";
    return true;
}

//gender 
function isGender(x) {
    if (!x) return "mandatory gender is missing";
    if (typeof x !== "string") return "Data type Error : gender must be a string type";
    const gen = ["Male", "Female", "Others"];
    if (!gen.includes(x)) return `${x} is not a valid gender, valid gender : ${gen}`;
    return true;
}

//password
function isPassword(x) {
    if (!x) return "mandatory password is missing";
    if (typeof x !== "string") return "Data type Error : password must be a string type";
    if (x.length<8 || x.length>15) {
        return res.status(400).send({status: false,message:"Password should be 8 to 15 characters"});
    }
    //const regEx = /^(?=.[a-z])(?=.[A-Z])(?=.[0-9])(?=.[!@#$%^&])[\w!@#$%^&]{8,15}$/;
    //if (!regEx.test(x)) return "invalid password format : It must contains atleast one lowercase, uppercase, digit & special characters among [!@#$%^&*]";
    return true;
}


//address
function isAddressLine(x) {
    if (!x) return "mandatory address Line 1 is missing";
    if (typeof x !== "string") return "Data type Error : address Line 1 must be a string type";
    // const regEx = /^\s*[a-zA-Z0-9]+([\-\.\,]?\s*[\w\s]+)\s$/;
    const regEx = /^[a-zA-Z0-9]/;;
    if (!regEx.test(x)) return "invalid address Line 1 format";
    return true;
}


function isValidAddress(x) {
    if (!x) return "mandatory address field is missing";
    if (typeof x !== "string") return "Data type Error : all address fields must be a string type";
    // const regEx = /^\s*[a-zA-Z0-9]+([\-\.\,]?\s*[\w\s]+)\s$/;
    const regEx = /^[a-zA-Z0-9]/;;
    if (!regEx.test(x)) return "invalid format";
    return true;
};

function isZipCode(x) {
    if (!x) return "mandatory pincode is missing";
    if (typeof x !== "number" && typeof x !== "string") return "Data type Error : pincode must be a number type";
    const regEx = /^[123456789][0-9]{5}$/;
    if (!regEx.test(x)) return "invalid pincode format";
    return true;
}

//romoveSpaces
function removeSpaces(x) {
    // return x.split(" ").filter((y)=> y).join(" ");
    return x.split(" ").join(" ");
}


//trimAndUpperCase
function trimAndUpperCase(x) {
    return x.split(" ").filter((y) => y).map((z) => z = z.charAt(0).toUpperCase() + z.slice(1)).join(" ");
}
function isBoolean(x) {
    // if(x===undefined || x===null || x==="") return "mandatory FreeisFreeShipping is missing";
    if (x != 'true' && x != 'false' && typeof x !== "boolean") return "invalid isFreeShipping value, it must be a Boolean";
    return true;
}


function isImageFile(x) {
    if (x === undefined || x === null || x.length === 0) return "mandatory Image is missing"; //rectified after test
    const name = x[0].originalname;
    const regEx = /\.(apng|avif|gif|jpg|jpeg|jfif|pjpeg|pjp|png|svg|webp)$/;    //source:https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
    const checkImage = name.toLowerCase().match(regEx);
    if (checkImage === null) return "provided image is not an image file";
    return true;
}

module.exports = { isImageFile, isFname, isLname, isUname, isEmail, isPhone, isDob, isGender, isPassword, trimAndUpperCase, removeSpaces, isValidObjectId,isValidAddress, isAddressLine, isZipCode,isImageFile }