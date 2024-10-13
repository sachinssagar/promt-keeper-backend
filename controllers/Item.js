import cloudinary from '../utils/cloudinary.js';
import { Item } from '../models/Item.js';

const ItemController = {
  async create(req, res) {
    const { title, image } = req.body;

    try {
      const result = await cloudinary.uploader.upload(image, {
        folder: 'Promts',
        width: 1000,
        crop: 'scale',
      });

      let item = await Item.create({
        title,
        image: {
          url: result.secure_url,
          public_id: result.public_id,
        },
      });

      return res.status(201).json(item);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const page = req.query?.page ?? 1;
      const limit = req.query?.limit ?? 10;
      const serach = req.query?.search?.trim() ?? '';
      let query = {};

      if (serach) {
        query.title = { $regex: new RegExp(search, 'i') };
      }

      const skip = limit * (page - 1);
      const items = await Item.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });

      const total = await Item.countDocuments(query);

      return res.json({
        data: items,
        total: total,
        page: page,
        limit: limit,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const item = await Item.findById(req.params.id);

      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      return res.json(item);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    const { title, image } = req.body;

    try {
      let item = await Item.findById(req.params.id);

      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      if (image) {
        await cloudinary.uploader.destroy(item.image.public_id);
        const result = await cloudinary.uploader.upload(image, {
          folder: 'Promts',
          width: 1000,
          crop: 'scale',
        });

        item.image = {
          url: result.secure_url,
          public_id: result.public_id,
        };
      }

      item.title = title;
      await item.save();

      return res.json(item);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const item = await Item.findById(req.params.id);

      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      await cloudinary.uploader.destroy(item.image.public_id);
      await item.deleteOne();

      return res.json({ message: 'Item deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

export default ItemController;
