import { Router } from "express";
import { validte } from "../middleware/validator.middleware.js";
import {
  createProjectValidator,
  addMembertoProjectvalidator,
} from "../validators/index.js";
import {
  getProjects,
  getProjectsById,
  creatProejcts,
  updateProjects,
  deletProjects,
  addMemebersToProjects,
  getProjectMembers,
  updateMemberRole,
  deletMember,
} from "../controllers/project.controllers.js";
import {
  validateprojectPermission,
  verifyJwt,
} from "../middleware/auth.middleware.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
import { UserCircleIcon } from "@heroicons/react/16/solid";

const router = Router();
router.use(verifyJwt); //after this line all roter will have verifyjwt
router
  .route("/")
  .get(getProjects)
  .post(createProjectValidator(), validte, creatProejcts);

router
  .route("/:projectId")
  .get(validateprojectPermission(AvailableUserRole), getProjectsById) // we wanted to verify that you actuly get the project or not  validateprojectPermission()is the mathod that is benig runned after passing AvailableUserRole in validateprojectPermission evrery one is allowded to do
  .put(
    validateprojectPermission([UserRolesEnum.ADMIN]),
    // after this admin will bw able to do this changes only
    //put request is used for updating an exixting resorce completely on the server
    createProjectValidator(),
    validte,
    updateProjects,
  )
  .delete(validateprojectPermission([UserRolesEnum.ADMIN]), deletProjects);
//while .delete mthod remember 1. how do i delete this (deletProjects)2.who can delete the  project (validateprojectPermission)

router //how to udate the member and delete
  .route("/:projectId/members/") //if you put up a collen than it will taken as a params
  .get(getProjectMembers) // to get the projectmember
  .post(
    validateprojectPermission([UserRolesEnum.ADMIN]),
    addMembertoProjectvalidator(),
    validator(),
    addMemebersToProjects,
  ); // add the projectmember

router
  .route("/:projectId/members/:userId")
  .put(validateprojectPermission([UserRolesEnum.ADMIN]), updateMemberRole)
  .delete(validateprojectPermission([UserRolesEnum.ADMIN]), deletMember); //delete the member from the project

export default router;
