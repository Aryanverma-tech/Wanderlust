const express=require("express");
const passport =require("passport");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const expresserror = require("../utils/expresserror.js");
const Listing = require("../models/listing.js");
const {isLoggedIn} =require("../middleware.js");



//Index Route
router.get("/",wrapAsync( async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

//New Routes
router.get("/new", isLoggedIn,(req, res) => {
  
  res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
  .populate("reviews").populate("owner");
  console.log(listing);
  res.render("listings/show.ejs", { listing });
}));

//Create Route
router.post("/",isLoggedIn,wrapAsync( async (req, res) => {
  //if(!req.body.listing){
   // throw new expresserror(400,"Send valid data for listing");
  //}
  
  const newListing = new Listing(req.body.listing);
  newListing.owner=req.user._id;
  await newListing.save();
  req.flash("success","New Listing Created!");
  res.redirect("/listings");
  })
    );

//Edit Route
router.get("/:id/edit", isLoggedIn,wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

//Update Route
router.put("/:id",isLoggedIn,wrapAsync( async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete("/:id",isLoggedIn,wrapAsync( async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
}));

module.exports=router;

