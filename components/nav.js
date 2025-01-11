"use client";
import { useState } from 'react';

const Navbar = ({ onSubmit }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (searchTerm) {
      await onSubmit(searchTerm);
      setSearchTerm(''); // Clear the input field
    }
  };

  return (
    <nav style={styles.navbar}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Enter a name"
          style={styles.searchBar}
        />
        <button type="submit" style={styles.button}>Submit</button>
      </form>
    </nav>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#6200ea',
    color: 'white',
  },
  form: {
    display: 'flex',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#03dac6',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginLeft: '10px',
  },
  searchBar: {
    padding: '10px',
    borderRadius: '5px',
    border: 'none',
    width: '200px',
  },
};

export default Navbar;
