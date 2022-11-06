const express = require("express");
const router = express.Router();
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  showStats,
} = require("../controllers/employees");

router.route("/").get(getEmployees).post(createEmployee);
router.route("/stats").get(showStats);
router
  .route("/:id")
  .get(getEmployee)
  .delete(deleteEmployee)
  .patch(updateEmployee);

module.exports = router;
