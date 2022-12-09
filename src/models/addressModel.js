const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId

const addressSchema = new mongoose.Schema(
    {
        customerId: {
            type: ObjectId, required: true, ref: 'customer'
        },

        address: {
            type: String,
            required: true,
        },

        landmark: {
            type: String,
            required: true,
        },

        city: {
            type: String,
            required: true,
        },

        state: {
            type: String,
            required: true,
        },

        country: {
            type: String,
            required: true,
        },

        zipCode: {
            type: String,
            required: true,
        },

        isDeleted: {
            type: Boolean,
            default: false
        }

    }, { timestamps: true })
module.exports = mongoose.model("address", addressSchema);