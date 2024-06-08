import mongoose from 'mongoose';

const photosSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  photos: {
    type: Array,
  },
});

const Photos = mongoose.model('Photos', photosSchema);

export default Photos;
