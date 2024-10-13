import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
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

export const Item = mongoose.model('Item', itemSchema);
