import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from "react-router-dom";
import reportWebVitals from './reportWebVitals';
import Header from './general/header/Header.js';
import Footer from './general/footer/Footer.js';
import Search from './pokedex/Pokedex.js';
import Home from './home/Home.js';
import Pokemon from './pokemon/Pokemon.js';
import Container from '@mui/material/Container';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>

<Router>
    <Header/>

    <Container maxWidth="lg">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pokedex" element={<Search />} />
          <Route path="/pokedex/:id" element={<Pokemon />} />
        </Routes>
    </Container>

    <Footer/>
  </Router>

  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
