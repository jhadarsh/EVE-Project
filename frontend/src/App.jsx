import { Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import Home from "./pages/Home";
import Tests from "./pages/Tests";
import TestDetails from "./pages/TestDetails";
import CentreDetails from "./pages/CentreDetails";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import VerifyEmail from "./pages/auth/VerifyEmail";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import PaymentResult from "./pages/PaymentResult";
import Profile from "./pages/Profile";
import BookingDetails from "./pages/BookingDetails";
import NotFound from "./pages/NotFound";
import Forbidden from "./pages/Forbidden";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCentres from "./pages/admin/AdminCentres";
import AdminTests from "./pages/admin/AdminTests";
import AdminLogs from "./pages/admin/AdminLogs";

export default function App(){return <ErrorBoundary><div className="min-h-screen"><Header/><Routes>
<Route path="/" element={<Home/>}/>
<Route path="/tests" element={<Tests/>}/>
<Route path="/tests/:testId" element={<TestDetails/>}/>
<Route path="/centres/:centreId" element={<CentreDetails/>}/>
<Route path="/login" element={<Login/>}/>
<Route path="/signup" element={<Signup/>}/>
<Route path="/verify-email" element={<VerifyEmail/>}/>
<Route path="/booking" element={<ProtectedRoute><Booking/></ProtectedRoute>}/>
<Route path="/payment/:bookingId" element={<ProtectedRoute><Payment/></ProtectedRoute>}/>
<Route path="/booking/success/:bookingId" element={<ProtectedRoute><PaymentResult/></ProtectedRoute>}/>
<Route path="/booking/failed/:bookingId" element={<ProtectedRoute><PaymentResult failed/></ProtectedRoute>}/>
<Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
<Route path="/profile/bookings/:bookingId" element={<ProtectedRoute><BookingDetails/></ProtectedRoute>}/>
<Route path="/403" element={<Forbidden/>}/>
<Route path="/admin" element={<AdminRoute><AdminLayout/></AdminRoute>}><Route index element={<AdminDashboard/>}/><Route path="centres" element={<AdminCentres/>}/><Route path="tests" element={<AdminTests/>}/><Route path="logs" element={<AdminLogs/>}/></Route>
<Route path="*" element={<NotFound/>}/>
</Routes></div></ErrorBoundary>}