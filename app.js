// if(process.env.NODE_ENV != "production") {
//     require("dotenv").config();
// }

// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");


// const path = require("path");
// const methodOverride = require("method-override");
// const ejsMate = require("ejs-mate");
// const ExpressError = require("./utils/ExpressError.js");

// const listingRouter = require("./routes/listing.js");
// const reviewRouter = require("./routes/review.js");
// const userRouter = require("./routes/user.js");
// const { isLoggedIn } = require("./middleware.js");


// const session = require("express-session"); 
// const flash = require("connect-flash");
// const passport = require("passport");
// const LocalStrategy = require("passport-local");
// const User = require("./models/user.js");

// const dbUrl = process.env.ATLASDB_URL;

// main().then(()=> {
//     console.log("connected to DB");
// }).catch(err => {
//     console.log(err); 
// })
// async function main() {
//     await mongoose.connect(dbUrl);
// }

// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));
// app.use(express.urlencoded({extended: true}))
// app.use(methodOverride("_method"));
// app.engine('ejs', ejsMate);
// app.use(express.static(path.join(__dirname, "public")));

// const sessionOptions = {
//     secret: process.env.SECRET,
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//         expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//         httpOnly: true,
//     },
// };


// app.use(session(sessionOptions));
// app.use(flash());

// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()));

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// app.use((req, res, next) => {
//     res.locals.success = req.flash("success");
//     res.locals.error = req.flash("error");
//     res.locals.currUser = req.user;
//     next();
// });


// app.get("/", (req, res) => {
//     res.redirect("/listings");
// });

// app.use("/listings", listingRouter);
// app.use("/listings/:id/reviews", reviewRouter); 
// app.use("/", userRouter);




// app.all("*", (req, res, next) => {
//     next(new ExpressError(404, "Page Not Found!"));
// })
// app.use((err, req, res, next) => {
//     let{statusCode=500, message} = err;
//     //res.status(statusCode).send(message);
//     res.status(statusCode).render("error.ejs", { message });
// });
// const PORT =process.env.PORT || 3000;
// app.listen(PORT, ()=> {
//     console.log(`Server is running on port ${PORT}`);
// })

// // app.listen(3000, ()=> {
// //     console.log(`Server is running on port ${PORT}`);
// // });


if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const ExpressError = require("./utils/ExpressError.js");

const User = require("./models/user.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// ✅ MongoDB Connection
const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

mongoose.connect(dbUrl)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ View engine
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ✅ Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Optional: useful for JSON APIs
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ✅ Session & Flash Setup
const sessionOptions = {
    secret: process.env.SECRET || "somesecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
};
app.use(session(sessionOptions));
app.use(flash());

// ✅ Passport.js Setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ✅ Flash & Current User Middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// ✅ Routes
app.get("/", (req, res) => {
    res.redirect("/listings");
});
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// ✅ 404 and Error Handler
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
