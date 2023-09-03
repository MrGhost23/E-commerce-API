const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, "You must provide a rating"],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      required: [true, "You must provide review title"],
      maxlength: 60,
    },
    comment: {
      type: String,
      trim: true,
      required: [true, "You must provide review comment"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calculateAvgRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);
  try {
    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

ReviewSchema.post(
  "deleteMany",
  { document: true, query: true },
  async function () {
    await this.constructor.calculateAvgRating(this.product);
  }
);
ReviewSchema.post(
  "deleteOne",
  { document: true, query: true },
  async function () {
    await this.constructor.calculateAvgRating(this.product);
  }
);

ReviewSchema.post("save", async function () {
  await this.constructor.calculateAvgRating(this.product);
});

module.exports = mongoose.model("Review", ReviewSchema);
