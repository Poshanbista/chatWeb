import { Navigate } from "react-router";


export default function ProtectedRoute({children}){
    const token = localStorage.getItem("AccessToken");

    if(!token){
        return <Navigate to="/" />
    }
    return children;
}