import { createContext, useReducer, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

const initialState = {
  accessToken: localStorage.getItem('auth-token'),
  user: JSON.parse(localStorage.getItem('user')),
  redirectPath: null
};

function reducer(state, action) {
  switch (action.type) {
    case "setToken":
      return { ...state, accessToken: action.payload };
    case "setUser":
      return { ...state, user: action.payload };
    case "setRedirectPath":
      return { ...state, redirectPath: action.payload };
    case "logout":
      return { ...state, accessToken: null, user: null, redirectPath: null };
    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userID, setUserID] = useState(state.user?.userId || '');
  
  
  const setItem = (token) => {
    localStorage.setItem('auth-token', token);
    dispatch({ type: "setToken", payload: token });
  };


   const login = (userData) => {
    const { name, email, userId, token } = userData;
    const userObject = { name, email, userId, token };
    
    
    localStorage.setItem('auth-token', token);
    localStorage.setItem('user', JSON.stringify(userObject));
    
    
    dispatch({ type: "setUser", payload: userObject });
    dispatch({ type: "setToken", payload: token });
    setUserID(userId);
  };

  
  const logout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
    dispatch({ type: "logout" });
    setUserID('');
    navigate('/login');
  };

  
  const getAuthToken = () => {
    return localStorage.getItem('auth-token');
  };

  
  const fetchUser = async () => {
    const token = getAuthToken();
    if (token) {
      try {
        const response = await fetch("http://localhost:3000/api/user/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
        });

        const data = await response.json();

        if (data.success) {
          const fetchedUser = {
            name: data.user.name,
            email: data.user.email,
            userId: data.user._id,
            token: token,
          };
          
          
          localStorage.setItem('user', JSON.stringify(fetchedUser));
          dispatch({ type: "setUser", payload: fetchedUser });
          setUserID(data.user._id);
        } else {
          throw new Error(data.message || "Failed to fetch user information");
        }
      } catch (error) {
        console.error("Error fetching user information", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

 
  useEffect(() => {
    fetchUser();
  }, []);

  
  useEffect(() => {
    if (state.accessToken && state.redirectPath) {
      navigate(state.redirectPath);
      dispatch({ type: "setRedirectPath", payload: null });
    }
  }, [state.accessToken, state.redirectPath, navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
    </div>;
  }

  const value = {
    state,
    dispatch,
    user: state.user,
    login,
    logout,
    userID,
    setUserID,
    getAuthToken,
    setItem,
    isAuthenticated: !!state.accessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;