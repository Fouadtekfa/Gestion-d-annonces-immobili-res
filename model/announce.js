const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const announceSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Vente', 'Location'],
    required: true,
  },
  published: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['Disponible', 'Loué', 'Vendu'],
  },
  description: String,
  price: Number,
  date: Date,
  photos: [String], // on stockez que URL des photos
});

const Announce = mongoose.model('Announce', announceSchema);

module.exports = Announce;
