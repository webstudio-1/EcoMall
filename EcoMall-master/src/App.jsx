import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/header/header.jsx";
import Footer from "./components/footer/footer.jsx";
import FeatureCards from "./aggregate/featuresCards/featuresCards.jsx";
import FeaturedProducts from "./aggregate/featuresProducts/featuresProducts.jsx";
import ToysGames from "./aggregate/toysGames/toysGames.jsx";
import Login from "./components/login/Login.jsx";
import Register from "./components/register/Register.jsx";
import Home from "./aggregate/home/home.jsx";
import Athykl from "./aggregate/athykl/athykl.jsx";
import SubcategoryItems from "./pages/SubcategoryItems.jsx";
import SweetHeart from "./aggregate/sweetHeart/sweetHeart.jsx";
import HomeNeeds from "./aggregate/homeNeeds/homeNeeds.jsx";
import HairCare from "./aggregate/personalCare/hairCare.jsx";
import SkinCare from "./aggregate/personalCare/skinCare.jsx";
import Cart from "./pages/Cart.jsx";
import Wishlist from "./pages/Wishlist.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Invoice from "./pages/Invoice.jsx";
import MyProfile from "./components/myProfile/myProfile.jsx";

// Import Bootstrap 5 CSS and JS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
  return (
    <Router>
      <div className="appShell">
        <Header />
        <main className="appMain">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Home />
                  <FeaturedProducts />
                  <FeatureCards />
                </>
              }
            />
            <Route path="/toys-games" element={<ToysGames />} />
            <Route path="/toys-games/:category?" element={<ToysGames />} />
            <Route path="/athykl" element={<Athykl />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/subcategory/:id" element={<SubcategoryItems />} />
            <Route path="/sweet-heart" element={<SweetHeart />} />
            <Route path="/homeNeeds" element={<HomeNeeds />} />
            <Route path="/personal-care/hair-care" element={<HairCare />} />
            <Route path="/personal-care/skin-care" element={<SkinCare />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/invoice/:orderId" element={<Invoice />} />
            <Route path="/my-profile" element={<MyProfile />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
