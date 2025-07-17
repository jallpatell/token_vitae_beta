const { mongoose } = require('./mongoose');

const priceSchema = new mongoose.Schema({
  token: { type: String, required: true },
  network: { type: String, required: true },
  date: { type: Number, required: true }, // UTC timestamp (seconds)
  price: { type: Number, required: true },
  source: { type: String, required: true },
}, { timestamps: true });

priceSchema.index({ token: 1, network: 1, date: 1 }, { unique: true });

const Price = mongoose.model('Price', priceSchema);

module.exports = Price; 