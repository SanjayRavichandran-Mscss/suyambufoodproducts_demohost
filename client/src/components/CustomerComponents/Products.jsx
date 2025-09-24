import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Plus, Minus } from "lucide-react";

const IMAGE_BASE = "http://localhost:5000";
const BRAND = "#B6895B";

export default function Products({
  isLoggedIn,
  customerId,
  cartItems,
  setCartItems,
  fetchCart,
  wishlist,
  handleToggleWishlist,
  showMessage,
  headerSearchTerm,
  onProductsLoaded,
}) {
  const [products, setProducts] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [selectedUoms, setSelectedUoms] = useState({});
  const [selectedVariants, setSelectedVariants] = useState({});
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Listen for category set from Banner chips, then scroll to grid
  useEffect(() => {
    const onSetCategory = (e) => {
      const next = String(e.detail?.value || "all");
      setCategory(next);
      const section = document.getElementById("shop-by-category");
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("setCategory", onSetCategory);
    return () => window.removeEventListener("setCategory", onSetCategory);
  }, []);

  // Local fetchCart function as fallback
  const localFetchCart = async () => {
    if (!customerId) {
      console.warn("No customerId for fetchCart");
      return [];
    }
    try {
      const response = await axios.get(
        `http://localhost:5000/api/customer/cart?customerId=${customerId}`,
        { headers: { Origin: "http://localhost:5173" } }
      );
      console.log("Local fetchCart response:", response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.error("Local fetchCart failed:", err);
      showMessage(
        `Failed to fetch cart: ${err.response?.data?.error || err.message}`,
        "error"
      );
      return [];
    }
  };

  // Debug prop availability
  useEffect(() => {
    console.log("Products.jsx props:", {
      fetchCart: typeof fetchCart,
      showMessage: typeof showMessage,
      cartItems: Array.isArray(cartItems) ? cartItems : "Not an array",
      customerId,
      isLoggedIn,
    });
  }, [fetchCart, showMessage, cartItems, customerId, isLoggedIn]);

  useEffect(() => {
    if (headerSearchTerm !== undefined) {
      setSearchTerm(headerSearchTerm);
    }
  }, [headerSearchTerm]);

  const normalizeImage = (img) => {
    if (!img) return "https://via.placeholder.com/300";
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    if (img.startsWith("/")) return `${IMAGE_BASE}${img}`;
    return `${IMAGE_BASE}/${img}`;
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admin/uoms", {
        headers: { Origin: "http://localhost:5173" },
      })
      .then((res) => {
        console.log("UOMs fetched:", res.data);
        setUoms(res.data || []);
      })
      .catch((error) => console.error("UOMs fetch error:", error));

    axios
      .get("http://localhost:5000/api/admin/products", {
        headers: { Origin: "http://localhost:5173" },
      })
      .then((res) => {
        console.log("Products fetched:", res.data);
        const raw = res.data || [];
        const productsWithImages = raw.map((p) => {
          const seen = new Set();
          const variants = Array.isArray(p.variants)
            ? p.variants
                .map((v) => ({
                  ...v,
                  id: v.id,
                  uom_id: v.uom_id != null ? String(v.uom_id) : undefined,
                  price: v.price != null ? Number(v.price) : undefined,
                  variant_quantity:
                    v.quantity != null ? v.quantity : v.variant_quantity || "",
                  uom_name: v.uom_name || "",
                }))
                .filter((v) => {
                  const key = `${v.uom_id}::${v.variant_quantity}::${v.price}`;
                  if (seen.has(key)) return false;
                  seen.add(key);
                  return true;
                })
            : [];

          const thumbnail_url = p.thumbnail_url
            ? normalizeImage(p.thumbnail_url)
            : "https://via.placeholder.com/300";

          const additional_images = Array.isArray(p.additional_images)
            ? p.additional_images.map((img) => normalizeImage(img))
            : [];

          return {
            ...p,
            thumbnail_url,
            additional_images,
            variants,
          };
        });

        setProducts(productsWithImages);

        // Send products to parent/Banner via callback if provided
        if (typeof onProductsLoaded === "function") {
          onProductsLoaded(productsWithImages);
        }

        setSelectedUoms((prev) => {
          const next = { ...prev };
          productsWithImages.forEach((p) => {
            if (
              !next[String(p.id)] &&
              Array.isArray(p.variants) &&
              p.variants.length > 0
            ) {
              next[String(p.id)] = String(p.variants[0].uom_id);
            }
          });
          return next;
        });

        setSelectedVariants((prev) => {
          const next = {};
          productsWithImages.forEach((p) => {
            if (Array.isArray(p.variants) && p.variants.length > 0) {
              next[String(p.id)] = p.variants[0];
            }
          });
          return next;
        });

        const uniqueCategories = [
          ...new Set(productsWithImages.map((product) => product.category_name)),
        ];
        setCategories([
          { label: "All Products", value: "all" },
          ...uniqueCategories.map((cat) => ({
            label: cat,
            value: cat ? cat.toLowerCase() : cat,
          })),
          { label: "My Wishlist", value: "wishlist" },
        ]);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Products fetch error:", error);
        setErr("Failed to load products");
        setLoading(false);
      });
  }, [onProductsLoaded]);

  useEffect(() => {
    if (!products.length) return;
    setSelectedUoms((prevUoms) => {
      const nextUoms = { ...prevUoms };
      setSelectedVariants((prevVariants) => {
        const nextVariants = { ...prevVariants };
        products.forEach((p) => {
          const cartEntry = Array.isArray(cartItems)
            ? cartItems.find(
                (ci) =>
                  String(ci.product_variant_id) ===
                  String(nextVariants[String(p.id)]?.id)
              )
            : undefined;
          if (cartEntry && cartEntry.uom_id != null) {
            nextUoms[String(p.id)] = String(cartEntry.uom_id);
            const matchingVariant = p.variants?.find(
              (v) => String(v.uom_id) === String(cartEntry.uom_id)
            );
            if (matchingVariant) {
              nextVariants[String(p.id)] = matchingVariant;
            }
          } else if (!nextUoms[String(p.id)] && p.variants && p.variants.length > 0) {
            nextUoms[String(p.id)] = String(p.variants[0].uom_id);
            if (!nextVariants[String(p.id)]) {
              nextVariants[String(p.id)] = p.variants[0];
            }
          }
        });
        return nextVariants;
      });
      return nextUoms;
    });
  }, [cartItems, products]);

  const handleAddToCart = async (productId, quantity = 1) => {
    if (!isLoggedIn) {
      showMessage("Please login to add items to your cart", "warning");
      return;
    }
    if (!customerId) {
      console.error("No customerId available");
      showMessage("Error: No customer ID found", "error");
      return;
    }
    const variantId = selectedVariants[String(productId)]?.id;
    if (!variantId) {
      console.error("No variant selected");
      showMessage("Please select a product variant", "warning");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/customer/cart",
        { customerId, variantId, quantity },
        { headers: { Origin: "http://localhost:5173" } }
      );
      console.log("Add to cart response:", response.data);
      const fetchCartFunction =
        typeof fetchCart === "function" ? fetchCart : localFetchCart;
      const updatedCart = await fetchCartFunction();
      console.log("Updated cart:", updatedCart);
      setCartItems(updatedCart || []);
      showMessage("Item added to cart successfully");
    } catch (err) {
      console.error("Failed to add to cart:", {
        message: err.message,
        response: err.response?.data,
      });
      showMessage(
        `Failed to add to cart: ${err.response?.data?.error || err.message}`,
        "error"
      );
    }
  };

  const updateQuantity = async (variantId, change) => {
    const item = Array.isArray(cartItems)
      ? cartItems.find(
          (item) => String(item.product_variant_id) === String(variantId)
        )
      : undefined;
    if (!item) {
      console.error("Item not found in cart");
      showMessage("Item not found in cart", "error");
      return;
    }
    const newQuantity = Math.max(1, item.quantity + change);
    try {
      const response = await axios.put(
        "http://localhost:5000/api/customer/cart",
        { customerId, variantId, quantity: newQuantity },
        { headers: { Origin: "http://localhost:5173" } }
      );
      console.log("Update quantity response:", response.data);
      const fetchCartFunction =
        typeof fetchCart === "function" ? fetchCart : localFetchCart;
      const updatedCart = await fetchCartFunction();
      console.log("Updated cart:", updatedCart);
      setCartItems(updatedCart || []);
      showMessage("Cart updated successfully");
    } catch (err) {
      console.error("Failed to update quantity:", {
        message: err.message,
        response: err.response?.data,
      });
      showMessage(
        `Failed to update quantity: ${err.response?.data?.error || err.message}`,
        "error"
      );
    }
  };

  const handleUomChange = (productId, composite, variants) => {
    const [uomId, qty, price] = String(composite).split("::");
    const variant = variants.find(
      (v) =>
        String(v.uom_id) === String(uomId) &&
        String(v.variant_quantity ?? v.quantity ?? "") === String(qty) &&
        String(v.price ?? "") === String(price)
    );
    setSelectedUoms((prev) => ({ ...prev, [String(productId)]: String(uomId) }));
    setSelectedVariants((prev) => ({ ...prev, [String(productId)]: variant || null }));
  };

  const filteredProducts = products
    .filter(
      (product) =>
        category === "all" ||
        (category === "wishlist"
          ? wishlist.includes(product.id)
          : product.category_name && product.category_name.toLowerCase() === category)
    )
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-600">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {/* Global select popup styling (best in Firefox) */}
      <style>{`
        .variant-select option:hover {
          background-color: #22c55e33; /* green/20% */
          color: #14532d;
        }
        .variant-select option:checked {
          background-color: #22c55e !important; /* solid green */
          color: #ffffff !important;
        }
      `}</style>

      <section id="shop-by-category">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search for fresh groceries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 lg:w-1/3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5 gap-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isLoggedIn={isLoggedIn}
                customerId={customerId}
                cartItems={cartItems}
                updateQuantity={updateQuantity}
                handleToggleWishlist={handleToggleWishlist}
                wishlist={wishlist}
                selectedUom={selectedUoms[String(product.id)]}
                selectedVariant={selectedVariants[String(product.id)]}
                handleUomChange={(id, value) =>
                  handleUomChange(id, value, product.variants)
                }
                handleAddToCart={handleAddToCart}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-600 col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-3 xl:col-span-5">
              {category === "wishlist"
                ? "No products in your wishlist."
                : "No products available in this category or search."}
            </div>
          )}
        </div>
      </section>
      {err && <p className="text-red-500 text-center mt-8 mb-4">{err}</p>}
    </div>
  );
}

function ProductCard({
  product,
  isLoggedIn,
  customerId,
  cartItems,
  updateQuantity,
  handleToggleWishlist,
  wishlist,
  selectedUom,
  selectedVariant,
  handleUomChange,
  handleAddToCart,
}) {
  const navigate = useNavigate();

  const cartItem = Array.isArray(cartItems)
    ? cartItems.find(
        (item) => String(item.product_variant_id) === String(selectedVariant?.id)
      )
    : undefined;

  const quantity = cartItem ? cartItem.quantity : 0;
  const isLiked = Array.isArray(wishlist) && wishlist.includes(product.id);
  const isOutOfStock = product.stock_status_id === 2;

  const displayVariants = Array.isArray(product.variants) ? product.variants : [];

  const effectiveVariant =
    selectedVariant ||
    displayVariants.find((v) => String(v.uom_id) === String(selectedUom)) ||
    displayVariants[0] ||
    null;

  const variantKey = (v) =>
    `${v.uom_id}::${v.variant_quantity ?? v.quantity ?? ""}::${v.price ?? ""}`;

  const currentValue = effectiveVariant
    ? variantKey(effectiveVariant)
    : displayVariants[0]
    ? variantKey(displayVariants[0])
    : "";

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl z-10">
      <div className="relative">
        <img
          src={product.thumbnail_url}
          alt={product.name}
          className="w-full h-40 sm:h-48 object-cover cursor-pointer"
          onClick={() => {
            const encodedCustomerId = btoa(customerId || "");
            const encodedProductId = btoa(product.id.toString());
            const selectedParams = effectiveVariant
              ? `&variantId=${effectiveVariant.id}`
              : "";
            navigate(
              `/customer?customerId=${encodedCustomerId}&productId=${encodedProductId}${selectedParams}`
            );
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300";
          }}
        />
        <button
          onClick={() => handleToggleWishlist(product.id)}
          className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
          title="Toggle wishlist"
        >
          <Heart
            size={16}
            className={isLiked ? "text-red-500 fill-red-500" : "text-gray-600"}
          />
        </button>

        {product.stock_status_id === 1 &&
          product.stock_status === "low_stock" && (
            <span className="absolute top-2 left-2 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full shadow z-10 border border-red-300 animate-pulse">
              Low Stock
            </span>
          )}
        {isOutOfStock && (
          <span className="absolute top-2 left-2 bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full shadow z-10 border border-gray-300">
            Out of Stock
          </span>
        )}
      </div>

      <div className="p-3 sm:p-4">
        {/* Category pill */}
        <span className="inline-flex items-center px-2 py-1 rounded-md bg-[#EFE6D0] text-[#5F553E] uppercase text-[10px] font-semibold">
          {product.category_name || "Category"}
        </span>

        <h3
          className="text-base sm:text-lg font-medium text-gray-900 mt-2 mb-1 cursor-pointer"
          onClick={() => {
            const encodedCustomerId = btoa(customerId || "");
            const encodedProductId = btoa(product.id.toString());
            const selectedParams = effectiveVariant
              ? `&variantId=${effectiveVariant.id}`
              : "";
            navigate(
              `/customer?customerId=${encodedCustomerId}&productId=${encodedProductId}${selectedParams}`
            );
          }}
        >
          {product.name}
        </h3>

        {/* Variant select */}
        <div className="relative mb-2 sm:mb-3">
          <select
            value={currentValue}
            onChange={(e) => handleUomChange(product.id, e.target.value)}
            className="
              variant-select
              w-full appearance-none
              rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 pr-8 sm:pr-10
              bg-[#F3F5F7] text-gray-800
              border border-gray-200
              shadow-inner
              text-xs sm:text-sm
              focus:outline-none focus:ring-2 focus:ring-[#B6895B]/40 focus:border-[#B6895B]/50
            "
            style={{
              WebkitAppearance: "none",
              MozAppearance: "none",
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none'><path d='M6 9l6 6 6-6' stroke='%23667788' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
              backgroundSize: "18px",
            }}
          >
            {displayVariants.map((variant) => (
              <option key={variant.id} value={variantKey(variant)}>
                {variant.variant_quantity || variant.quantity} {variant.uom_name || ""}
                {variant.price != null ? ` - ₹${Number(variant.price).toFixed(2)}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Price and cart controls */}
        <div className="mt-2 flex items-center justify-between">
          <div className="text-xl sm:text-2xl font-extrabold" style={{ color: BRAND }}>
            ₹
            {effectiveVariant?.price != null
              ? Number(effectiveVariant.price).toFixed(2)
              : "0.00"}
          </div>

          {!isLoggedIn || isOutOfStock || !effectiveVariant ? (
            <button
              disabled
              className="h-8 sm:h-9 w-8 sm:w-9 rounded-full border border-gray-300 text-gray-400 grid place-items-center cursor-not-allowed"
              title={!isLoggedIn ? "Login to add" : "Out of stock"}
            >
              <Plus size={14} />
            </button>
          ) : quantity > 0 ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => updateQuantity(effectiveVariant.id, -1)}
                disabled={quantity <= 1}
                className={`h-8 sm:h-9 w-8 sm:w-9 rounded-full border grid place-items-center ${
                  quantity <= 1
                    ? "border-gray-200 text-gray-300 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
                title="Decrease"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-semibold text-gray-700">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(effectiveVariant.id, 1)}
                className="h-8 sm:h-9 w-8 sm:w-9 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 grid place-items-center"
                title="Increase"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleAddToCart(product.id)}
              className="h-8 sm:h-9 w-8 sm:w-9 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 grid place-items-center"
              title="Add to cart"
            >
              <Plus size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}