import mongoose from 'mongoose';

const promtSchema = new mongoose.Schema(
  {
    promt: {
      type: String,
      required: true,
    },
    url: {
      type: String,
    },
    image: {
      public_id: {
        type: String,
        // required: true,
      },
      url: {
        type: String,
        //required: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

export const Promt = mongoose.model('Promt', promtSchema);
