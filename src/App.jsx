import React, { useEffect, useMemo, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query as firestoreQuery,
  serverTimestamp,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { Search, ShoppingBag, Star, Truck, ShieldCheck, MessageCircle, Menu, X, Filter, Download, ClipboardList, ShoppingCart, Trash2 } from "lucide-react";
const Button = ({ className = "", children, ...props }) => (
  <button className={className} {...props}>{children}</button>
);

const Card = ({ className = "", children, ...props }) => (
  <div className={className} {...props}>{children}</div>
);

const CardContent = ({ className = "", children, ...props }) => (
  <div className={className} {...props}>{children}</div>
);

const defaultProducts = [
  {
    id: 1,
    name: "Cloud Walk Sneakers",
    category: "Sneakers",
    price: 1490,
    oldPrice: 1890,
    rating: 4.8,
    sizes: "39-44",
    tag: "Best Seller",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Urban Daily Loafers",
    category: "Loafers",
    price: 1690,
    oldPrice: 2090,
    rating: 4.7,
    sizes: "40-44",
    tag: "Formal",
    image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Flex Comfort Crocs",
    category: "Crocs",
    price: 790,
    oldPrice: 990,
    rating: 4.6,
    sizes: "38-43",
    tag: "Comfort",
    image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Executive Leather Shoes",
    category: "Formal",
    price: 2190,
    oldPrice: 2690,
    rating: 4.9,
    sizes: "40-45",
    tag: "Premium",
    image: "https://images.unsplash.com/photo-1616406432452-07bc5938759d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Street Runner Sports",
    category: "Sports",
    price: 1890,
    oldPrice: 2390,
    rating: 4.8,
    sizes: "39-44",
    tag: "New Arrival",
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "SoftStep Casual Sandal",
    category: "Sandals",
    price: 690,
    oldPrice: 890,
    rating: 4.5,
    sizes: "38-44",
    tag: "Budget Pick",
    image: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?q=80&w=1200&auto=format&fit=crop",
  },
];

const categories = ["All", "Sneakers", "Loafers", "Crocs", "Formal", "Sports", "Sandals"];

// তোমার WhatsApp number এখানে দাও। Format: country code সহ, + ছাড়া।
// Example: Bangladesh number 01712345678 হলে লিখবে 8801712345678
const WHATSAPP_NUMBER = "8801712345678";
const PHONE_DISPLAY = "01712345678";

// Firebase setup:
// 1) Firebase Console > Create project
// 2) Build > Authentication > Email/Password enable
// 3) Build > Firestore Database > Create database
// 4) Project settings > Web app > copy config and paste here
const firebaseConfig = {
  apiKey: "AIzaSyCQgeB4uvInuLCoFPou9TBOAOrZ52YfV5M",
  authDomain: "test-48815.firebaseapp.com",
  projectId: "test-48815",
  storageBucket: "test-48815.firebasestorage.app",
  messagingSenderId: "781215696093",
  appId: "1:781215696093:web:d323bd2169e56f5c008734",
  measurementId: "G-T6J1EP08X5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function PairPalaceWebsite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [products, setProducts] = useState(defaultProducts);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminVisible, setAdminVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showBuyNowForm, setShowBuyNowForm] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartCheckoutOpen, setCartCheckoutOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [orderMessage, setOrderMessage] = useState("");
  const [cartOrderMessage, setCartOrderMessage] = useState("");
  const [orderForm, setOrderForm] = useState({
    customerName: "",
    phone: "",
    size: "",
    color: "",
    quantity: "1",
    address: "",
    note: "",
  });
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "Sneakers",
    price: "",
    oldPrice: "",
    rating: "4.8",
    sizes: "39-44",
    tag: "New Arrival",
    image: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const secretAdmin = params.get("admin") === "swapno" || window.location.hash === "#admin";
    setAdminVisible(secretAdmin);

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsAdmin(Boolean(user));
    });

    const productsQuery = firestoreQuery(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribeProducts = onSnapshot(
      productsQuery,
      (snapshot) => {
        const firebaseProducts = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));
        setProducts(firebaseProducts.length ? firebaseProducts : defaultProducts);
        setLoadingProducts(false);
      },
      () => {
        setProducts(defaultProducts);
        setLoadingProducts(false);
      }
    );

    const ordersQuery = firestoreQuery(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribeOrders = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const firebaseOrders = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));
        setOrders(firebaseOrders);
      },
      () => {
        setOrders([]);
      }
    );

    return () => {
      unsubscribeAuth();
      unsubscribeProducts();
      unsubscribeOrders();
    }; 
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      setAdminError("");
      setAdminEmail("");
      setAdminPassword("");
    } catch (error) {
      setAdminError("Wrong email or password. Please try again.");
    }
  };

  const handleAdminLogout = async () => {
    await signOut(auth);
    setAdminOpen(false);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!isAdmin || !newProduct.name || !newProduct.price || !newProduct.image) return;

    const productToAdd = {
      name: newProduct.name,
      category: newProduct.category,
      price: Number(newProduct.price),
      oldPrice: Number(newProduct.oldPrice || newProduct.price),
      rating: Number(newProduct.rating || 4.8),
      sizes: newProduct.sizes,
      tag: newProduct.tag,
      image: newProduct.image,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "products"), productToAdd);
    setNewProduct({
      name: "",
      category: "Sneakers",
      price: "",
      oldPrice: "",
      rating: "4.8",
      sizes: "39-44",
      tag: "New Arrival",
      image: "",
    });
  };

  const handleDeleteProduct = async (id) => {
    if (!isAdmin) return;
    await deleteDoc(doc(db, "products", id));
  };

  const handleResetProducts = async () => {
    if (!isAdmin) return;
    await Promise.all(
      defaultProducts.map((product) => {
        const { id, ...productWithoutId } = product;
        return addDoc(collection(db, "products"), {
          ...productWithoutId,
          createdAt: serverTimestamp(),
        });
      })
    );
  };

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, cartQty: item.cartQty + 1 } : item
        );
      }
      return [...prevItems, { ...product, cartQty: 1 }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const updateCartQty = (productId, qty) => {
    const safeQty = Math.max(1, Number(qty || 1));
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === productId ? { ...item, cartQty: safeQty } : item))
    );
  };

  const openProductDetails = (product) => {
    setSelectedProduct(product);
    setShowBuyNowForm(false);
    setOrderMessage("");
  };

  const buyNow = (product) => {
    setSelectedProduct(product);
    setShowBuyNowForm(true);
    setCartOpen(false);
    setOrderMessage("");
    setOrderForm({ customerName: "", phone: "", size: "", color: "", quantity: "1", address: "", note: "" });
  };

  const cartTotal = cartItems.reduce((total, item) => total + Number(item.price || 0) * Number(item.cartQty || 1), 0);
  const cartCount = cartItems.reduce((total, item) => total + Number(item.cartQty || 1), 0);

  const handleCartOrderSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setCartOrderMessage("Your cart is empty.");
      return;
    }
    if (!orderForm.customerName || !orderForm.phone || !orderForm.address) {
      setCartOrderMessage("Please fill name, phone and address.");
      return;
    }

    const items = cartItems.map((item) => ({
      productId: item.id,
      productName: item.name,
      productCategory: item.category,
      productPrice: Number(item.price),
      quantity: Number(item.cartQty || 1),
      subtotal: Number(item.price || 0) * Number(item.cartQty || 1),
    }));

    const orderData = {
      orderType: "Cart",
      productId: "cart-order",
      productName: items.map((item) => `${item.productName} x${item.quantity}`).join(" | "),
      productCategory: "Multiple",
      productPrice: cartTotal,
      items,
      totalAmount: cartTotal,
      customerName: orderForm.customerName,
      phone: orderForm.phone,
      size: orderForm.size || "See note / confirm by phone",
      color: orderForm.color,
      quantity: cartCount,
      address: orderForm.address,
      note: orderForm.note,
      status: "New",
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "orders"), orderData);
    setCartOrderMessage("Cart order placed successfully. We will contact you soon.");
    setCartItems([]);
    setCartCheckoutOpen(false);
    setOrderForm({ customerName: "", phone: "", size: "", color: "", quantity: "1", address: "", note: "" });
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !orderForm.customerName || !orderForm.phone || !orderForm.size || !orderForm.address) {
      setOrderMessage("Please fill name, phone, size and address.");
      return;
    }

    const orderData = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productCategory: selectedProduct.category,
      productPrice: Number(selectedProduct.price),
      customerName: orderForm.customerName,
      phone: orderForm.phone,
      size: orderForm.size,
      color: orderForm.color,
      quantity: Number(orderForm.quantity || 1),
      address: orderForm.address,
      note: orderForm.note,
      status: "New",
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "orders"), orderData);
    setOrderMessage("Order placed successfully. We will contact you soon.");
    setOrderForm({ customerName: "", phone: "", size: "", color: "", quantity: "1", address: "", note: "" });
  };

  const exportOrdersToCSV = () => {
    const headers = ["Order ID", "Order Type", "Product", "Category", "Price/Total", "Customer", "Phone", "Size", "Color", "Quantity", "Address", "Note", "Status", "Cart Items"];
    const rows = orders.map((order) => [
      order.id,
      order.orderType || "Single",
      order.productName || "",
      order.productCategory || "",
      order.totalAmount || order.productPrice || "",
      order.customerName || "",
      order.phone || "",
      order.size || "",
      order.color || "",
      order.quantity || "",
      order.address || "",
      order.note || "",
      order.status || "New",
      order.items ? order.items.map((item) => `${item.productName} x${item.quantity} = ৳${item.subtotal}`).join("; ") : "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pair-palace-orders.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(query.toLowerCase()) || product.category.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "All" || product.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, query, category]);

  const whatsappText = encodeURIComponent("Hello Pair Palace, I want to order shoes.");
  const whatsappLink = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${whatsappText}`;
  const getProductWhatsappLink = (productName) =>
    `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(`Hello Pair Palace, I want to order ${productName}. My size is `)}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <a href="#home" className="flex items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">Pair Palace</h1>
              <p className="text-xs font-medium text-slate-500">Step into comfort</p>
            </div>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-700 md:flex">
            <a href="#products" className="hover:text-slate-950">Products</a>
            <a href="#offers" className="hover:text-slate-950">Offers</a>
            <a href="#size" className="hover:text-slate-950">Size Guide</a>
            <a href="#contact" className="hover:text-slate-950">Contact</a>
            {(adminVisible || isAdmin) && <a href="#admin" className="hover:text-slate-950">Admin</a>}
            {isAdmin && <a href="#orders" className="hover:text-slate-950">Orders</a>}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={() => setCartOpen(true)}
              className="relative rounded-full bg-slate-100 px-5 py-2.5 text-sm font-black text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-200"
            >
              <ShoppingCart className="mr-2 inline h-4 w-4" /> Cart
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-black text-white">
                  {cartCount}
                </span>
              )}
            </button>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Order Now
            </a>
          </div>

          <button onClick={() => setCartOpen(true)} className="relative rounded-full bg-slate-100 p-2 text-slate-900 md:hidden" aria-label="Open cart">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white">{cartCount}</span>}
          </button>

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-4 text-sm font-semibold">
              <a href="#products" onClick={() => setMenuOpen(false)}>Products</a>
              <a href="#offers" onClick={() => setMenuOpen(false)}>Offers</a>
              <a href="#size" onClick={() => setMenuOpen(false)}>Size Guide</a>
              {(adminVisible || isAdmin) && <a href="#admin" onClick={() => setMenuOpen(false)}>Admin</a>}
              <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
            </div>
          </div>
        )}
      </header>

      <main id="home">
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 left-8 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 md:px-8 md:py-24">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col justify-center">
              <div className="mb-5 w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
                New Collection 2026 • Cash on Delivery Available
              </div>
              <h2 className="max-w-xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
                Stylish shoes for every step of your day.
              </h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-200 md:text-lg">
                Sneakers, crocs, formal shoes, sandals and sports shoes — all in one trusted online store.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#products" className="rounded-full bg-white px-6 py-3 text-center text-sm font-black text-slate-950 shadow-xl transition hover:-translate-y-0.5">
                  Shop Collection
                </a>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/25 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-white/10">
                  WhatsApp Order
                </a>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="relative">
              <div className="rounded-[2rem] bg-white/10 p-3 shadow-2xl backdrop-blur">
                <img
                  src="https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1200&auto=format&fit=crop"
                  alt="Featured shoe collection"
                  className="h-[360px] w-full rounded-[1.5rem] object-cover md:h-[480px]"
                />
              </div>
              <div className="absolute -bottom-6 left-6 rounded-3xl bg-white p-5 text-slate-900 shadow-xl">
                <p className="text-sm font-bold text-slate-500">Starting From</p>
                <p className="text-3xl font-black">৳690</p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 md:grid-cols-3 md:px-8">
          {[
            { icon: Truck, title: "Fast Delivery", text: "Home delivery across Bangladesh." },
            { icon: ShieldCheck, title: "Quality Checked", text: "Comfortable and durable products." },
            { icon: MessageCircle, title: "Easy Order", text: "Order directly through WhatsApp." },
          ].map((item) => (
            <Card key={item.title} className="rounded-3xl border-0 shadow-sm">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-2xl bg-slate-900 p-3 text-white"><item.icon className="h-6 w-6" /></div>
                <div>
                  <h3 className="font-black">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.text}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section id="products" className="mx-auto max-w-7xl px-4 py-12 md:px-8">
          <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-slate-500">Our Collection</p>
              <h2 className="text-3xl font-black tracking-tight md:text-4xl">Choose your perfect pair</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search shoes..."
                  className="h-12 rounded-full border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-slate-900"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-12 rounded-full border border-slate-200 bg-white pl-11 pr-8 text-sm font-semibold outline-none transition focus:border-slate-900"
                >
                  {categories.map((cat) => <option key={cat}>{cat}</option>)}
                </select>
              </div>
            </div>
          </div>

          {loadingProducts && <p className="rounded-2xl bg-white p-5 text-sm font-semibold text-slate-500 shadow-sm">Loading products...</p>}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <motion.div key={product.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <Card
                  onClick={() => openProductDetails(product)}
                  className="group cursor-pointer overflow-hidden rounded-[2rem] border-0 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-black text-slate-900 shadow">
                      {product.tag}
                    </span>
                  </div>
                  <CardContent className="p-5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{product.category}</span>
                      <span className="flex items-center gap-1 text-sm font-bold"><Star className="h-4 w-4 fill-current" /> {product.rating}</span>
                    </div>
                    <h3 className="text-lg font-black">{product.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">Available sizes: {product.sizes}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-black">৳{product.price}</span>
                        <span className="ml-2 text-sm font-semibold text-slate-400 line-through">৳{product.oldPrice}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-900 transition hover:bg-slate-200"
                        >
                          Add Cart
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            buyNow(product);
                          }}
                          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700"
                        >
                          Buy Now
                        </button>
                        {isAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProduct(product.id);
                            }}
                            className="rounded-full bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {(adminVisible || isAdmin) && (
        <section id="admin" className="mx-auto max-w-7xl px-4 py-12 md:px-8">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-slate-500">Admin Panel</p>
              <h2 className="text-3xl font-black md:text-4xl">{isAdmin ? "Manage your shoes" : "Admin login"}</h2>
              <p className="mt-2 text-sm text-slate-500">
                {isAdmin ? "Tumi real admin account diye login kore acho. Ekhon product add/delete korle database-e save hobe." : "Visitor ra sudhu product dekhbe. Admin email/password dile product manage option show korbe."}
              </p>
            </div>
            {isAdmin && (
              <div className="flex gap-3">
                <Button onClick={() => setAdminOpen(!adminOpen)} className="rounded-full bg-slate-900 px-6 py-3 font-black text-white hover:bg-slate-700">
                  {adminOpen ? "Hide Form" : "Add New Shoe"}
                </Button>
                <Button onClick={handleAdminLogout} className="rounded-full bg-slate-200 px-6 py-3 font-black text-slate-900 hover:bg-slate-300">
                  Logout
                </Button>
              </div>
            )}
          </div>

          {!isAdmin && (
            <div className="max-w-md rounded-[2rem] bg-white p-5 shadow-sm md:p-8">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <input
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Admin email"
                  type="email"
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-900"
                />
                <input
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Admin password"
                  type="password"
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-900"
                />
                {adminError && <p className="text-sm font-semibold text-red-600">{adminError}</p>}
                <Button type="submit" className="w-full rounded-2xl bg-slate-900 font-black text-white hover:bg-slate-700">
                  Login as Admin
                </Button>
              </form>
              <p className="mt-4 text-xs text-slate-500">Firebase Authentication-e je admin email/password create korba, oi login ekhane use korba.</p>
            </div>
          )}

          {isAdmin && adminOpen && (
            <div className="rounded-[2rem] bg-white p-5 shadow-sm md:p-8">
              <form onSubmit={handleAddProduct} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <input
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Shoe name"
                  className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-900"
                />
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-900"
                >
                  {categories.filter((cat) => cat !== "All").map((cat) => <option key={cat}>{cat}</option>)}
                </select>
                <input
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="Price, example: 1490"
                  type="number"
                  className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-900"
                />
                <input
                  value={newProduct.oldPrice}
                  onChange={(e) => setNewProduct({ ...newProduct, oldPrice: e.target.value })}
                  placeholder="Old price, optional"
                  type="number"
                  className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-900"
                />
                <input
                  value={newProduct.sizes}
                  onChange={(e) => setNewProduct({ ...newProduct, sizes: e.target.value })}
                  placeholder="Sizes, example: 39-44"
                  className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-900"
                />
                <input
                  value={newProduct.tag}
                  onChange={(e) => setNewProduct({ ...newProduct, tag: e.target.value })}
                  placeholder="Tag, example: New Arrival"
                  className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-900"
                />
                <input
                  value={newProduct.rating}
                  onChange={(e) => setNewProduct({ ...newProduct, rating: e.target.value })}
                  placeholder="Rating, example: 4.8"
                  type="number"
                  step="0.1"
                  className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-900"
                />
                <input
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  placeholder="Image link / URL"
                  className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-900"
                />
                <Button type="submit" className="rounded-2xl bg-slate-900 font-black text-white hover:bg-slate-700 md:col-span-1">
                  Add Product
                </Button>
                <Button type="button" onClick={handleResetProducts} className="rounded-2xl bg-slate-200 font-black text-slate-900 hover:bg-slate-300 md:col-span-1">
                  Reset Demo Products
                </Button>
              </form>
              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                Tip: Facebook page বা Cloudinary/ImgBB এ photo upload করে image link এখানে paste করলেই product card এ image show করবে।
              </div>
            </div>
          )}
        </section>
        )}

        {isAdmin && (
          <section id="orders" className="mx-auto max-w-7xl px-4 py-12 md:px-8">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-slate-500">Order Management</p>
                <h2 className="text-3xl font-black md:text-4xl">Customer orders</h2>
                <p className="mt-2 text-sm text-slate-500">Visitor order form submit korle ekhane show korbe. CSV download kore Excel-e open korte parba.</p>
              </div>
              <Button onClick={exportOrdersToCSV} className="rounded-full bg-slate-900 px-6 py-3 font-black text-white hover:bg-slate-700">
                <Download className="mr-2 h-4 w-4" /> Export Excel/CSV
              </Button>
            </div>

            <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Size</th>
                      <th className="p-4">Color</th>
                      <th className="p-4">Qty</th>
                      <th className="p-4">Address</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.length === 0 && (
                      <tr>
                        <td className="p-4 text-slate-500" colSpan="8">No orders yet.</td>
                      </tr>
                    )}
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="p-4 font-bold">{order.productName}</td>
                        <td className="p-4">{order.customerName}</td>
                        <td className="p-4">{order.phone}</td>
                        <td className="p-4">{order.size}</td>
                        <td className="p-4">{order.color || "-"}</td>
                        <td className="p-4">{order.quantity}</td>
                        <td className="p-4">{order.address}</td>
                        <td className="p-4"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{order.status || "New"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        <section id="offers" className="mx-auto max-w-7xl px-4 py-12 md:px-8">
          <div className="rounded-[2rem] bg-slate-900 p-8 text-white shadow-xl md:p-12">
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-cyan-200">Special Offer</p>
                <h2 className="text-3xl font-black md:text-4xl">Buy 2 pairs and get free delivery.</h2>
                <p className="mt-4 max-w-xl leading-7 text-slate-200">
                  Limited time offer for our online customers. Send us your size and preferred product through WhatsApp.
                </p>
              </div>
              <div className="flex justify-start md:justify-end">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white px-7 py-3 text-sm font-black text-slate-950 shadow-lg transition hover:-translate-y-0.5">
                  Claim Offer
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="size" className="mx-auto max-w-7xl px-4 py-12 md:px-8">
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-slate-500">Size Guide</p>
            <h2 className="text-3xl font-black md:text-4xl">Find the right fit</h2>
          </div>
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="p-4">BD/EU Size</th>
                  <th className="p-4">Foot Length</th>
                  <th className="p-4">Recommended For</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr><td className="p-4 font-bold">39</td><td className="p-4">24.5 cm</td><td className="p-4">Regular casual wear</td></tr>
                <tr><td className="p-4 font-bold">40</td><td className="p-4">25.0 cm</td><td className="p-4">Sneakers / Crocs</td></tr>
                <tr><td className="p-4 font-bold">41</td><td className="p-4">25.5 cm</td><td className="p-4">Most common size</td></tr>
                <tr><td className="p-4 font-bold">42</td><td className="p-4">26.0 cm</td><td className="p-4">Formal / Sports</td></tr>
                <tr><td className="p-4 font-bold">43</td><td className="p-4">26.5 cm</td><td className="p-4">Wide fit</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-7xl px-4 py-14 md:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[2rem] bg-white p-8 shadow-sm">
              <h2 className="text-3xl font-black">Contact Pair Palace</h2>
              <p className="mt-4 leading-7 text-slate-600">
                For order, size confirmation, delivery charge or stock details, message us directly.
              </p>
              <div className="mt-6 space-y-3 text-sm font-semibold text-slate-700">
                <p>Phone: {PHONE_DISPLAY}</p>
                <p>Facebook: facebook.com/pairpalace</p>
                <p>Location: Bangladesh</p>
              </div>
            </div>
            <div className="rounded-[2rem] bg-slate-100 p-8">
              <h3 className="text-2xl font-black">Order Process</h3>
              <ol className="mt-5 space-y-4 text-slate-700">
                <li><b>1.</b> Choose your product and size.</li>
                <li><b>2.</b> Click Order / WhatsApp button.</li>
                <li><b>3.</b> Confirm delivery address.</li>
                <li><b>4.</b> Receive your shoes at home.</li>
              </ol>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-slate-700">
                Message on WhatsApp
              </a>
            </div>
          </div>
        </section>
      {cartOpen && (
        <div className="fixed inset-0 z-[90] flex justify-end bg-slate-950/60 backdrop-blur-sm" onClick={() => setCartOpen(false)}>
          <motion.div
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">Your Cart</h2>
                <p className="text-sm font-semibold text-slate-500">{cartCount} item(s) selected</p>
              </div>
              <button onClick={() => setCartOpen(false)} className="rounded-full bg-slate-100 p-2 hover:bg-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="rounded-3xl bg-slate-50 p-8 text-center">
                <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-slate-400" />
                <p className="font-bold text-slate-600">Cart empty. Add shoes first.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex gap-4">
                      <img src={item.image} alt={item.name} className="h-20 w-20 rounded-2xl object-cover" />
                      <div className="flex-1">
                        <h3 className="font-black leading-tight">{item.name}</h3>
                        <p className="mt-1 text-sm font-bold text-slate-500">৳{item.price}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <input
                            value={item.cartQty}
                            onChange={(e) => updateCartQty(item.id, e.target.value)}
                            type="number"
                            min="1"
                            className="h-9 w-20 rounded-xl border border-slate-200 px-3 text-sm font-bold outline-none focus:border-slate-900"
                          />
                          <button onClick={() => buyNow(item)} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-black text-white hover:bg-slate-700">
                            Buy Now
                          </button>
                          <button onClick={() => removeFromCart(item.id)} className="rounded-full bg-red-50 p-2 text-red-600 hover:bg-red-100">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="sticky bottom-0 rounded-3xl bg-slate-950 p-5 text-white shadow-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-300">Total</span>
                    <span className="text-2xl font-black">৳{cartTotal}</span>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setCartCheckoutOpen(!cartCheckoutOpen);
                        setCartOrderMessage("");
                        setOrderForm({ customerName: "", phone: "", size: "", color: "", quantity: "1", address: "", note: "" });
                      }}
                      className="w-full rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 hover:bg-slate-100"
                    >
                      Checkout All Cart Items
                    </button>
                    <p className="text-xs text-slate-300">Buy Now click korle specific product order hobe. Checkout All dile cart-er sob product ek order hobe.</p>
                  </div>
                </div>
              {cartCheckoutOpen && cartItems.length > 0 && (
                  <form onSubmit={handleCartOrderSubmit} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-700">
                      <ClipboardList className="h-4 w-4" /> Checkout All Form
                    </div>
                    <div className="grid gap-3">
                      <input value={orderForm.customerName} onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })} placeholder="Your name" className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-900" />
                      <input value={orderForm.phone} onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })} placeholder="Phone number" className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-900" />
                      <input value={orderForm.size} onChange={(e) => setOrderForm({ ...orderForm, size: e.target.value })} placeholder="Size note, example: first 42, second 41" className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-900" />
                      <input value={orderForm.color} onChange={(e) => setOrderForm({ ...orderForm, color: e.target.value })} placeholder="Color note, optional" className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-900" />
                      <textarea value={orderForm.address} onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })} placeholder="Delivery address" rows="3" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900" />
                      <textarea value={orderForm.note} onChange={(e) => setOrderForm({ ...orderForm, note: e.target.value })} placeholder="Extra note, optional" rows="2" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900" />
                      {cartOrderMessage && <p className="rounded-2xl bg-white p-3 text-sm font-semibold text-slate-700">{cartOrderMessage}</p>}
                      <Button type="submit" className="rounded-full bg-slate-900 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-slate-700">
                        Place Cart Order ৳{cartTotal}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl"
          >
            <div className="grid gap-0 md:grid-cols-2">
              <div className="relative h-80 md:h-full">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="h-full w-full rounded-t-[2rem] object-cover md:rounded-l-[2rem] md:rounded-tr-none" />
                <span className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-xs font-black text-slate-900 shadow">
                  {selectedProduct.tag}
                </span>
              </div>
              <div className="p-6 md:p-8">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{selectedProduct.category}</span>
                    <h2 className="mt-4 text-3xl font-black tracking-tight">{selectedProduct.name}</h2>
                  </div>
                  <button onClick={() => setSelectedProduct(null)} className="rounded-full bg-slate-100 p-2 text-slate-700 hover:bg-slate-200" aria-label="Close product details">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Star className="h-4 w-4 fill-current" /> {selectedProduct.rating} rating
                </div>

                <div className="mb-6 flex items-end gap-3">
                  <span className="text-4xl font-black">৳{selectedProduct.price}</span>
                  <span className="pb-1 text-base font-semibold text-slate-400 line-through">৳{selectedProduct.oldPrice}</span>
                </div>

                <div className="space-y-4 rounded-3xl bg-slate-50 p-5 text-sm text-slate-700">
                  <p><b>Available sizes:</b> {selectedProduct.sizes}</p>
                  <p><b>Delivery:</b> Cash on Delivery available across Bangladesh.</p>
                  <p><b>How to order:</b> Click Buy Now to open the order form, or use WhatsApp Order.</p>
                </div>

                {showBuyNowForm && (
                  <form onSubmit={handleOrderSubmit} className="mt-6 grid gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                      <ClipboardList className="h-4 w-4" /> Order Form
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input value={orderForm.customerName} onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })} placeholder="Your name" className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-900" />
                      <input value={orderForm.phone} onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })} placeholder="Phone number" className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-900" />
                      <input value={orderForm.size} onChange={(e) => setOrderForm({ ...orderForm, size: e.target.value })} placeholder="Size, example: 42" className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-900" />
                      <input value={orderForm.color} onChange={(e) => setOrderForm({ ...orderForm, color: e.target.value })} placeholder="Color, optional" className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-900" />
                      <input value={orderForm.quantity} onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })} placeholder="Quantity" type="number" min="1" className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-900" />
                      <input value={orderForm.note} onChange={(e) => setOrderForm({ ...orderForm, note: e.target.value })} placeholder="Note, optional" className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-900" />
                    </div>
                    <textarea value={orderForm.address} onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })} placeholder="Delivery address" rows="3" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900" />
                    {orderMessage && <p className="rounded-2xl bg-white p-3 text-sm font-semibold text-slate-700">{orderMessage}</p>}
                    <Button type="submit" className="rounded-full bg-slate-900 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-slate-700">
                      Place Order
                    </Button>
                  </form>
                )}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => addToCart(selectedProduct)}
                    className="rounded-full bg-slate-100 px-6 py-3 text-sm font-black text-slate-900 transition hover:bg-slate-200"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => setShowBuyNowForm(true)}
                    className="rounded-full bg-slate-900 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-slate-700"
                  >
                    Buy Now
                  </button>
                  <a
                    href={getProductWhatsappLink(selectedProduct.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-emerald-600 px-6 py-3 text-center text-sm font-black text-white shadow-lg transition hover:bg-emerald-700"
                  >
                    WhatsApp Order
                  </a>
                  <button onClick={() => setSelectedProduct(null)} className="rounded-full bg-slate-100 px-6 py-3 text-sm font-black text-slate-900 transition hover:bg-slate-200">
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </main>

      <footer className="bg-slate-950 px-4 py-8 text-center text-sm font-medium text-slate-400 md:px-8">
        <p>© 2026 Pair Palace. All rights reserved.</p>
        <p className="mt-2">Designed & developed by Swapno</p>
      </footer>
    </div>
  );
}
