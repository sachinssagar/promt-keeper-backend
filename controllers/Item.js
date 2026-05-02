import cloudinary from "../utils/cloudinary.js";
import { Promt } from "../models/Item.js";

const ItemController = {
  async create(req, res) {
    const { promt, image, url } = req.body;

    try {
       // Check image size
       const imageBuffer = Buffer.from(image, "base64"); // Convert base64 string to buffer
       const imageSizeInBytes = imageBuffer.length; // Get the image size in bytes
       console.log("Image size in bytes:", imageSizeInBytes);
 
       let uploadQuality = 100; // Default to full quality unless reduced
 
       if (imageSizeInBytes > 5 * 1024 * 1024) { // If image is larger than 5MB
         uploadQuality = Math.floor((5 * 1024 * 1024) / imageSizeInBytes * 100); // Scale quality down proportionally
         console.log("Reduced quality to:", uploadQuality);
       }

      const result = await cloudinary.uploader.upload(image, {
        folder: "MyPromts",
        quality: uploadQuality,
        fetch_format: "auto",
        max_image_size: 100000000, // 100MB 
      });

      let promtData = await Promt.create({
        promt,
        url,
        image: {
          url: result.secure_url,
          public_id: result.public_id,
        },
      });

      return res.status(201).json(promtData);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const page = req.query?.page ?? 1;
      const limit = req.query?.limit ?? 10;
      const search = req.query?.search?.trim() ?? "";
      let query = {};

      if (search) {
        query.promt = { $regex: new RegExp(search, "i") };
      }

      const skip = limit * (page - 1);
      const promts = await Promt.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });

      const total = await Promt.countDocuments(query);

      return res.json({
        data: promts,
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
      const promt = await Promt.findById(req.params.id);

      if (!promt) {
        return res.status(404).json({ message: "promt not found" });
      }

      return res.json(promt);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { promt } = req.body;

      if (!promt) {
        return res.status(404).json({ message: "promt not found" });
      }

      const promtData = await Promt.findById(req.params.id);

      if (!promtData) {
        return res.status(404).json({ message: "promt not found" });
      }

      promtData.promt = promt;

      if (req.body.image && req.body.image !== "") {
        const imgId = promtData.image.public_id;
        if (imgId) {
          await cloudinary.uploader.destroy(imgId);
        }

        const newImage = await cloudinary.uploader.upload(req.body.image, {
          folder: "MyPromts",
          width: 1000,
          crop: "scale",
        });

        promtData.image = {
          url: newImage.secure_url,
          public_id: newImage.public_id,

        };
      }

      await promtData.save();

      return res.status(200).json(promtData);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const promt = await Promt.findById(req.params.id);

      if (!promt) {
        return res.status(404).json({ message: "promt not found" });
      }

      await cloudinary.uploader.destroy(promt.image.public_id);
      await promt.deleteOne();

      return res.json({ message: "promt deleted successfully" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

export default ItemController;
