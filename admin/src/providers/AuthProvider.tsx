import {onAuthStateChanged, User} from "firebase/auth";
import React, {useContext, useEffect, useState} from "react";
import {auth} from "../firebase_config";

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthContext = React.createContext<AuthContextValue | null>(null);
//export const AuthContext = React.createContext<User | null>(null);

interface AuthContextValue {
    user: User | null;
    loading: boolean;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
            console.log("Firebase user: ", firebaseUser?.email);
            console.log("Firebase user full: ", firebaseUser?.uid);
        });
        return () => {
            unsubscribe();
        };
    }, [auth]);

    return <AuthContext.Provider value={{user, loading}}>{children}</AuthContext.Provider>;
    //return children
};

export const useAuth = () => {
    return useContext(AuthContext) as AuthContextValue;
};
