const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },

        lastName: {
            type: String,
            required: true,
        },

        userName: {
            type: String,
            required: true,
            unique: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
        },

        phone: {
            type: String,
            required: true,
            unique: true,
        },

        dob: {
            type: String,
            required: true,
        },

        gender: {
            type: String,
            enum: ["Male", "Female", "Others"],
            required: true
        },

        password: {
            type: String,
            required: true,
        },

        confirmPassword: {
            type: String,
            required: true,
        },

        image: {
            type: String,
            // required: true,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        }
    }, { timestamps: true });

module.exports = mongoose.model("customer", customerSchema);