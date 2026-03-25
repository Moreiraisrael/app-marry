/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AffiliateStorefront from './pages/AffiliateStorefront';
import Analytics from './pages/Analytics';
import Appointments from './pages/Appointments';
import CapsuleWardrobe from './pages/CapsuleWardrobe';
import ClientDetail from './pages/ClientDetail';
import ClientPortal from './pages/ClientPortal';
import ClientProgress from './pages/ClientProgress';
import Clients from './pages/Clients';
import ColorAnalysis from './pages/ColorAnalysis';
import ColorAnalysisGuide from './pages/ColorAnalysisGuide';
import ColorQuiz from './pages/ColorQuiz';
import ColorWheelTool from './pages/ColorWheelTool';
import ConsultantDashboard from './pages/ConsultantDashboard';
import ConsultantSubscription from './pages/ConsultantSubscription';
import Coupons from './pages/Coupons';
import Ebooks from './pages/Ebooks';
import EcommerceIntegrations from './pages/EcommerceIntegrations';
import Gallery from './pages/Gallery';
import GenerateDossier from './pages/GenerateDossier';
import Home from './pages/Home';
import ImageConsultingQuestionnaire from './pages/ImageConsultingQuestionnaire';
import MyOrders from './pages/MyOrders';
import MyResults from './pages/MyResults';
import OutfitGenerator from './pages/OutfitGenerator';
import PartnerPortal from './pages/PartnerPortal';
import PartnerStores from './pages/PartnerStores';
import PendingStyleQuizzes from './pages/PendingStyleQuizzes';
import PersonalStyleQuiz from './pages/PersonalStyleQuiz';
import PersonalizedShopping from './pages/PersonalizedShopping';
import ProductInspirations from './pages/ProductInspirations';
import PromotionStorefront from './pages/PromotionStorefront';
import SeasonalAnalysis from './pages/SeasonalAnalysis';
import Services from './pages/Services';
import Settings from './pages/Settings';
import Shop from './pages/Shop';
import ShoppingLists from './pages/ShoppingLists';
import StyleContent from './pages/StyleContent';
import StyleQuiz from './pages/StyleQuiz';
import StyleQuizValidation from './pages/StyleQuizValidation';
import StyleRecommendations from './pages/StyleRecommendations';
import StyleTrends from './pages/StyleTrends';
import SubscriptionManagement from './pages/SubscriptionManagement';
import SubscriptionPlans from './pages/SubscriptionPlans';
import VirtualFitting from './pages/VirtualFitting';
import VirtualWardrobe from './pages/VirtualWardrobe';
import ArchetypeQuiz from './pages/ArchetypeQuiz';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AffiliateStorefront": AffiliateStorefront,
    "Analytics": Analytics,
    "Appointments": Appointments,
    "CapsuleWardrobe": CapsuleWardrobe,
    "ClientDetail": ClientDetail,
    "ClientPortal": ClientPortal,
    "ClientProgress": ClientProgress,
    "Clients": Clients,
    "ColorAnalysis": ColorAnalysis,
    "ColorAnalysisGuide": ColorAnalysisGuide,
    "ColorQuiz": ColorQuiz,
    "ColorWheelTool": ColorWheelTool,
    "ConsultantDashboard": ConsultantDashboard,
    "ConsultantSubscription": ConsultantSubscription,
    "Coupons": Coupons,
    "Ebooks": Ebooks,
    "EcommerceIntegrations": EcommerceIntegrations,
    "Gallery": Gallery,
    "GenerateDossier": GenerateDossier,
    "Home": Home,
    "ImageConsultingQuestionnaire": ImageConsultingQuestionnaire,
    "MyOrders": MyOrders,
    "MyResults": MyResults,
    "OutfitGenerator": OutfitGenerator,
    "PartnerPortal": PartnerPortal,
    "PartnerStores": PartnerStores,
    "PendingStyleQuizzes": PendingStyleQuizzes,
    "PersonalStyleQuiz": PersonalStyleQuiz,
    "PersonalizedShopping": PersonalizedShopping,
    "ProductInspirations": ProductInspirations,
    "PromotionStorefront": PromotionStorefront,
    "SeasonalAnalysis": SeasonalAnalysis,
    "Services": Services,
    "Settings": Settings,
    "Shop": Shop,
    "ShoppingLists": ShoppingLists,
    "StyleContent": StyleContent,
    "StyleQuiz": StyleQuiz,
    "StyleQuizValidation": StyleQuizValidation,
    "StyleRecommendations": StyleRecommendations,
    "StyleTrends": StyleTrends,
    "SubscriptionManagement": SubscriptionManagement,
    "SubscriptionPlans": SubscriptionPlans,
    "VirtualFitting": VirtualFitting,
    "VirtualWardrobe": VirtualWardrobe,
    "ArchetypeQuiz": ArchetypeQuiz,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};