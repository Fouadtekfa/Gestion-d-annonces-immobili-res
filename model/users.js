const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    first_name: {
        type: String,
        required: true
      },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  });

  module.exports = mongoose.model('users', UserSchema);