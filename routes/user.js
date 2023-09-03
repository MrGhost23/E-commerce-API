const express = require("express");
const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/user");
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const router = express.Router();

router
  .get("/", authenticateUser, authorizePermissions("admin"), getAllUsers)
  .get("/showMe", authenticateUser, showCurrentUser)
  .patch("/updateUser", authenticateUser, updateUser)
  .patch("/updateUserPassword", authenticateUser, updateUserPassword)
  .get("/:id", authenticateUser, getSingleUser);

module.exports = router;
