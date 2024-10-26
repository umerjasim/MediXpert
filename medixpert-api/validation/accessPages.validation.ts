import { msg } from "../helpers/constants";
import { BODY_ARRAY, BODY_STRING } from "../helpers/validator";

function access() {
    return [
      BODY_STRING('userId', msg.userNotExist),
      BODY_STRING('name', msg.userNotExist),
      BODY_ARRAY('accessPages', msg.userNotExist),
      BODY_STRING('roleId', msg.userNotExist),
      BODY_STRING('roleName', msg.userNotExist),
    ];
}
  
export {
    access,
};