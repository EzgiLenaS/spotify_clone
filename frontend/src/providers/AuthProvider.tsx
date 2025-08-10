/**
 * We covered <App/> with this and we do not need to write the
 * updateApiToken part every single time when we write a func.
 * This tsx helps us to write only one time.
 */

import { axiosInstance } from "../lib/axios";
import { useAuth } from "@clerk/clerk-react";
import { LoaderPinwheelIcon } from "lucide-react";
import { useEffect, useState } from "react";

const updateApiToken = (token: string | null) => {
    if (token) axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    else delete axiosInstance.defaults.headers.common['Authorization'];
}

// This children provides us to covering other <> that type of things
// Ex: we cant write <Topbar><Topbar/> like this because we didnt write that children thing
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = await getToken();
                updateApiToken(token);
            } catch (error) {
                console.log("Error in AtuhProvider", error);
            } finally {
                setLoading(false);
            }
        };
        
        initAuth();
    }, [getToken]);

    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center">
            <LoaderPinwheelIcon className="size-8 text-emerald-500 animate-spin" />
        </div>
    )

    return (
        <>{ children }</>
    )
}

export default AuthProvider;