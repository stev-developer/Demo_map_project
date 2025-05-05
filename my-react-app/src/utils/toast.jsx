import { toast } from "react-toastify";

export const showToast = (type, message) => {
  toast[type](message); // types: success, error, info, warn
};
