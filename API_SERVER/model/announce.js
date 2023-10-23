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
  photos: [], // on stockez que URL des photos
  by:String,
  comments: [{
    user_id: String,
    history: [{
      id_user: {
        type: String,
        //required: true,
      },
      content: {
        type: String,
        //required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      read: {
        type: Boolean,
        default: true,
      },
    }],
  }],
});

const Announce = mongoose.model('announces', announceSchema);

module.exports = Announce;
