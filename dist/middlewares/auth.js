import { User } from "../models/user.js";
import ErrorHandeler from "../utils/utility-class.js";
import { TryCatch } from "./error.js";
export const adminOnly = TryCatch(async (req, res, next) => {
    const { id } = req.query;
    if (!id) {
        return next(new ErrorHandeler("You need to be loged in!", 401));
    }
    const user = await User.findById(id);
    if (!user) {
        return next(new ErrorHandeler("Accoutn does not exists!", 401));
    }
    if (user.role != "admin") {
        return next(new ErrorHandeler("Unauthorized!", 401));
    }
    next();
});
