import { createBrowserRouter } from "react-router-dom"
import App from "../App"
import RegistrationPage from "../pages/RegistrationPage";
import LoginPage from "../pages/LoginPage";
import ProtectedRoute from "../secureRoute/ProtectedRoute";
import ForgotPassword from "../pages/ForgotPassword";
import OTPverification from "../pages/OTPverification";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import ProfilePage from "../pages/ProfilePage";
import ChatPage from "../pages/ChatPage";
import UserPage from "../pages/UserPage";
import RequestPage from "../pages/RequestPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "",
                element: <LoginPage />
            },
            {
                path: "registration",
                element: <RegistrationPage />
            },
            {
                path: "chatpage",
                element: <ProtectedRoute>
                    <ChatPage />
                </ProtectedRoute>
            },
            {
                path: "forgot-password",
                element: <ForgotPassword />
            },
            {
                path: "verification-otp",
                element: <OTPverification />
            },
            {
                path: "reset-password",
                element: <ResetPasswordPage />
            },
            {
                path: "profile",
                element: <ProfilePage />
            },
            {
                path:"user/:user_id",
                element:<UserPage/>
            },
            {
                path:"request",
                element:<RequestPage/>
            }
        ]
    }
])

export default router;