import mongoose from "mongoose";
export const connectDB = () => {
    mongoose
        .connect("mongodb+srv://sami999khan999:W8RuKzou1CQkJknP@cluster0.6pfto8i.mongodb.net/?retryWrites=true&w=majority", {
        dbName: "hexa_cart",
    })
        .then((c) => console.log(`DB Connected to ${c.connection.host}`))
        .catch((e) => console.log(e));
};
