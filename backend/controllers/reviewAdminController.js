const ReviewModel = require('../models/reviewModel');

exports.listReviews = async (req, res) => {
  try {
    const {
      rating,
      product_id,
      sort = "latest",
      page = 1,
      limit = 10,
      from_date,
      to_date
    } = req.query;

    const rows = await ReviewModel.listAll({
      rating: rating ? Number(rating) : undefined,
      product_id: product_id ? Number(product_id) : undefined,
      sort,
      page: Number(page),
      limit: Number(limit),
      from_date,
      to_date
    });

    res.json(rows);
  } catch (err) {
    console.error("Admin listReviews error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


exports.updateReview = async (req, res) => {
  const review_id = Number(req.params.id);
  const patch = req.body; // assume JSON body. Admin can edit ratings, title, description, images, verified
  const result = await ReviewModel.update(review_id, patch);
  if (!result) return res.status(400).json({ error: 'nothing to update' });
  const updated = await ReviewModel.findById(review_id);
  res.json(updated);
};

exports.deleteReview = async (req, res) => {
  const review_id = Number(req.params.id);
  const deleted = await ReviewModel.delete(review_id);
  if (!deleted) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
};
