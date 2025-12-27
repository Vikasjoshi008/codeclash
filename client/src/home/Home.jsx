import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return ( 
        <div>
            <h1>🔥 CodeClash</h1>
            <Link to="/login">Login</Link> | 
            <Link to="/signup">Signup</Link>
        </div>
     );
}

export default Home;