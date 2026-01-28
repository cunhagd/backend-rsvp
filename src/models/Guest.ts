import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  hasChildren: {
    type: Boolean,
    default: false,
  },
  children: [{
    name: String,
    age: Number,
    willStay: Boolean, // true = dormirá, false = apenas festa sábado
    arrivalDay: String, // 'friday' ou 'saturday'
  }],
  willStay: {
    type: Boolean,
    default: false,
  },
  arrivalDay: {
    type: String,
    enum: ['friday', 'saturday'],
  },
  confirmedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Guest = mongoose.model('Guest', guestSchema);
