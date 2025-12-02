import { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();

// Action types
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGOUT = 'LOGOUT';
const SET_LOADING = 'SET_LOADING';
const SET_ERROR = 'SET_ERROR';

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        admin: action.payload.admin,
        token: action.payload.token,
        loading: false,
        error: null
      };

    case LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        admin: null,
        token: null,
        loading: false,
        error: null
      };

    case SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    default:
      return state;
  }
};

// Initial state
const initialState = {
  isAuthenticated: false,
  admin: null,
  token: null,
  loading: false,
  error: null
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('eatHubToken');
    const admin = localStorage.getItem('eatHubAdmin');
    
    if (token && admin) {
      try {
        const parsedAdmin = JSON.parse(admin);
        dispatch({
          type: LOGIN_SUCCESS,
          payload: { token, admin: parsedAdmin }
        });
      } catch (error) {
        console.error('Error loading auth from localStorage:', error);
        // Clear invalid data
        localStorage.removeItem('eatHubToken');
        localStorage.removeItem('eatHubAdmin');
      }
    }
  }, []);

  // Auth actions
  const login = (token, admin) => {
    // Save to localStorage
    localStorage.setItem('eatHubToken', token);
    localStorage.setItem('eatHubAdmin', JSON.stringify(admin));
    
    // Update state
    dispatch({
      type: LOGIN_SUCCESS,
      payload: { token, admin }
    });
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('eatHubToken');
    localStorage.removeItem('eatHubAdmin');
    
    // Update state
    dispatch({ type: LOGOUT });
  };

  const setLoading = (loading) => {
    dispatch({ type: SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: SET_ERROR, payload: error });
  };

  // Verify token (to be used with API service)
  const verifyToken = async (verifyFn) => {
    const token = state.token || localStorage.getItem('eatHubToken');
    
    if (!token) {
      logout();
      return false;
    }

    try {
      setLoading(true);
      const isValid = await verifyFn(token);
      
      if (!isValid) {
        logout();
        return false;
      }
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
      return false;
    }
  };

  const value = {
    isAuthenticated: state.isAuthenticated,
    admin: state.admin,
    token: state.token,
    loading: state.loading,
    error: state.error,
    login,
    logout,
    setLoading,
    setError,
    verifyToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
