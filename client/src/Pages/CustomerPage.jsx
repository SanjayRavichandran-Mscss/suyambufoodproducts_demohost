// import React, { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";
// import Swal from "sweetalert2";
// import Header from "../components/CustomerComponents/Header";
// import Banner from "../components/CustomerComponents/Banner";
// import Products from "../components/CustomerComponents/Products";
// import SingleProduct from "../components/CustomerComponents/SingleProduct";
// import Footer from "../components/CustomerComponents/Footer";
// import CustomerLogin from "../components/Authentication/CustomerLogin";
// import CustomerRegister from "../components/Authentication/CustomerRegister";
// import Cart from "../components/CustomerComponents/Cart";
// import MyOrders from "../components/CustomerComponents/MyOrders";
// import { Home, Menu, X,Search } from "lucide-react";

// function decodeCustomerId(encodedId) {
//   try {
//     return atob(encodedId);
//   } catch {
//     console.error("Error decoding customerId:", encodedId);
//     return null;
//   }
// }

// function decodeProductId(encodedId) {
//   try {
//     const decoded = atob(encodedId);
//     const idNum = parseInt(decoded, 10);
//     if (isNaN(idNum)) {
//       throw new Error("Invalid product ID");
//     }
//     return idNum.toString();
//   } catch {
//     console.error("Error decoding productId:", encodedId);
//     return null;
//   }
// }

// export default function CustomerPage() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const searchParams = new URLSearchParams(location.search);
//   const encodedCustomerId = searchParams.get("customerId");
//   const encodedProductId = searchParams.get("productId");
//   const customerId = encodedCustomerId ? decodeCustomerId(encodedCustomerId) : null;
//   const productId = encodedProductId ? decodeProductId(encodedProductId) : null;

//   const [verified, setVerified] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [customerData, setCustomerData] = useState(null);
//   const [showAuthModal, setShowAuthModal] = useState(null);
//   const [modalAnimation, setModalAnimation] = useState("");
//   const [cartItems, setCartItems] = useState([]);
//   const [wishlist, setWishlist] = useState([]);
//   const [showCartModal, setShowCartModal] = useState(false);
//   const [cartAnimation, setCartAnimation] = useState("");
//   const [showOrdersModal, setShowOrdersModal] = useState(false);
//   const [ordersAnimation, setOrdersAnimation] = useState("");
//   const [headerSearch, setHeaderSearch] = useState("");
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   const showMessage = (msg, icon = "success") => {
//     Swal.fire({
//       text: msg,
//       icon: icon,
//       toast: true,
//       position: "bottom-end",
//       timer: 2000,
//       showConfirmButton: false,
//       timerProgressBar: false,
//       showClass: {
//         popup: "animate__animated animate__slideInUp",
//       },
//     });
//   };

//   useEffect(() => {
//     const token = localStorage.getItem("customerToken");
//     const storedCustomerId = localStorage.getItem("customerId");

//     console.log('CustomerPage.jsx - customerId:', customerId, 'storedCustomerId:', storedCustomerId);

//     if (location.pathname.startsWith("/customer") && (!token || !storedCustomerId)) {
//       navigate("/", { replace: true });
//       return;
//     }

//     if (!token || !storedCustomerId) {
//       if (location.pathname !== "/") {
//         navigate("/", { replace: true });
//         return;
//       }
//       setVerified(true);
//       setLoading(false);
//       return;
//     }

//     if (token && storedCustomerId && encodedCustomerId) {
//       const decodedId = decodeCustomerId(encodedCustomerId);
//       if (decodedId !== storedCustomerId) {
//         const params = new URLSearchParams(location.search);
//         params.set("customerId", btoa(storedCustomerId));
//         navigate(`/customer?${params.toString()}`, { replace: true });
//         return;
//       }
//     }

//     if (token && storedCustomerId && !encodedCustomerId) {
//       const params = new URLSearchParams(location.search);
//       params.set("customerId", btoa(storedCustomerId));
//       navigate(`/customer?${params.toString()}`, { replace: true });
//       return;
//     }

//     if (token && storedCustomerId && encodedCustomerId) {
//       const verifyCustomer = async () => {
//         try {
//           const response = await axios.get(
//             `https://suyambufoodproducts-demohost-4.onrender.com/api/customer/profile?customerId=${storedCustomerId}`,
//             {
//               headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${token}`,
//                 Origin: "http://localhost:5173",
//               },
//             }
//           );
//           setCustomerData(response.data);
//           setVerified(true);
//           await fetchCart();
//           await fetchWishlist();
//         } catch (err) {
//           console.error("Failed to verify customer:", err);
//           localStorage.removeItem("customerToken");
//           localStorage.removeItem("customerId");
//           navigate("/", { replace: true });
//         } finally {
//           setLoading(false);
//         }
//       };
//       verifyCustomer();
//     } else {
//       setLoading(false);
//     }
//   }, [encodedCustomerId, navigate, location.pathname, location.search]);

//   const fetchCart = async () => {
//     if (!customerId) return [];
//     try {
//       const response = await axios.get(
//         `https://suyambufoodproducts-demohost-4.onrender.com/api/customer/cart?customerId=${customerId}`,
//         { headers: { Origin: "http://localhost:5173" } }
//       );
//       console.log("CustomerPage.jsx - fetchCart response:", response.data);
//       setCartItems(Array.isArray(response.data) ? response.data : []);
//       return response.data || [];
//     } catch (err) {
//       console.error("Failed to fetch cart:", err);
//       showMessage(`Failed to fetch cart: ${err.response?.data?.error || err.message}`, "error");
//       return [];
//     }
//   };

//   const fetchWishlist = async () => {
//     if (!customerId) return;
//     try {
//       const response = await axios.get(
//         `https://suyambufoodproducts-demohost-4.onrender.com/api/customer/wishlist?customerId=${customerId}`,
//         { headers: { Origin: "http://localhost:5173" } }
//       );
//       setWishlist(
//         Array.isArray(response.data)
//           ? response.data.filter((item) => item.is_liked === 1).map((item) => item.product_id)
//           : []
//       );
//     } catch (err) {
//       console.error("Failed to fetch wishlist:", err);
//     }
//   };

//   const handleToggleWishlist = async (productId) => {
//     if (!customerId) return;
//     try {
//       const response = await axios.post(
//         "https://suyambufoodproducts-demohost-4.onrender.com/api/customer/wishlist",
//         { customerId, productId },
//         { headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" } }
//       );
//       if (response.data.is_liked === 1) {
//         setWishlist((prev) => [...prev, productId]);
//       } else {
//         setWishlist((prev) => prev.filter((id) => id !== productId));
//       }
//       showMessage(response.data.message);
//     } catch (err) {
//       console.error("Failed to toggle wishlist:", err);
//       showMessage(`Failed to toggle wishlist: ${err.response?.data?.error || err.message}`, "error");
//     }
//   };

//   const handleLoginClick = () => {
//     setModalAnimation("slide-in");
//     setShowAuthModal("login");
//   };

//   const handleRegisterClick = () => {
//     setModalAnimation("slide-in");
//     setShowAuthModal("register");
//   };

//   const handleCloseModal = () => {
//     setModalAnimation("slide-out");
//     setTimeout(() => {
//       setShowAuthModal(null);
//       setModalAnimation("");
//     }, 300);
//   };

//   const handleAuthSwitch = (mode) => {
//     setModalAnimation("fade-out");
//     setTimeout(() => {
//       setShowAuthModal(mode);
//       setModalAnimation("fade-in");
//     }, 300);
//   };

//   const handleCartClick = () => {
//     setCartAnimation("slide-in");
//     setShowCartModal(true);
//   };

//   const handleCloseCart = () => {
//     setCartAnimation("slide-out");
//     setTimeout(() => {
//       setShowCartModal(false);
//       setCartAnimation("");
//     }, 300);
//   };

//   const handleOrdersClick = () => {
//     setOrdersAnimation("slide-in");
//     setShowOrdersModal(true);
//   };

//   const handleCloseOrders = () => {
//     setOrdersAnimation("slide-out");
//     setTimeout(() => {
//       setShowOrdersModal(false);
//       setOrdersAnimation("");
//     }, 300);
//   };

//   const updateQuantity = async (variantId, change) => {
//     const item = cartItems.find((item) => String(item.product_variant_id) === String(variantId));
//     if (!item) return;
//     const newQuantity = Math.max(1, item.quantity + change);
//     try {
//       await axios.put(
//         "https://suyambufoodproducts-demohost-4.onrender.com/api/customer/cart",
//         { customerId, variantId, quantity: newQuantity },
//         { headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" } }
//       );
//       const updatedCart = await fetchCart();
//       setCartItems(updatedCart);
//       showMessage("Cart updated successfully");
//     } catch (err) {
//       console.error("Failed to update quantity:", err);
//       showMessage(`Failed to update quantity: ${err.response?.data?.error || err.message}`, "error");
//     }
//   };

//   const handleRemoveItem = async (variantId) => {
//     if (!customerId) return;
//     try {
//       await axios.delete(
//         `https://suyambufoodproducts-demohost-4.onrender.com/api/customer/cart?customerId=${customerId}&variantId=${variantId}`,
//         { headers: { Origin: "http://localhost:5173" } }
//       );
//       const updatedCart = await fetchCart();
//       setCartItems(updatedCart);
//       showMessage("Item removed from cart successfully");
//     } catch (err) {
//       console.error("Failed to remove item:", err);
//       showMessage(`Failed to remove item: ${err.response?.data?.error || err.message}`, "error");
//     }
//   };

//   const handleHomeClick = () => {
//     const params = new URLSearchParams();
//     if (customerId) {
//       params.set("customerId", btoa(customerId));
//     }
//     navigate(`/customer?${params.toString()}`);
//   };

//   const handleMenuClick = () => {
//     setIsMenuOpen(true);
//   };

//   const handleCloseMenu = () => {
//     setIsMenuOpen(false);
//   };

//   const handleSearchClick = () => {
//     // If on a product page, navigate to the landing page first
//     if (productId) {
//       const params = new URLSearchParams();
//       if (customerId) {
//         params.set("customerId", btoa(customerId));
//       }
//       navigate(`/customer?${params.toString()}`);
//       // Use setTimeout to allow navigation to complete before scrolling
//       setTimeout(() => {
//         const section = document.getElementById("shop-by-category");
//         if (section) {
//           section.scrollIntoView({ behavior: "smooth", block: "start" });
//           const searchInput = section.querySelector("input[type='text']");
//           if (searchInput) {
//             searchInput.focus();
//           }
//         }
//       }, 100);
//     } else {
//       // If already on landing page, scroll directly
//       const section = document.getElementById("shop-by-category");
//       if (section) {
//         section.scrollIntoView({ behavior: "smooth", block: "start" });
//         const searchInput = section.querySelector("input[type='text']");
//         if (searchInput) {
//           searchInput.focus();
//         }
//       }
//     }
//   };

//   const handleCategoryClick = (value) => {
//     window.dispatchEvent(new CustomEvent("setCategory", { detail: { value } }));
//     handleCloseMenu();
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="flex flex-col items-center">
//           <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
//           <p className="mt-4 text-gray-600">Loading fresh groceries...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!verified && location.pathname.startsWith("/customer")) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <p className="text-gray-600">Verifying your account...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col custom-scrollbar relative">
//       <Header
//         customerData={customerData}
//         onLoginClick={handleLoginClick}
//         onRegisterClick={handleRegisterClick}
//         cartItems={cartItems}
//         customerId={customerId}
//         fetchCart={fetchCart}
//         onCartClick={handleCartClick}
//         onOrdersClick={handleOrdersClick}
//         onSearch={(query) => setHeaderSearch(query)}
//         showHamburger={false}
//       />
//       <main className="flex-1 bg-gray-50 pt-20 pb-16 md:pb-0">
//         {productId ? (
//           <div className="md:px-8">
//             <SingleProduct
//               productId={productId}
//               isLoggedIn={!!customerData}
//               customerId={customerId}
//               cartItems={cartItems}
//               fetchCart={fetchCart}
//               wishlist={wishlist}
//               handleToggleWishlist={handleToggleWishlist}
//               showMessage={showMessage}
//             />
//           </div>
//         ) : (
//           <>
//             <Banner />
//             <div className="md:px-8 pt-4">
//               <Products
//                 isLoggedIn={!!customerData}
//                 customerId={customerId}
//                 cartItems={cartItems}
//                 setCartItems={setCartItems}
//                 fetchCart={fetchCart}
//                 wishlist={wishlist}
//                 handleToggleWishlist={handleToggleWishlist}
//                 showMessage={showMessage}
//                 headerSearchTerm={headerSearch}
//               />
//             </div>
//           </>
//         )}
//       </main>

//       {/* Bottom Navigation for Mobile */}
//       <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg flex justify-around items-center py-3 md:hidden z-50">
//         <button onClick={handleMenuClick} className="flex flex-col items-center text-gray-600 hover:text-green-500">
//           <Menu size={24} />
//           <span className="text-xs mt-1">Menu</span>
//         </button>
//         <button onClick={handleHomeClick} className="flex flex-col items-center text-gray-600 hover:text-green-500">
//           <Home size={24} />
//           <span className="text-xs mt-1">Home</span>
//         </button>
//         <button onClick={handleSearchClick} className="flex flex-col items-center text-gray-600 hover:text-green-500">
//           <Search size={24} />
//           <span className="text-xs mt-1">Search</span>
//         </button>
//       </div>

//       {/* Menu Side Panel */}
//       {isMenuOpen && (
//         <div
//           className="fixed inset-0 bg-opacity-50 z-50 flex"
//           onClick={handleCloseMenu}
//         >
//           <div
//             className="bg-white w-full h-full p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out translate-x-0"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <button onClick={handleCloseMenu} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
//               <X size={24} />
//             </button>
//             <h2 className="text-2xl font-bold mb-6">Menu</h2>

//             {/* Quick Links Accordion */}
//             <details className="mb-4">
//               <summary className="text-lg font-semibold cursor-pointer hover:text-green-500">Quick Links</summary>
//               <ul className="mt-2 space-y-2 pl-4 text-base">
//                 <li><a href="#" className="hover:underline">Shop</a></li>
//                 <li><a href="#" className="hover:underline">About Us</a></li>
//                 <li><a href="#" className="hover:underline">Contact</a></li>
//                 <li><a href="#" className="hover:underline">FAQs</a></li>
//               </ul>
//             </details>

//             {/* Categories Accordion */}
//             <details>
//               <summary className="text-lg font-semibold cursor-pointer hover:text-green-500">Categories</summary>
//               <ul className="mt-2 space-y-2 pl-4 text-base">
//                 <li>
//                   <button onClick={() => handleCategoryClick("oil items")} className="hover:underline w-full text-left">
//                     Oils
//                   </button>
//                 </li>
//                 <li>
//                   <button onClick={() => handleCategoryClick("snacks items")} className="hover:underline w-full text-left">
//                     Snacks
//                   </button>
//                 </li>
//                 <li>
//                   <button onClick={() => handleCategoryClick("sweet items")} className="hover:underline w-full text-left">
//                     Sweets
//                   </button>
//                 </li>
//                 <li>
//                   <button onClick={() => handleCategoryClick("masala powders")} className="hover:underline w-full text-left">
//                     Masala Powders
//                   </button>
//                 </li>
//                 <li>
//                   <button onClick={() => handleCategoryClick("dry fruits")} className="hover:underline w-full text-left">
//                     Dry Fruits
//                   </button>
//                 </li>
//               </ul>
//             </details>
//           </div>
//         </div>
//       )}

//       {showAuthModal && (
//         <div
//           className={`fixed inset-0 bg-opacity-50 flex z-50 transition-opacity duration-300 ${
//             modalAnimation.includes("in") ? "opacity-100" : "opacity-0"
//           }`}
//           onClick={handleCloseModal}
//         >
//           <div
//             className={`ml-auto h-full w-full sm:w-96 bg-white shadow-xl transform transition-transform duration-300 custom-scrollbar ${
//               modalAnimation === "slide-in"
//                 ? "translate-x-0"
//                 : modalAnimation === "slide-out"
//                 ? "translate-x-full"
//                 : "translate-x-full"
//             }`}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <button
//               onClick={handleCloseModal}
//               className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
//             >
//               <svg
//                 className="w-6 h-6"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M6 18L18 6M6 6l12 12"
//                 />
//               </svg>
//             </button>

//             <div
//               className={`transition-opacity duration-300 ${
//                 modalAnimation === "fade-in"
//                   ? "opacity-100"
//                   : modalAnimation === "fade-out"
//                   ? "opacity-0"
//                   : "opacity-100"
//               }`}
//             >
//               {showAuthModal === "login" ? (
//                 <CustomerLogin
//                   onRegisterClick={() => handleAuthSwitch("register")}
//                   onClose={handleCloseModal}
//                 />
//               ) : (
//                 <CustomerRegister
//                   onLoginClick={() => handleAuthSwitch("login")}
//                   onClose={handleCloseModal}
//                 />
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {showCartModal && (
//         <Cart
//           customerId={customerId}
//           cartItems={cartItems}
//           updateQuantity={updateQuantity}
//           handleRemoveItem={handleRemoveItem}
//           handleCloseCart={handleCloseCart}
//           showCartModal={showCartModal}
//           cartAnimation={cartAnimation}
//         />
//       )}

//       {showOrdersModal && (
//         <MyOrders
//           customerId={customerId}
//           handleCloseOrders={handleCloseOrders}
//           showOrdersModal={showOrdersModal}
//           ordersAnimation={ordersAnimation}
//         />
//       )}

//       <Footer />
//     </div>
//   );
// }





import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Header from "../components/CustomerComponents/Header";
import Banner from "../components/CustomerComponents/Banner";
import Products from "../components/CustomerComponents/Products";
import SingleProduct from "../components/CustomerComponents/SingleProduct";
import Footer from "../components/CustomerComponents/Footer";
import CustomerLogin from "../components/Authentication/CustomerLogin";
import CustomerRegister from "../components/Authentication/CustomerRegister";
import Cart from "../components/CustomerComponents/Cart";
import MyOrders from "../components/CustomerComponents/MyOrders";
import { Home, Menu, X, Search } from "lucide-react";

function decodeCustomerId(encodedId) {
  try {
    return atob(encodedId);
  } catch {
    console.error("Error decoding customerId:", encodedId);
    return null;
  }
}

function decodeProductId(encodedId) {
  try {
    const decoded = atob(encodedId);
    const idNum = parseInt(decoded, 10);
    if (isNaN(idNum)) {
      throw new Error("Invalid product ID");
    }
    return idNum.toString();
  } catch {
    console.error("Error decoding productId:", encodedId);
    return null;
  }
}

export default function CustomerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const encodedCustomerId = searchParams.get("customerId");
  const encodedProductId = searchParams.get("productId");
  const customerId = encodedCustomerId ? decodeCustomerId(encodedCustomerId) : null;
  const productId = encodedProductId ? decodeProductId(encodedProductId) : null;

  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(null);
  const [modalAnimation, setModalAnimation] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartAnimation, setCartAnimation] = useState("");
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [ordersAnimation, setOrdersAnimation] = useState("");
  const [headerSearch, setHeaderSearch] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const showMessage = (msg, icon = "success") => {
    Swal.fire({
      text: msg,
      icon: icon,
      toast: true,
      position: "bottom-end",
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: false,
      showClass: {
        popup: "animate__animated animate__slideInUp",
      },
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    const storedCustomerId = localStorage.getItem("customerId");

    console.log('CustomerPage.jsx - customerId:', customerId, 'storedCustomerId:', storedCustomerId);

    // If no token or storedCustomerId, allow rendering for non-logged-in users
    if (!token || !storedCustomerId) {
      setVerified(false);
      setLoading(false);
      return;
    }

    // Handle customerId in URL
    if (token && storedCustomerId && encodedCustomerId) {
      const decodedId = decodeCustomerId(encodedCustomerId);
      if (decodedId !== storedCustomerId) {
        const params = new URLSearchParams(location.search);
        params.set("customerId", btoa(storedCustomerId));
        navigate(`/customer?${params.toString()}`, { replace: true });
        return;
      }
    }

    // Add customerId to URL if logged in and not present
    if (token && storedCustomerId && !encodedCustomerId) {
      const params = new URLSearchParams(location.search);
      params.set("customerId", btoa(storedCustomerId));
      navigate(`/customer?${params.toString()}`, { replace: true });
      return;
    }

    // Verify customer if logged in
    if (token && storedCustomerId) {
      const verifyCustomer = async () => {
        try {
          const response = await axios.get(
            `https://suyambufoodproducts-demohost-4.onrender.com/api/customer/profile?customerId=${storedCustomerId}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                Origin: "http://localhost:5173",
              },
            }
          );
          setCustomerData(response.data);
          setVerified(true);
          await fetchCart();
          await fetchWishlist();
        } catch (err) {
          console.error("Failed to verify customer:", err);
          localStorage.removeItem("customerToken");
          localStorage.removeItem("customerId");
          setVerified(false);
        } finally {
          setLoading(false);
        }
      };
      verifyCustomer();
    } else {
      setLoading(false);
    }
  }, [encodedCustomerId, navigate, location.search]);

  const fetchCart = async () => {
    if (!customerId) return [];
    try {
      const response = await axios.get(
        `https://suyambufoodproducts-demohost-4.onrender.com/api/customer/cart?customerId=${customerId}`,
        { headers: { Origin: "http://localhost:5173" } }
      );
      console.log("CustomerPage.jsx - fetchCart response:", response.data);
      setCartItems(Array.isArray(response.data) ? response.data : []);
      return response.data || [];
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      showMessage(`Failed to fetch cart: ${err.response?.data?.error || err.message}`, "error");
      return [];
    }
  };

  const fetchWishlist = async () => {
    if (!customerId) return;
    try {
      const response = await axios.get(
        `https://suyambufoodproducts-demohost-4.onrender.com/api/customer/wishlist?customerId=${customerId}`,
        { headers: { Origin: "http://localhost:5173" } }
      );
      setWishlist(
        Array.isArray(response.data)
          ? response.data.filter((item) => item.is_liked === 1).map((item) => item.product_id)
          : []
      );
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  };

  const handleToggleWishlist = async (productId) => {
    if (!customerId) {
      showMessage("Please login to manage your wishlist", "warning");
      return;
    }
    try {
      const response = await axios.post(
        "https://suyambufoodproducts-demohost-4.onrender.com/api/customer/wishlist",
        { customerId, productId },
        { headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" } }
      );
      if (response.data.is_liked === 1) {
        setWishlist((prev) => [...prev, productId]);
      } else {
        setWishlist((prev) => prev.filter((id) => id !== productId));
      }
      showMessage(response.data.message);
    } catch (err) {
      console.error("Failed to toggle wishlist:", err);
      showMessage(`Failed to toggle wishlist: ${err.response?.data?.error || err.message}`, "error");
    }
  };

  const handleLoginClick = () => {
    setModalAnimation("slide-in");
    setShowAuthModal("login");
  };

  const handleRegisterClick = () => {
    setModalAnimation("slide-in");
    setShowAuthModal("register");
  };

  const handleCloseModal = () => {
    setModalAnimation("slide-out");
    setTimeout(() => {
      setShowAuthModal(null);
      setModalAnimation("");
    }, 300);
  };

  const handleAuthSwitch = (mode) => {
    setModalAnimation("fade-out");
    setTimeout(() => {
      setShowAuthModal(mode);
      setModalAnimation("fade-in");
    }, 300);
  };

  const handleCartClick = () => {
    if (!customerId) {
      showMessage("Please login to view your cart", "warning");
      return;
    }
    setCartAnimation("slide-in");
    setShowCartModal(true);
  };

  const handleCloseCart = () => {
    setCartAnimation("slide-out");
    setTimeout(() => {
      setShowCartModal(false);
      setCartAnimation("");
    }, 300);
  };

  const handleOrdersClick = () => {
    if (!customerId) {
      showMessage("Please login to view your orders", "warning");
      return;
    }
    setOrdersAnimation("slide-in");
    setShowOrdersModal(true);
  };

  const handleCloseOrders = () => {
    setOrdersAnimation("slide-out");
    setTimeout(() => {
      setShowOrdersModal(false);
      setOrdersAnimation("");
    }, 300);
  };

  const updateQuantity = async (variantId, change) => {
    if (!customerId) {
      showMessage("Please login to update your cart", "warning");
      return;
    }
    const item = cartItems.find((item) => String(item.product_variant_id) === String(variantId));
    if (!item) return;
    const newQuantity = Math.max(1, item.quantity + change);
    try {
      await axios.put(
        "https://suyambufoodproducts-demohost-4.onrender.com/api/customer/cart",
        { customerId, variantId, quantity: newQuantity },
        { headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" } }
      );
      const updatedCart = await fetchCart();
      setCartItems(updatedCart);
      showMessage("Cart updated successfully");
    } catch (err) {
      console.error("Failed to update quantity:", err);
      showMessage(`Failed to update quantity: ${err.response?.data?.error || err.message}`, "error");
    }
  };

  const handleRemoveItem = async (variantId) => {
    if (!customerId) {
      showMessage("Please login to manage your cart", "warning");
      return;
    }
    try {
      await axios.delete(
        `https://suyambufoodproducts-demohost-4.onrender.com/api/customer/cart?customerId=${customerId}&variantId=${variantId}`,
        { headers: { Origin: "http://localhost:5173" } }
      );
      const updatedCart = await fetchCart();
      setCartItems(updatedCart);
      showMessage("Item removed from cart successfully");
    } catch (err) {
      console.error("Failed to remove item:", err);
      showMessage(`Failed to remove item: ${err.response?.data?.error || err.message}`, "error");
    }
  };

  const handleHomeClick = () => {
    const params = new URLSearchParams();
    if (customerId) {
      params.set("customerId", btoa(customerId));
    }
    navigate(`/customer?${params.toString()}`);
  };

  const handleMenuClick = () => {
    setIsMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSearch = (query) => {
    setHeaderSearch(query);
    if (productId) {
      const params = new URLSearchParams();
      if (customerId) {
        params.set("customerId", btoa(customerId));
      }
      navigate(`/customer?${params.toString()}`);
    }
  };

  useEffect(() => {
    if (headerSearch && !productId) {
      const section = document.getElementById("shop-by-category");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [headerSearch, productId]);

  const handleSearchClick = () => {
    if (productId) {
      const params = new URLSearchParams();
      if (customerId) {
        params.set("customerId", btoa(customerId));
      }
      navigate(`/customer?${params.toString()}`);
      setTimeout(() => {
        const section = document.getElementById("shop-by-category");
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
          const searchInput = section.querySelector("input[type='text']");
          if (searchInput) {
            searchInput.focus();
          }
        }
      }, 100);
    } else {
      const section = document.getElementById("shop-by-category");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
        const searchInput = section.querySelector("input[type='text']");
        if (searchInput) {
          searchInput.focus();
        }
      }
    }
  };

  const handleCategoryClick = (value) => {
    window.dispatchEvent(new CustomEvent("setCategory", { detail: { value } }));
    handleCloseMenu();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading fresh groceries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col custom-scrollbar relative">
      <Header
        customerData={customerData}
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
        cartItems={cartItems}
        customerId={customerId}
        fetchCart={fetchCart}
        onCartClick={handleCartClick}
        onOrdersClick={handleOrdersClick}
        onSearch={handleSearch}
        showHamburger={false}
      />
      <main className="flex-1 bg-gray-50 pt-20 pb-16 md:pb-0">
        {productId ? (
          <div className="md:px-8">
            <SingleProduct
              productId={productId}
              isLoggedIn={!!customerData}
              customerId={customerId}
              cartItems={cartItems}
              fetchCart={fetchCart}
              wishlist={wishlist}
              handleToggleWishlist={handleToggleWishlist}
              showMessage={showMessage}
            />
          </div>
        ) : (
          <>
            <Banner />
            <div className="md:px-8 pt-4">
              <Products
                isLoggedIn={!!customerData}
                customerId={customerId}
                cartItems={cartItems}
                setCartItems={setCartItems}
                fetchCart={fetchCart}
                wishlist={wishlist}
                handleToggleWishlist={handleToggleWishlist}
                showMessage={showMessage}
                headerSearchTerm={headerSearch}
              />
            </div>
          </>
        )}
      </main>

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg flex justify-around items-center py-3 md:hidden z-50">
        <button onClick={handleMenuClick} className="flex flex-col items-center text-gray-600 hover:text-green-500">
          <Menu size={24} />
          <span className="text-xs mt-1">Menu</span>
        </button>
        <button onClick={handleHomeClick} className="flex flex-col items-center text-gray-600 hover:text-green-500">
          <Home size={24} />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button onClick={handleSearchClick} className="flex flex-col items-center text-gray-600 hover:text-green-500">
          <Search size={24} />
          <span className="text-xs mt-1">Search</span>
        </button>
      </div>

      {/* Menu Side Panel */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-50 flex"
          onClick={handleCloseMenu}
        >
          <div
            className="bg-white w-full h-full p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out translate-x-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={handleCloseMenu} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6">Menu</h2>

            {/* Quick Links Accordion */}
            <details className="mb-4">
              <summary className="text-lg font-semibold cursor-pointer hover:text-green-500">Quick Links</summary>
              <ul className="mt-2 space-y-2 pl-4 text-base">
                <li><a href="#" className="hover:underline">Shop</a></li>
                <li><a href="#" className="hover:underline">About Us</a></li>
                <li><a href="#" className="hover:underline">Contact</a></li>
                <li><a href="#" className="hover:underline">FAQs</a></li>
              </ul>
            </details>

            {/* Categories Accordion */}
            <details>
              <summary className="text-lg font-semibold cursor-pointer hover:text-green-500">Categories</summary>
              <ul className="mt-2 space-y-2 pl-4 text-base">
                <li>
                  <button onClick={() => handleCategoryClick("oil items")} className="hover:underline w-full text-left">
                    Oils
                  </button>
                </li>
                <li>
                  <button onClick={() => handleCategoryClick("snacks items")} className="hover:underline w-full text-left">
                    Snacks
                  </button>
                </li>
                <li>
                  <button onClick={() => handleCategoryClick("sweet items")} className="hover:underline w-full text-left">
                    Sweets
                  </button>
                </li>
                <li>
                  <button onClick={() => handleCategoryClick("masala powders")} className="hover:underline w-full text-left">
                    Masala Powders
                  </button>
                </li>
                <li>
                  <button onClick={() => handleCategoryClick("dry fruits")} className="hover:underline w-full text-left">
                    Dry Fruits
                  </button>
                </li>
              </ul>
            </details>
          </div>
        </div>
      )}

      {showAuthModal && (
        <div
          className={`fixed inset-0 bg-opacity-50 flex z-50 transition-opacity duration-300 ${
            modalAnimation.includes("in") ? "opacity-100" : "opacity-0"
          }`}
          onClick={handleCloseModal}
        >
          <div
            className={`ml-auto h-full w-full sm:w-96 bg-white shadow-xl transform transition-transform duration-300 custom-scrollbar ${
              modalAnimation === "slide-in"
                ? "translate-x-0"
                : modalAnimation === "slide-out"
                ? "translate-x-full"
                : "translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div
              className={`transition-opacity duration-300 ${
                modalAnimation === "fade-in"
                  ? "opacity-100"
                  : modalAnimation === "fade-out"
                  ? "opacity-0"
                  : "opacity-100"
              }`}
            >
              {showAuthModal === "login" ? (
                <CustomerLogin
                  onRegisterClick={() => handleAuthSwitch("register")}
                  onClose={handleCloseModal}
                />
              ) : (
                <CustomerRegister
                  onLoginClick={() => handleAuthSwitch("login")}
                  onClose={handleCloseModal}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {showCartModal && (
        <Cart
          customerId={customerId}
          cartItems={cartItems}
          updateQuantity={updateQuantity}
          handleRemoveItem={handleRemoveItem}
          handleCloseCart={handleCloseCart}
          showCartModal={showCartModal}
          cartAnimation={cartAnimation}
        />
      )}

      {showOrdersModal && (
        <MyOrders
          customerId={customerId}
          handleCloseOrders={handleCloseOrders}
          showOrdersModal={showOrdersModal}
          ordersAnimation={ordersAnimation}
        />
      )}

      <Footer />
    </div>
  );
}