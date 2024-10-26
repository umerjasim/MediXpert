import { msg } from "../helpers/constants";
import { BODY_ARRAY, BODY_STRING } from "../helpers/validator";

function addTax() {
    return [
      BODY_ARRAY('tax-branch', msg.missingRequiredValues),
      BODY_STRING('tax-name', msg.missingRequiredValues),
      BODY_STRING('tax-value', msg.missingRequiredValues),
      BODY_STRING('tax-type', msg.missingRequiredValues),
    ];
}
  
export {
    addTax,
};