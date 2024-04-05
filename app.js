const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const expresserror = require("./utils/expresserror.js");
const session=require("express-session");
const flash = require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
//const {listingSchema}=require("./Schema.js");
const Review =require("./models/review.js");
const listingRouter=require("./routes/listing.js");
const reviewsRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const sessionOptions={
  secret: "mysupersecretcode",
  resave:false,
  saveUninitialized:true,
  cookie:{
    expries:Date.now()+ 7*24*60*60*1000,
    maxAge: 7*24*60*60*1000,
    httpOnly:true,
  },
};

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
});

// app.get("/demouser",async(req,res)=>{
//   let fakeUser=new User({
//     email:"aryan@123.com",
//     username:"delta",

//   });
//    let registeredUser = await User.register(fakeUser,"helloworld");
//    res.send(registeredUser);
// });




//Index Route
app.get("/listings",wrapAsync( async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

//New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  res.render("listings/show.ejs", { listing });
}));

//Create Route
app.post("/listings",wrapAsync( async (req, res) => {
  //if(!req.body.listing){
   // throw new expresserror(400,"Send valid data for listing");
  //}
  
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
  })
    );

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

//Update Route
app.put("/listings/:id",wrapAsync( async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id",wrapAsync( async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
}));

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);


//reviews
//POST ROUTE

app.post("/listings/:id/reviews" , async(req,res)=>{
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  console.log("new review saved");
  res.send("new review saved");

  res.redirect(`/listings/${listing._id}`);

});

//Delete Review Route
app.delete("/listings/:id/reviews/:reviewId",
wrapAsync (async(req,res)=>{
  let{id,reviewId}=req.params;

  await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);

  res.redirect(`/listings/${id}`);

}));





// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });
app.all("*",(req,res,next)=>{
  next(new expresserror(404,"page not found!"));
});

app.use((err,req,res,next)=>{
  let {statusCode=500,message="Something went wrong !"}=err;
  res.status(statusCode).send(message);
  
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});