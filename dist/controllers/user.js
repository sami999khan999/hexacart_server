import { User } from "../models/user.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandeler from "../utils/utility-class.js";
export const newUser = TryCatch(async (req, res, next) => {
    const { name, email, photo, gender, _id, dob } = req.body;
    let user = await User.findById(_id);
    if (!name || !email || !photo || !gender || !_id || !dob)
        return next(new ErrorHandeler("All fields must be fieled!", 400));
    if (user) {
        return res.status(200).json({
            success: true,
            message: `Wellcome Back ${name}`,
        });
    }
    user = await User.create({
        name,
        email,
        photo,
        gender,
        _id,
        dob: new Date(dob),
    });
    return res.status(200).json({
        success: true,
        message: `Wellcome, ${user.name}`,
    });
});
export const getAllUsers = TryCatch(async (req, res, next) => {
    const users = await User.find({});
    const length = users.length;
    return res.status(200).json({
        success: true,
        users,
        length,
    });
});
export const getUser = TryCatch(async (req, res, next) => {
    const _id = req.params.id;
    const user = await User.findById({ _id });
    if (!user) {
        return next(new ErrorHandeler("Invalid ID", 400));
    }
    return res.status(200).json({
        success: true,
        user,
    });
});
export const deleatUser = TryCatch(async (req, res, next) => {
    const _id = req.params.id;
    const user = await User.findById({ _id });
    if (!user) {
        return next(new ErrorHandeler("Invalid ID", 400));
    }
    await user.deleteOne();
    return res.status(200).json({
        success: true,
        message: "Deleted successfuly",
    });
});
