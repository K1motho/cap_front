import React from 'react';

const Footer = () => {

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#f2f2f2',
      padding: '20px',
      textAlign: 'center',
      marginTop: '40px',
      borderTop: '1px solid #ddd'
    }}>
      <p>&copy; {new Date().getFullYear()} Wapi Na Lini. All rights reserved.</p>
      <p>
        <a href="/" style={{ margin: '0 10px', textDecoration: 'none', color: '#333' }}>Home</a> | 
        <a href="/dashboard" style={{ margin: '0 10px', textDecoration: 'none', color: '#333' }}>Dashboard</a> | 
        <a href="/friendprofile" style={{ margin: '0 10px', textDecoration: 'none', color: '#333' }}>Friends</a>
      </p>
    </footer>
  );
};
};      

export default Footer;