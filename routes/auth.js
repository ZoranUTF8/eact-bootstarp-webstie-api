const express = require("express");
const router = express.Router();
const { loginUser, registerUser, deleteUser } = require("../controllers/auth");

router.post("/login", loginUser);
router.post("/register", registerUser);
router.delete("/:id", deleteUser);

module.exports = router;
