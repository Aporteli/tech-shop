import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/home/home';
import Layout from './Layout';
import Aboutus from './pages/aboutus/aboutus';
import ScrollToTop from './ScrollToTop';
import CategoryPage from './pages/categoryPage/categoryPage';
import SubCategoryPage from './pages/subCategoryPage/subCategoryPage';
import AdminAddProduct from './pages/AdminAddProduct';
import Cart from './pages/cart';
import Wishlist from './pages/wishlist';
import Compare from './pages/compare';
import SearchResults from './pages/searchResults/searchResults';
import User from './pages/user/User';
import SingleProduct from './pages/singleProduct/singleProduct';
import Brand from './pages/brand/brand';
import Blog from './pages/blog/blog';
import LatestTechTrends from './pages/blog/posts/latestTechTrends/latestTechTrends';
import GamingLaptops from './pages/blog/posts/gamingLaptops/gamingLaptops';
import SmartHomeGuide from './pages/blog/posts/smartHomeGuide/smartHomeGuide';
import Iphone15Review from './pages/blog/posts/iphone15Review/iphone15Review';
import WirelessHeadphones from './pages/blog/posts/wirelessHeadphones/wirelessHeadphones';
import HomeTheaterTips from './pages/blog/posts/homeTheaterTips/homeTheaterTips';
import Shops from './pages/shops/shops';
import Promotions from './pages/promotions/promotions';
import InfoPage from './pages/info/infoPage';
import { useAppSync } from './hooks/useAppSync';
import { useAuth } from './context/AuthContext';
import CustomToastContainer from './components/ToastContainer';

function App() {
  const { user } = useAuth();
  useAppSync(user);

  return (
    <div>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/aboutus" element={<Aboutus />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/s/:slug" element={<SubCategoryPage />} />
            <Route path="/admin/add-product" element={<AdminAddProduct />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/user" element={<User />} />
            <Route path="/product/:id" element={<SingleProduct />} />
            <Route path="/brand/:slug" element={<Brand />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/latest-tech-trends-2024" element={<LatestTechTrends />} />
            <Route path="/blog/best-gaming-laptops-under-1000" element={<GamingLaptops />} />
            <Route path="/blog/smart-home-automation-guide" element={<SmartHomeGuide />} />
            <Route path="/blog/iphone-15-pro-max-review" element={<Iphone15Review />} />
            <Route path="/blog/wireless-headphones-buying-guide" element={<WirelessHeadphones />} />
            <Route path="/blog/home-theater-setup-tips" element={<HomeTheaterTips />} />
            <Route path="/shops" element={<Shops />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/info/:slug" element={<InfoPage />} />
            <Route
              path="*"
              element={
                <div style={{ padding: '50px', textAlign: 'center' }}>გვერდი ვერ მოიძებნა! ❌</div>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
      <CustomToastContainer />
    </div>
  );
}

export default App;
