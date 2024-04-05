const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review = require("./review.js");

const listingSchema=new Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image:{
        type:String,
       // set:(v)=> v===""? "default link" :v,
       default:"https://unsplash.com/photos/a-desert-landscape-with-rocks-and-sand-bA32w6lebJg",
        set:(v)=> v===""? "https://unsplash.com/photos/a-desert-landscape-with-rocks-and-sand-bA32w6lebJg" :v,
    },
    price:Number,
    location:String,
    country:String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review",
        },
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",

    },
});
listingSchema.post("findOneAndDelete",async(listing)=>{
   if(listing) {
    await Review.deleteMany({_id: {$in: listing.reviews}});
}

});

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;