const db = require("../config/db");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const IMAGE_BASE = "https://suyambufoodproducts-demohost-4.onrender.com";

/* ----------------------- AUTH ----------------------- */
exports.login = async (req, res) => {
  console.log("🟢 login called with body:", req.body);
  const { login, password } = req.body;

  if (!login || !password) {
    return res
      .status(400)
      .json({ message: "Username or email and password are required" });
  }

  try {
    const [admins] = await db.query(
      "SELECT id, username, password, email, full_name FROM admins WHERE username = ? OR email = ?",
      [login, login]
    );
    console.log("🔎 login query result:", admins);

    if (admins.length === 0) {
      return res.status(401).json({ message: "Invalid username or email" });
    }

    const admin = admins[0];
    if (password !== admin.password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, email: admin.email },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      adminId: admin.id,
      full_name: admin.full_name,
      email: admin.email,
    });
  } catch (error) {
    console.error("❌ Admin login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.verify = async (req, res) => {
  console.log("🟢 verify called");
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    console.log("🔎 decoded token:", decoded);

    const [admins] = await db.query("SELECT id FROM admins WHERE id = ?", [
      decoded.id,
    ]);
    if (admins.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }
    return res.status(200).json({ message: "Admin verified" });
  } catch (error) {
    console.error("❌ verify error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

/* ----------------------- CATEGORY ----------------------- */
exports.addCategory = async (req, res) => {
  console.log("🟢 addCategory called with body:", req.body);
  try {
    const { name, description } = req.body;
    if (!name)
      return res.status(400).json({ error: "Category name is required" });

    const sql = `INSERT INTO categories (name, description, created_at, updated_at) VALUES (?, ?, NOW(), NOW())`;
    const [result] = await db.query(sql, [name, description || null]);

    return res
      .status(201)
      .json({ message: "Category added", id: result.insertId });
  } catch (error) {
    console.error("❌ Error adding category:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateCategory = async (req, res) => {
  console.log("🟢 updateCategory called with params:", req.params, "body:", req.body);
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name)
      return res.status(400).json({ error: "Category name is required" });

    await db.query(
      "UPDATE categories SET name=?, description=?, updated_at=NOW() WHERE id=?",
      [name, description || null, id]
    );
    return res.status(200).json({ message: "Category updated" });
  } catch (error) {
    console.error("❌ Error updating category:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteCategory = async (req, res) => {
  console.log("🟢 deleteCategory called with params:", req.params);
  try {
    const { id } = req.params;
    await db.query("DELETE FROM categories WHERE id=?", [id]);
    return res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    console.error("❌ Error deleting category:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.viewCategories = async (req, res) => {
  console.log("🟢 viewCategories called");
  try {
    const [rows] = await db.query(
      "SELECT * FROM categories ORDER BY created_at DESC"
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ----------------------- HELPERS ----------------------- */
const parseAdditionalImages = (images) => {
  try {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    if (typeof images === "string") {
      try {
        return JSON.parse(images);
      } catch {
        return images.split(",").map((img) => img.trim());
      }
    }
    return [];
  } catch {
    return [];
  }
};

const stringifyAdditionalImages = (arr) =>
  Array.isArray(arr) ? JSON.stringify(arr) : "[]";

/* ----------------------- PRODUCT UPLOAD ----------------------- */
const productImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../public/productImages");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-")),
});

// Accept broad image types (including webp, avif) using mimetype + extension check
const allowedExtensions = [".jpeg", ".jpg", ".png", ".gif", ".webp", ".avif", ".svg"];
const productUpload = multer({
  storage: productImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    try {
      const mimetypeOk = typeof file.mimetype === "string" && file.mimetype.toLowerCase().startsWith("image/");
      const ext = path.extname(file.originalname).toLowerCase();
      const extOk = allowedExtensions.includes(ext);
      if (mimetypeOk && extOk) {
        return cb(null, true);
      }
      return cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp, avif, svg)"));
    } catch (err) {
      return cb(new Error("Invalid file"));
    }
  },
}).fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "additional_images", maxCount: 5 },
]);

// Wrapper to ensure multer errors return JSON (avoids HTML error pages)
const productUploadWrapper = (req, res, next) => {
  productUpload(req, res, (err) => {
    if (err) {
      console.error("❌ Multer upload error:", err);
      // Multer errors often are instances of multer.MulterError
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message || "File upload error" });
    }
    next();
  });
};

/* ----------------------- PRODUCTS ----------------------- */
exports.addProduct = [
  productUploadWrapper,
  async (req, res) => {
    console.log("🟢 addProduct called with body:", req.body, "files:", req.files);
    try {
      const { name, description, category_id, stock_status_id, quantity, uom_id, price } =
        req.body;
      if (!name || !category_id || !stock_status_id) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      let thumbnail_url = null;
      let additional_images = [];
      if (req.files?.thumbnail?.length > 0) {
        thumbnail_url = `/productImages/${req.files.thumbnail[0].filename}`;
      }
      if (req.files?.additional_images?.length > 0) {
        additional_images = req.files.additional_images.map(
          (f) => `/productImages/${f.filename}`
        );
      }

      const sql = `
        INSERT INTO products (name, description, thumbnail_url, additional_images, category_id, admin_id, created_at, updated_at, stock_status_id) 
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)
      `;
      const [result] = await db.query(sql, [
        name,
        description || null,
        thumbnail_url,
        stringifyAdditionalImages(additional_images),
        category_id,
        1,
        stock_status_id,
      ]);

      const productId = result.insertId;

      // handle variants
      if (quantity && uom_id && price) {
        const qArr = Array.isArray(quantity) ? quantity : [quantity];
        const uArr = Array.isArray(uom_id) ? uom_id : [uom_id];
        const pArr = Array.isArray(price) ? price : [price];

        for (let i = 0; i < qArr.length; i++) {
          if (qArr[i] && uArr[i] && pArr[i]) {
            await db.query(
              "INSERT INTO product_variants (product_id, variant_quantity, uom_id, price, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
              [productId, qArr[i], uArr[i], pArr[i]]
            );
          }
        }
      }

      return res
        .status(201)
        .json({ message: "Product added", id: productId });
    } catch (error) {
      console.error("❌ Error adding product:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
];

exports.updateProduct = [
  productUploadWrapper,
  async (req, res) => {
    console.log("🟢 updateProduct called with params:", req.params, "body:", req.body);
    try {
      const { id } = req.params;
      const { name, description, category_id, stock_status_id, quantity, uom_id, price } =
        req.body;

      const [existing] = await db.query("SELECT * FROM products WHERE id = ?", [
        id,
      ]);
      if (existing.length === 0)
        return res.status(404).json({ error: "Product not found" });

      let thumbnail_url = existing[0].thumbnail_url;
      let additional_images = parseAdditionalImages(
        existing[0].additional_images
      );

      if (req.files?.thumbnail?.length > 0) {
        thumbnail_url = `/productImages/${req.files.thumbnail[0].filename}`;
      }
      if (req.files?.additional_images?.length > 0) {
        additional_images = [
          ...additional_images,
          ...req.files.additional_images.map(
            (f) => `/productImages/${f.filename}`
          ),
        ];
      }

      await db.query(
        `UPDATE products 
         SET name=?, description=?, thumbnail_url=?, additional_images=?, category_id=?, stock_status_id=?, updated_at=NOW() 
         WHERE id=?`,
        [
          name,
          description || null,
          thumbnail_url,
          stringifyAdditionalImages(additional_images),
          category_id,
          stock_status_id,
          id,
        ]
      );

      // reset variants
      await db.query("DELETE FROM product_variants WHERE product_id=?", [id]);

      if (quantity && uom_id && price) {
        const qArr = Array.isArray(quantity) ? quantity : [quantity];
        const uArr = Array.isArray(uom_id) ? uom_id : [uom_id];
        const pArr = Array.isArray(price) ? price : [price];

        for (let i = 0; i < qArr.length; i++) {
          if (qArr[i] && uArr[i] && pArr[i]) {
            await db.query(
              "INSERT INTO product_variants (product_id, variant_quantity, uom_id, price, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
              [id, qArr[i], uArr[i], pArr[i]]
            );
          }
        }
      }

      // ✅ Return updated product instead of just message
      return res.status(200).json({
        message: "Product updated",
        product: {
          id,
          name,
          description,
          category_id,
          stock_status_id,
          thumbnail_url,
          additional_images,
        },
      });
    } catch (error) {
      console.error("❌ Error updating product:", error);

      // ✅ Always send JSON error, never HTML
      return res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  },
];

exports.deleteProduct = async (req, res) => {
  console.log("🟢 deleteProduct called with params:", req.params);
  try {
    const { id } = req.params;
    await db.query("DELETE FROM product_variants WHERE product_id=?", [id]);
    await db.query("DELETE FROM products WHERE id=?", [id]);
    return res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.viewProducts = async (req, res) => {
  console.log("🟢 viewProducts called");
  try {
    const [rows] = await db.query(
      `SELECT 
        p.id, p.name, p.description, p.thumbnail_url, p.additional_images,
        p.category_id, c.name AS category_name,
        s.status AS stock_status, s.id AS stock_status_id,
        pv.id AS variant_id, pv.variant_quantity, pv.price AS variant_price, 
        u.id AS variant_uom_id, u.uom_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN stock_statuses s ON p.stock_status_id = s.id
       LEFT JOIN product_variants pv ON pv.product_id = p.id
       LEFT JOIN uom_master u ON pv.uom_id = u.id
       ORDER BY p.created_at DESC`
    );
    console.log("🔎 viewProducts query result count:", rows.length);

    const productsMap = {};
    rows.forEach((r) => {
      if (!productsMap[r.id]) {
        productsMap[r.id] = {
          id: r.id,
          name: r.name,
          description: r.description,
          thumbnail_url: r.thumbnail_url,
          additional_images: parseAdditionalImages(r.additional_images),
          category_id: r.category_id,
          category_name: r.category_name,
          stock_status_id: r.stock_status_id,
          stock_status: r.stock_status,
          variants: [],
        };
      }
      if (r.variant_id) {
        productsMap[r.id].variants.push({
          id: r.variant_id,
          quantity: r.variant_quantity,
          price: r.variant_price,
          uom_id: r.variant_uom_id,
          uom_name: r.uom_name,
        });
      }
    });

    return res.status(200).json(Object.values(productsMap));
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getProductById = async (req, res) => {
  console.log("🟢 getProductById called with params:", req.params);
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT 
        p.id, p.name, p.description, p.thumbnail_url, p.additional_images,
        p.category_id, c.name AS category_name,
        s.status AS stock_status, s.id AS stock_status_id,
        pv.id AS variant_id, pv.variant_quantity, pv.price AS variant_price, 
        u.id AS variant_uom_id, u.uom_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN stock_statuses s ON p.stock_status_id = s.id
       LEFT JOIN product_variants pv ON pv.product_id = p.id
       LEFT JOIN uom_master u ON pv.uom_id = u.id
       WHERE p.id = ?`,
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Product not found" });

    const product = {
      id: rows[0].id,
      name: rows[0].name,
      description: rows[0].description,
      thumbnail_url: rows[0].thumbnail_url,
      additional_images: parseAdditionalImages(rows[0].additional_images),
      category_id: rows[0].category_id,
      category_name: rows[0].category_name,
      stock_status_id: rows[0].stock_status_id,
      stock_status: rows[0].stock_status,
      variants: [],
    };

    rows.forEach((r) => {
      if (r.variant_id) {
        product.variants.push({
          id: r.variant_id,
          quantity: r.variant_quantity,
          price: r.variant_price,
          uom_id: r.variant_uom_id,
          uom_name: r.uom_name,
        });
      }
    });

    return res.status(200).json(product);
  } catch (error) {
    console.error("❌ Error fetching product by id:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ----------------------- PRODUCT VARIANTS ----------------------- */
exports.addProductVariant = async (req, res) => {
  console.log("🟢 addProductVariant called with body:", req.body);
  try {
    const { product_id, variant_quantity, uom_id, price } = req.body;
    if (!product_id || !variant_quantity || !uom_id || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const [result] = await db.query(
      "INSERT INTO product_variants (product_id, variant_quantity, uom_id, price, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
      [product_id, variant_quantity, uom_id, price]
    );
    return res
      .status(201)
      .json({ message: "Variant added", id: result.insertId });
  } catch (error) {
    console.error("❌ Error adding product variant:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateProductVariant = async (req, res) => {
  console.log("🟢 updateProductVariant called with params:", req.params, "body:", req.body);
  try {
    const { id } = req.params;
    const { variant_quantity, uom_id, price } = req.body;
    await db.query(
      "UPDATE product_variants SET variant_quantity=?, uom_id=?, price=?, updated_at=NOW() WHERE id=?",
      [variant_quantity, uom_id, price, id]
    );
    return res.status(200).json({ message: "Variant updated" });
  } catch (error) {
    console.error("❌ Error updating product variant:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ----------------------- DELETE PRODUCT VARIANT ----------------------- */
exports.deleteProductVariant = async (req, res) => {
  console.log("🟢 deleteProductVariant called with params:", req.params);
  try {
    const { productId, variantId } = req.params;
    
    // Validate that both IDs are provided and are numbers
    if (!productId || !variantId) {
      return res.status(400).json({ error: "Product ID and Variant ID are required" });
    }

    // Check if the variant exists and belongs to the specified product
    const [existingVariant] = await db.query(
      "SELECT id FROM product_variants WHERE id = ? AND product_id = ?",
      [variantId, productId]
    );

    if (existingVariant.length === 0) {
      return res.status(404).json({ error: "Variant not found or doesn't belong to this product" });
    }

    // Check if this is the only variant for the product (prevent deletion if it's the last one)
    const [variantCount] = await db.query(
      "SELECT COUNT(*) as count FROM product_variants WHERE product_id = ?",
      [productId]
    );

    if (variantCount[0].count <= 1) {
      return res.status(400).json({ error: "Cannot delete the last variant. At least one variant is required." });
    }

    // Delete the variant
    await db.query("DELETE FROM product_variants WHERE id = ? AND product_id = ?", [variantId, productId]);
    
    return res.status(200).json({ 
      message: "Variant deleted successfully",
      variantId: variantId,
      productId: productId 
    });
  } catch (error) {
    console.error("❌ Error deleting product variant:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

exports.viewProductVariants = async (req, res) => {
  console.log("🟢 viewProductVariants called");
  try {
    const [rows] = await db.query(
      `SELECT pv.*, u.uom_name 
       FROM product_variants pv
       LEFT JOIN uom_master u ON pv.uom_id = u.id
       ORDER BY pv.created_at DESC`
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Error fetching product variants:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ----------------------- UOM ----------------------- */
exports.getUoms = async (req, res) => {
  console.log("🟢 getUoms called");
  try {
    const [rows] = await db.query("SELECT * FROM uom_master ORDER BY uom_name ASC");
    return res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Error fetching UOMs:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.addUom = async (req, res) => {
  console.log("🟢 addUom called with body:", req.body);
  try {
    const { uom_name } = req.body;
    if (!uom_name) return res.status(400).json({ error: "UOM name required" });

    const [result] = await db.query(
      "INSERT INTO uom_master (uom_name) VALUES (?)",
      [uom_name]
    );

    return res.status(201).json({ id: result.insertId, uom_name });
  } catch (error) {
    console.error("❌ Error adding UOM:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ----------------------- STOCK STATUSES ----------------------- */
exports.getStockStatuses = async (req, res) => {
  console.log("🟢 getStockStatuses called");
  try {
    const [rows] = await db.query(
      "SELECT id, status FROM stock_statuses ORDER BY id ASC"
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Error fetching stock statuses:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ----------------------- CUSTOMERS ----------------------- */
exports.viewCustomers = async (req, res) => {
  console.log("🟢 viewCustomers called");
  try {
    const [rows] = await db.query(
      "SELECT id, username, email, full_name, phone, created_at FROM customers ORDER BY created_at DESC"
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Error fetching customers:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ----------------------- PROFILE ----------------------- */
exports.getProfile = async (req, res) => {
  console.log("🟢 getProfile called with params:", req.params);
  try {
    const { adminId } = req.params;
    let decoded = Buffer.from(adminId, "base64").toString("ascii");
    decoded = parseInt(decoded, 10);
    if (isNaN(decoded))
      return res.status(400).json({ error: "Invalid adminId" });

    const [admins] = await db.query(
      "SELECT id, full_name, email FROM admins WHERE id = ?",
      [decoded]
    );
    if (admins.length === 0)
      return res.status(404).json({ error: "Admin not found" });

    return res.status(200).json(admins[0]);
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
