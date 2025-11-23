import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase.js';

// Components
import Home from './components/home.jsx';
import Register from './components/register.jsx';
import Login from './components/login.jsx';
import ProjectList from './components/project-list.jsx';
import ProjectDetails from './components/project-details.jsx';

function App() {

  const [user, setUser] = useState(null);

  // Keep local user state in sync with Firebase auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          username: firebaseUser.displayName || firebaseUser.email || 'User',
          email: firebaseUser.email,
          uid: firebaseUser.uid,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
  }


  return (
    <>
      <Router>
        <div className="App">
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <Link className='navbar-brand' to="/">My Portfolio</Link>
            <div className="collapse navbar-collapse">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <Link className='nav-link' to="/">Home</Link>
                </li>
                <li className="nav-item">
                  <Link className='nav-link' to="/about">About</Link>
                </li>
                <li className="nav-item">
                  <Link className='nav-link' to="/services">Services</Link>
                </li>
                <li className="nav-item">
                  <Link className='nav-link' to="/projects">Projects</Link>
                </li>
                <li className="nav-item">
                  <Link className='nav-link' to="/contact">Contact</Link>
                </li>
              </ul>
              {user ? (
                <div className="navbar-nav ms-auto d-flex align-items-center">
                  <span className="navbar-text me-3">Welcome, {user.username}</span>
                  <button className='btn btn-outline-danger' onClick={handleLogout}>Logout</button>
                </div>
              ) : (
                <ul className="navbar-nav ms-auto">
                  <li className="nav-item">
                    <Link className='nav-link' to="/register">Register</Link>
                  </li>
                  <li className="nav-item">
                    <Link className='nav-link' to="/login">Login</Link>
                  </li>
                </ul>
              )}
            </div>
          </nav>
        </div>

        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path='/projects' element={<ProjectList />} />
          <Route path='/project-details/:id?' element={<ProjectDetails />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
