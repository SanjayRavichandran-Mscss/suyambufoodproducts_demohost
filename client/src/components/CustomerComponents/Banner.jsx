// // client/src/components/CustomerComponents/Banner.jsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import axios from "axios";
// import {
//   Sprout,
//   CookingPot,
//   ShieldCheck,
//   Heart,
//   LayoutGrid,
//   Droplet,
//   Leaf,
//   Candy,
//   CandyCane,
//   LeafyGreen,
//   PackageCheck,
// } from "lucide-react";

// const IMAGE_BASE = "https://suyambufoodproducts-demohost-4.onrender.com";
// const BRAND = "#B6895B";
// const BRAND_HOVER = "#A7784D";

// const normalizeImage = (img) => {
//   if (!img) return "https://via.placeholder.com/1200x675";
//   if (img.startsWith("http://") || img.startsWith("https://")) return img;
//   if (img.startsWith("/")) return `${IMAGE_BASE}${img}`;
//   return `${IMAGE_BASE}/${img}`;
// };

// export default function Banner() {
//   const [allProducts, setAllProducts] = useState([]);
//   const [idx, setIdx] = useState(0);

//   const scrollerRef = useRef(null);
//   const timerRef = useRef(null);
//   const isUserInteractingRef = useRef(false);

//   // WHY CHOOSE: custom scrollbar
//   const featuresWrapRef = useRef(null);
//   const trackRef = useRef(null);
//   const [thumb, setThumb] = useState({ width: 60, left: 0 });
//   const draggingRef = useRef(false);
//   const dragOffsetRef = useRef(0);

//   // Dispatch category change to Products and scroll to grid
//   const setCategoryFromBanner = (value) => {
//     window.dispatchEvent(new CustomEvent("setCategory", { detail: { value } }));
//     const el = document.getElementById("shop-by-category");
//     if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
//   };

//   // Fetch products for slides
//   useEffect(() => {
//     let mounted = true;
//     axios
//       .get("https://suyambufoodproducts-demohost-4.onrender.com/api/admin/products", {
//         headers: { Origin: "http://localhost:5173" },
//       })
//       .then((res) => {
//         if (!mounted) return;
//         const list = Array.isArray(res.data) ? res.data : [];
//         const normalized = list.map((p) => ({
//           id: p.id,
//           name: p.name,
//           description: p.description,
//           image: normalizeImage(p.thumbnail_url),
//         }));
//         setAllProducts(normalized);
//       })
//       .catch(() => setAllProducts([]));
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const slides = useMemo(() => allProducts.slice(0, 4), [allProducts]);

//   // Keep dots in sync while sliding
//   useEffect(() => {
//     const el = scrollerRef.current;
//     if (!el) return;
//     const onScroll = () => {
//       const w = el.clientWidth || 1;
//       const newIndex = Math.round(el.scrollLeft / w);
//       setIdx(newIndex);
//     };
//     el.addEventListener("scroll", onScroll, { passive: true });
//     return () => el.removeEventListener("scroll", onScroll);
//   }, []);

//   // Auto-advance every 10 seconds; pause during user drag
//   useEffect(() => {
//     const el = scrollerRef.current;
//     if (!el || slides.length <= 1) return;

//     const start = () => {
//       clearInterval(timerRef.current);
//       timerRef.current = setInterval(() => {
//         if (isUserInteractingRef.current) return;
//         const w = el.clientWidth;
//         const next = (idx + 1) % slides.length;
//         el.scrollTo({ left: next * w, behavior: "smooth" });
//       }, 3000);
//     };

//     start();
//     return () => clearInterval(timerRef.current);
//   }, [idx, slides.length]);

//   // Track user interaction to pause/resume auto-slide
//   useEffect(() => {
//     const el = scrollerRef.current;
//     if (!el) return;

//     const setTrue = () => (isUserInteractingRef.current = true);
//     const setFalseSoon = () =>
//       setTimeout(() => {
//         isUserInteractingRef.current = false;
//       }, 1200);

//     el.addEventListener("pointerdown", setTrue, { passive: true });
//     el.addEventListener("pointerup", setFalseSoon, { passive: true });
//     el.addEventListener("pointercancel", setFalseSoon, { passive: true });
//     el.addEventListener("touchstart", setTrue, { passive: true });
//     el.addEventListener("touchend", setFalseSoon, { passive: true });

//     return () => {
//       el.removeEventListener("pointerdown", setTrue);
//       el.removeEventListener("pointerup", setFalseSoon);
//       el.removeEventListener("pointercancel", setFalseSoon);
//       el.removeEventListener("touchstart", setTrue);
//       el.removeEventListener("touchend", setFalseSoon);
//     };
//   }, []);

//   const handleViewProducts = () => {
//     const el = document.getElementById("shop-by-category");
//     if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
//   };

//   // Pastel palette for product tiles
//   const pastel = {
//     all:   { bg: "#EEE9E2", fg: "#152238", icon: "#7C7B85", border: "#D4C8BA" },
//     oils:  { bg: "#EFE5C7", fg: "#152238", icon: "#7A6B3A" },
//     snacks:{ bg: "#E2EDD9", fg: "#152238", icon: "#56724B" },
//     sweets:{ bg: "#DCECF4", fg: "#152238", icon: "#436B82" },
//     masala:{ bg: "#F2D7DB", fg: "#152238", icon: "#8B474F" },
//     dry:   { bg: "#EADAC7", fg: "#152238", icon: "#715A3E" },
//   };

//   // Replace with live counts if available
//   const counts = { all: 22, oils: 4, snacks: 4, sweets: 5, masala: 5, dry: 4 };

//   const categoryTiles = [
//     { key: "all",    label: "All",             value: "all",             Icon: LayoutGrid,  colors: pastel.all,    count: counts.all },
//     { key: "oils",   label: "Oils",            value: "oil items",       Icon: Droplet,     colors: pastel.oils,   count: counts.oils },
//     { key: "snacks", label: "Snacks",          value: "snacks items",    Icon: Leaf,        colors: pastel.snacks, count: counts.snacks },
//     { key: "sweets", label: "Sweets",          value: "sweet items",     Icon: Candy,       colors: pastel.sweets, count: counts.sweets },
//     { key: "masala", label: "Masala Powders",  value: "masala powders",  Icon: CandyCane,   colors: pastel.masala, count: counts.masala },
//     { key: "dry",    label: "Dry fruits",      value: "dry fruits",      Icon: LeafyGreen,  colors: pastel.dry,    count: counts.dry },
//   ];

//   // WHY CHOOSE features
//   const features = [
//     { Icon: Sprout, title: "100% Organic", desc: "Certified organic farms." },
//     { Icon: CookingPot, title: "Homemade", desc: "Traditional recipes." },
//     { Icon: ShieldCheck, title: "No Preservatives", desc: "Pure and natural." },
//     { Icon: Heart, title: "Traditional Taste", desc: "Authentic flavors." },
//     { Icon: Leaf, title: "Quality Ingredients", desc: "Finest natural ingredients." },
//     { Icon: PackageCheck, title: "Hygienically Packed", desc: "Safe and clean packaging." },
//   ];

//   // Custom scrollbar sync (Why Choose row)
//   const refreshThumb = () => {
//     const wrap = featuresWrapRef.current;
//     const track = trackRef.current;
//     if (!wrap || !track) return;
//     const { scrollWidth, clientWidth, scrollLeft } = wrap;
//     const trackWidth = track.clientWidth;
//     const minThumb = 80;
//     const width =
//       scrollWidth > 0
//         ? Math.max((clientWidth / scrollWidth) * trackWidth, minThumb)
//         : trackWidth;
//     const maxLeft = Math.max(trackWidth - width, 0);
//     const left =
//       scrollWidth - clientWidth > 0
//         ? (scrollLeft / (scrollWidth - clientWidth)) * maxLeft
//         : 0;
//     setThumb({ width, left });
//   };

//   useEffect(() => {
//     const wrap = featuresWrapRef.current;
//     if (!wrap) return;
//     const onScroll = () => refreshThumb();
//     const onResize = () => refreshThumb();
//     wrap.addEventListener("scroll", onScroll, { passive: true });
//     window.addEventListener("resize", onResize, { passive: true });
//     refreshThumb();
//     return () => {
//       wrap.removeEventListener("scroll", onScroll);
//       window.removeEventListener("resize", onResize);
//     };
//   }, []);

//   // Dragging the thumb
//   useEffect(() => {
//     const onMove = (e) => {
//       if (!draggingRef.current) return;
//       const wrap = featuresWrapRef.current;
//       const track = trackRef.current;
//       if (!wrap || !track) return;
//       const trackRect = track.getBoundingClientRect();
//       const pointerX = e.touches ? e.touches[0].clientX : e.clientX;
//       const x = pointerX - trackRect.left - dragOffsetRef.current;
//       const clampedLeft = Math.max(0, Math.min(x, trackRect.width - thumb.width));
//       const ratio = clampedLeft / (trackRect.width - thumb.width || 1);
//       const newScroll =
//         ratio * (wrap.scrollWidth - wrap.clientWidth || 0);
//       wrap.scrollTo({ left: newScroll, behavior: "auto" });
//       setThumb((t) => ({ ...t, left: clampedLeft }));
//     };

//     const onUp = () => {
//       draggingRef.current = false;
//       document.body.style.userSelect = "";
//     };

//     window.addEventListener("mousemove", onMove, { passive: false });
//     window.addEventListener("mouseup", onUp, { passive: true });
//     window.addEventListener("touchmove", onMove, { passive: false });
//     window.addEventListener("touchend", onUp, { passive: true });

//     return () => {
//       window.removeEventListener("mousemove", onMove);
//       window.removeEventListener("mouseup", onUp);
//       window.removeEventListener("touchmove", onMove);
//       window.removeEventListener("touchend", onUp);
//     };
//   }, [thumb.width]);

//   const startDrag = (e) => {
//     draggingRef.current = true;
//     const track = trackRef.current;
//     if (!track) return;
//     const trackRect = track.getBoundingClientRect();
//     const pointerX = e.touches ? e.touches[0].clientX : e.clientX;
//     const offsetWithinThumb = pointerX - (trackRect.left + thumb.left);
//     dragOffsetRef.current = Math.max(0, Math.min(offsetWithinThumb, thumb.width));
//     document.body.style.userSelect = "none";
//   };

//   return (
//     <>
//       {/* HERO SLIDER */}
//       <section className="relative overflow-hidden bg-[#F3F5F7]">
//         <div className="container mx-auto px-4 py-10 md:py-14">
//           <div
//             ref={scrollerRef}
//             className="
//               relative flex overflow-x-auto snap-x snap-mandatory scroll-smooth
//               [-ms-overflow-style:none] [scrollbar-width:none]
//             "
//             style={{ scrollBehavior: "smooth" }}
//           >
//             <style>{`.snap-track::-webkit-scrollbar{display:none}`}</style>
//             <div className="snap-track grid grid-flow-col auto-cols-[100%] w-full">
//               {(slides.length ? slides : [{ id: 0 }]).map((p, i) => (
//                 <article key={p.id ?? i} className="w-full snap-start">
//                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
//                     {/* Image */}
//                     <div className="rounded-2xl overflow-hidden shadow bg-white/60">
//                       <div className="w-full aspect-video md:aspect-[5/3] lg:aspect-[16/9]">
//                         {p.image ? (
//                           <img
//                             src={p.image}
//                             alt={p.name || "Featured"}
//                             className="h-full w-full object-cover"
//                             onError={(e) => {
//                               e.currentTarget.src =
//                                 "https://via.placeholder.com/1200x675";
//                             }}
//                           />
//                         ) : (
//                           <div className="h-full w-full" />
//                         )}
//                       </div>
//                     </div>

//                <div className="flex flex-col gap-4">
//     <span className="w-max rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
//       PURE, HANDMADE, ORGANIC
//     </span>
//     <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-gray-900">
//       {p.name || "Featured Product"}
//     </h1>
//     <p className="text-gray-600 text-base md:text-lg">
//       {p.description || "Carefully crafted, fresh and organic."}
//     </p>
//     <button
//       onClick={handleViewProducts}
//       className="rounded-full px-6 py-3 font-semibold shadow transition text-white"
//       style={{ backgroundColor: BRAND }}
//       onMouseEnter={(e) =>
//         (e.currentTarget.style.backgroundColor = BRAND_HOVER)
//       }
//       onMouseLeave={(e) =>
//         (e.currentTarget.style.backgroundColor = BRAND)
//       }
//     >
//       View Product
//     </button>
//   </div>
//                   </div>
//                 </article>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* WHY CHOOSE — scrollable row with custom line/scrollbar */}
//       <section className="bg-white">
//         <div className="container mx-auto px-4 py-10 md:py-14">
//           <h2 className="text-center font-extrabold text-gray-900 text-3xl md:text-4xl">
//             Why Choose Suyambu?
//           </h2>

//           {/* Scroll row */}
//           <div
//             ref={featuresWrapRef}
//             className="
//               mt-8 overflow-x-auto scroll-smooth
//               snap-x snap-mandatory flex gap-5 px-1
//               [-ms-overflow-style:none] [scrollbar-width:none]
//             "
//           >
//             <style>{`.why-scroll::-webkit-scrollbar{display:none}`}</style>
//             {features.map(({ Icon, title, desc }, i) => (
//               <div
//                 key={title + i}
//                 className="snap-start min-w-[280px] md:min-w-[320px]"
//               >
//                 <div
//                   className="
//                     rounded-2xl border border-gray-200 bg-[#F9FAFB]
//                     px-8 py-8 shadow-sm h-full
//                     flex flex-col items-center text-center gap-3
//                   "
//                 >
//                   <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center">
//                     <Icon className="text-[#5F8F48]" size={28} />
//                   </div>
//                   <h3 className="text-lg font-semibold text-[#0F172A]">
//                     {title}
//                   </h3>
//                   <p className="text-sm text-[#6B7280]">{desc}</p>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Custom scroll line (track + draggable thumb) */}
//           <div className="mt-6 px-1">
//             <div ref={trackRef} className="relative h-1.5 w-full rounded-full bg-[#E5E7EB]">
//               <div
//                 onMouseDown={startDrag}
//                 onTouchStart={startDrag}
//                 className="absolute top-0 h-1.5 rounded-full bg-[#9CA3AF] cursor-pointer"
//                 style={{ width: `${thumb.width}px`, left: `${thumb.left}px` }}
//                 aria-label="Scroll features"
//               />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* OUR PRODUCTS SECTION (tiles exactly like screenshot) */}
//       <section className="bg-white">
//         <div className="container mx-auto px-4 py-10 md:py-14">
//           <h2 className="text-center font-extrabold text-gray-900 text-3xl md:text-4xl">
//             Our Products
//           </h2>
//           <p className="mt-3 text-center text-gray-600 max-w-4xl mx-auto text-[18px] leading-7">
//             Browse our collection of authentic, homemade organic products. Every item is
//             crafted with care to bring you the best of nature.
//           </p>

//           <div className="mt-7 flex flex-wrap items-center justify-center gap-5">
//             {categoryTiles.map((t, i) => {
//               const active = i === 0; // highlight "All"
//               return (
//                 <button
//                   key={t.key}
//                   onClick={() => setCategoryFromBanner(t.value)}
//                   className={`
//                     group w-[190px] h-[120px] rounded-xl px-4 py-4 text-center border transition
//                     ${active ? "shadow-md" : "shadow-sm hover:shadow-md"}
//                   `}
//                   style={{
//                     backgroundColor: t.colors.bg,
//                     color: t.colors.fg,
//                     borderColor: active ? t.colors.border : "transparent",
//                   }}
//                   aria-label={`Filter ${t.label}`}
//                 >
//                   <div className="flex flex-col items-center justify-center gap-2">
//                     <div
//                       className="h-8 w-8 grid place-items-center rounded-md"
//                       style={{ color: t.colors.icon }}
//                     >
//                       <t.Icon size={22} />
//                     </div>
//                     <div className="text-[15px] font-semibold leading-5">{t.label}</div>
//                     <div className="text-[12px] text-[#7E8AA0] leading-4">
//                       ({t.count} items)
//                     </div>
//                   </div>
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       </section>
//     </>
//   );
// }









// client/src/components/CustomerComponents/Banner.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Sprout,
  CookingPot,
  ShieldCheck,
  Heart,
  LayoutGrid,
  Droplet,
  Leaf,
  Candy,
  CandyCane,
  LeafyGreen,
  PackageCheck,
} from "lucide-react";

const IMAGE_BASE = "https://suyambufoodproducts-demohost-4.onrender.com";
const BRAND = "#B6895B";
const BRAND_HOVER = "#A7784D";

const normalizeImage = (img) => {
  if (!img) return "https://via.placeholder.com/1200x675";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  if (img.startsWith("/")) return `${IMAGE_BASE}${img}`;
  return `${IMAGE_BASE}/${img}`;
};

export default function Banner({ productsData }) {
  const [allProducts, setAllProducts] = useState(productsData || []);
  const [idx, setIdx] = useState(0);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0); // To track active category tile

  const scrollerRef = useRef(null);
  const timerRef = useRef(null);
  const isUserInteractingRef = useRef(false);

  // WHY CHOOSE: custom scrollbar
  const featuresWrapRef = useRef(null);
  const trackRef = useRef(null);
  const [thumb, setThumb] = useState({ width: 60, left: 0 });
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef(0);

  // Dispatch category change to Products and scroll to grid
  const setCategoryFromBanner = (value, index) => {
    setActiveCategoryIndex(index);
    window.dispatchEvent(new CustomEvent("setCategory", { detail: { value } }));
    const el = document.getElementById("shop-by-category");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Fetch products for slides if no prop provided
  useEffect(() => {
    if (productsData && productsData.length > 0) {
      setAllProducts(
        productsData.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          image: normalizeImage(p.thumbnail_url),
          category: p.category_name,
        }))
      );
      return;
    }

    let mounted = true;
    axios
      .get("https://suyambufoodproducts-demohost-4.onrender.com/api/admin/products", {
        headers: { Origin: "http://localhost:5173" },
      })
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res.data) ? res.data : [];
        const normalized = list.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          image: normalizeImage(p.thumbnail_url),
          category: p.category_name,
        }));
        setAllProducts(normalized);
      })
      .catch(() => setAllProducts([]));
    return () => {
      mounted = false;
    };
  }, [productsData]);

  const slides = useMemo(() => allProducts.slice(0, 4), [allProducts]);

  // Keep dots in sync while sliding
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const w = el.clientWidth || 1;
      const newIndex = Math.round(el.scrollLeft / w);
      setIdx(newIndex);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-advance every 3 seconds; pause during user drag
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || slides.length <= 1) return;

    const start = () => {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (isUserInteractingRef.current) return;
        const w = el.clientWidth;
        const next = (idx + 1) % slides.length;
        el.scrollTo({ left: next * w, behavior: "smooth" });
      }, 3000);
    };

    start();
    return () => clearInterval(timerRef.current);
  }, [idx, slides.length]);

  // Track user interaction to pause/resume auto-slide
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const setTrue = () => (isUserInteractingRef.current = true);
    const setFalseSoon = () =>
      setTimeout(() => {
        isUserInteractingRef.current = false;
      }, 1200);

    el.addEventListener("pointerdown", setTrue, { passive: true });
    el.addEventListener("pointerup", setFalseSoon, { passive: true });
    el.addEventListener("pointercancel", setFalseSoon, { passive: true });
    el.addEventListener("touchstart", setTrue, { passive: true });
    el.addEventListener("touchend", setFalseSoon, { passive: true });

    return () => {
      el.removeEventListener("pointerdown", setTrue);
      el.removeEventListener("pointerup", setFalseSoon);
      el.removeEventListener("pointercancel", setFalseSoon);
      el.removeEventListener("touchstart", setTrue);
      el.removeEventListener("touchend", setFalseSoon);
    };
  }, []);

  const handleViewProducts = () => {
    const el = document.getElementById("shop-by-category");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Pastel palette for product tiles
  const pastel = {
    all: { bg: "#EEE9E2", fg: "#152238", icon: "#7C7B85", border: "#B6895B" }, // brown border for active state
    oils: { bg: "#EFE5C7", fg: "#152238", icon: "#7A6B3A", border: "#B6895B" },
    snacks: { bg: "#E2EDD9", fg: "#152238", icon: "#56724B", border: "#B6895B" },
    sweets: { bg: "#DCECF4", fg: "#152238", icon: "#436B82", border: "#B6895B" },
    masala: { bg: "#F2D7DB", fg: "#152238", icon: "#8B474F", border: "#B6895B" },
    dry: { bg: "#EADAC7", fg: "#152238", icon: "#715A3E", border: "#B6895B" },
  };

  // Dynamic counts based on actual category names from products
  const counts = useMemo(() => {
    const categoryMatches = {
      oils: "oil items",
      snacks: "snacks items",
      sweets: "sweet items",
      masala: "masala powders",
      dry: "dry fruits",
    };

    const catCounts = {};
    Object.keys(categoryMatches).forEach((key) => {
      const matchValue = categoryMatches[key];
      catCounts[key] = allProducts.filter(
        (p) => p.category && p.category.toLowerCase() === matchValue.toLowerCase()
      ).length;
    });
    catCounts.all = allProducts.length;
    return catCounts;
  }, [allProducts]);

  const categoryTiles = useMemo(
    () => [
      {
        key: "all",
        label: "All",
        value: "all",
        Icon: LayoutGrid,
        colors: pastel.all,
        count: counts.all,
      },
      {
        key: "oils",
        label: "Oils",
        value: "oil items",
        Icon: Droplet,
        colors: pastel.oils,
        count: counts.oils,
      },
      {
        key: "snacks",
        label: "Snacks",
        value: "snacks items",
        Icon: Leaf,
        colors: pastel.snacks,
        count: counts.snacks,
      },
      {
        key: "sweets",
        label: "Sweets",
        value: "sweet items",
        Icon: Candy,
        colors: pastel.sweets,
        count: counts.sweets,
      },
      {
        key: "masala",
        label: "Masala Powders",
        value: "masala powders",
        Icon: CandyCane,
        colors: pastel.masala,
        count: counts.masala,
      },
      {
        key: "dry",
        label: "Dry fruits",
        value: "dry fruits",
        Icon: LeafyGreen,
        colors: pastel.dry,
        count: counts.dry,
      },
    ],
    [counts]
  );

  // WHY CHOOSE features
  const features = [
    { Icon: Sprout, title: "100% Organic", desc: "Certified organic farms." },
    { Icon: CookingPot, title: "Homemade", desc: "Traditional recipes." },
    { Icon: ShieldCheck, title: "No Preservatives", desc: "Pure and natural." },
    { Icon: Heart, title: "Traditional Taste", desc: "Authentic flavors." },
    { Icon: Leaf, title: "Quality Ingredients", desc: "Finest natural ingredients." },
    { Icon: PackageCheck, title: "Hygienically Packed", desc: "Safe and clean packaging." },
  ];

  // Custom scrollbar sync (Why Choose row)
  const refreshThumb = () => {
    const wrap = featuresWrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;
    const { scrollWidth, clientWidth, scrollLeft } = wrap;
    const trackWidth = track.clientWidth;
    const minThumb = 80;
    const width =
      scrollWidth > 0
        ? Math.max((clientWidth / scrollWidth) * trackWidth, minThumb)
        : trackWidth;
    const maxLeft = Math.max(trackWidth - width, 0);
    const left =
      scrollWidth - clientWidth > 0
        ? (scrollLeft / (scrollWidth - clientWidth)) * maxLeft
        : 0;
    setThumb({ width, left });
  };

  useEffect(() => {
    const wrap = featuresWrapRef.current;
    if (!wrap) return;
    const onScroll = () => refreshThumb();
    const onResize = () => refreshThumb();
    wrap.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    refreshThumb();
    return () => {
      wrap.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Dragging the thumb
  useEffect(() => {
    const onMove = (e) => {
      if (!draggingRef.current) return;
      const wrap = featuresWrapRef.current;
      const track = trackRef.current;
      if (!wrap || !track) return;
      const trackRect = track.getBoundingClientRect();
      const pointerX = e.touches ? e.touches[0].clientX : e.clientX;
      const x = pointerX - trackRect.left - dragOffsetRef.current;
      const clampedLeft = Math.max(0, Math.min(x, trackRect.width - thumb.width));
      const ratio = clampedLeft / (trackRect.width - thumb.width || 1);
      const newScroll = ratio * (wrap.scrollWidth - wrap.clientWidth || 0);
      wrap.scrollTo({ left: newScroll, behavior: "auto" });
      setThumb((t) => ({ ...t, left: clampedLeft }));
    };

    const onUp = () => {
      draggingRef.current = false;
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [thumb.width]);

  const startDrag = (e) => {
    draggingRef.current = true;
    const track = trackRef.current;
    if (!track) return;
    const trackRect = track.getBoundingClientRect();
    const pointerX = e.touches ? e.touches[0].clientX : e.clientX;
    const offsetWithinThumb = pointerX - (trackRect.left + thumb.left);
    dragOffsetRef.current = Math.max(0, Math.min(offsetWithinThumb, thumb.width));
    document.body.style.userSelect = "none";
  };

  return (
    <>
      {/* HERO SLIDER */}
      <section className="relative overflow-hidden bg-[#F3F5F7]">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div
            ref={scrollerRef}
            className="
              relative flex overflow-x-auto snap-x snap-mandatory scroll-smooth
              [-ms-overflow-style:none] [scrollbar-width:none]
            "
            style={{ scrollBehavior: "smooth" }}
          >
            <style>{`.snap-track::-webkit-scrollbar{display:none}`}</style>
            <div className="snap-track grid grid-flow-col auto-cols-[100%] w-full">
              {(slides.length ? slides : [{ id: 0 }]).map((p, i) => (
                <article key={p.id ?? i} className="w-full snap-start">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Image */}
                    <div className="rounded-2xl overflow-hidden shadow bg-white/60">
                      <div className="w-full aspect-video md:aspect-[5/3] lg:aspect-[16/9]">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name || "Featured"}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://via.placeholder.com/1200x675";
                            }}
                          />
                        ) : (
                          <div className="h-full w-full" />
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <span className="w-max rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                        PURE, HANDMADE, ORGANIC
                      </span>
                      <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-gray-900">
                        {p.name || "Featured Product"}
                      </h1>
                      <p className="text-gray-600 text-base md:text-lg">
                        {p.description || "Carefully crafted, fresh and organic."}
                      </p>
                      <button
                        onClick={handleViewProducts}
                        className="rounded-full px-6 py-3 font-semibold shadow transition text-white"
                        style={{ backgroundColor: BRAND }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = BRAND_HOVER)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = BRAND)
                        }
                      >
                        View Product
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE — scrollable row with custom line/scrollbar */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <h2 className="text-center font-extrabold text-gray-900 text-3xl md:text-4xl">
            Why Choose Suyambu?
          </h2>

          {/* Scroll row */}
          <div
            ref={featuresWrapRef}
            className="
              mt-8 overflow-x-auto scroll-smooth
              snap-x snap-mandatory flex gap-5 px-1
              [-ms-overflow-style:none] [scrollbar-width:none]
            "
          >
            <style>{`.why-scroll::-webkit-scrollbar{display:none}`}</style>
            {features.map(({ Icon, title, desc }, i) => (
              <div key={title + i} className="snap-start min-w-[280px] md:min-w-[320px]">
                <div
                  className="
                    rounded-2xl border border-gray-200 bg-[#F9FAFB]
                    px-8 py-8 shadow-sm h-full
                    flex flex-col items-center text-center gap-3
                  "
                >
                  <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <Icon className="text-[#5F8F48]" size={28} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0F172A]">{title}</h3>
                  <p className="text-sm text-[#6B7280]">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Custom scroll line (track + draggable thumb) */}
          <div className="mt-6 px-1">
            <div ref={trackRef} className="relative h-1.5 w-full rounded-full bg-[#E5E7EB]">
              <div
                onMouseDown={startDrag}
                onTouchStart={startDrag}
                className="absolute top-0 h-1.5 rounded-full bg-[#9CA3AF] cursor-pointer"
                style={{ width: `${thumb.width}px`, left: `${thumb.left}px` }}
                aria-label="Scroll features"
              />
            </div>
          </div>
        </div>
      </section>

      {/* OUR PRODUCTS SECTION (dynamic tiles and description) */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <h2 className="text-center font-extrabold text-gray-900 text-3xl md:text-4xl">
            Our Products
          </h2>
          <p className="mt-3 text-center text-gray-600 max-w-4xl mx-auto text-[18px] leading-7">
            Browse our collection of {allProducts.length} authentic, homemade organic products. Every item is
            crafted with care to bring you the best of nature.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-5">
            {categoryTiles.map((t, i) => {
              const active = i === activeCategoryIndex;
              return (
                <button
                  key={t.key}
                  onClick={() => setCategoryFromBanner(t.value, i)}
                  className={`
                    group w-[110px] h-[110px] rounded-xl px-4 py-3 text-center border transition
                    ${active ? "shadow-md" : "shadow-sm hover:shadow-md"}
                  `}
                  style={{
                    backgroundColor: t.colors.bg,
                    color: t.colors.fg,
                    borderColor: active ? t.colors.border ?? BRAND : "transparent",
                    borderWidth: "2px",
                    borderStyle: "solid",
                  }}
                  aria-label={`Filter ${t.label}`}
                >
                  <div
                    className="flex flex-col items-center justify-center gap-2 h-full"
                    style={{ pointerEvents: "none" }}
                  >
                    <div
                      className="h-8 w-8 grid place-items-center rounded-md"
                      style={{ color: t.colors.icon }}
                    >
                      <t.Icon size={22} />
                    </div>
                    <div className="text-[15px] font-semibold leading-5">{t.label}</div>
                    <div className="text-[12px] text-[#7E8AA0] leading-4">
                      ({t.count} items)
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
