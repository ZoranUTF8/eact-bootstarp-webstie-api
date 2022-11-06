const mongoose = require("mongoose");

const EmployeeSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please provide your first name."],
    },
    lastName: {
      type: String,
      required: [true, "Please provide your first name."],
      maxLength: 50,
    },
    age: {
      type: Number,
      required: [true, "Please provide your age."],
      min: 18,
      max: 100,
    },
    salary: {
      type: Number,
      required: [true, "Please provide your salary."],
    },
    address: {
      type: String,
      required: [true, "Please provide your address."],
    },
    position: {
      type: String,
      required: [true, "Please provide your position."],
    },
    department: {
      type: String,
      required: [true, "Please provide your department"],
    },
    education: {
      type: String,
      required: [true, "Please provide your education."],
    },
    status: {
      type: String,
      required: [true, "Please provide your job status."],
      enum: ["employed", "not-employed", "suspended", "sick-leave"],
      default: "employed",
    },
    addedById: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide the user who added the employee."],
    },
    addedByName: {
      type: String,
      required: [
        true,
        "Please provide the name of the user who added the employee.",
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", EmployeeSchema);
