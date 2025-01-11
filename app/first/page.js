"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../fire';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { FaTrash, FaEdit } from 'react-icons/fa';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// TransactionList Component to handle displaying transactions
const TransactionList = ({ transactions, onEdit, onDelete }) => {
  return (
    <div style={{ overflowY: 'scroll', maxHeight: '300px' }}>
      <table style={styles.transactionTable}>
        <thead>
          <tr>
            <th style={styles.transactionTableTh}>Date</th>
            <th style={styles.transactionTableTh}>Person</th>
            <th style={styles.transactionTableTh}>Money Given</th>
            <th style={styles.transactionTableTh}>Money Received</th>
            <th style={styles.transactionTableTh}>Bank</th>
            <th style={styles.transactionTableTh}>Payment Method</th>
            <th style={styles.transactionTableTh}>Total Left</th>
            <th style={styles.transactionTableTh}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={transaction.date}>
              <td style={styles.transactionTableTd}>{new Date(transaction.date).toLocaleDateString()}</td>
              <td style={styles.transactionTableTd}>{transaction.person}</td>
              <td style={styles.transactionTableTd}>{transaction.moneyGiven}</td>
              <td style={styles.transactionTableTd}>{transaction.moneyReceived}</td>
              <td style={styles.transactionTableTd}>{transaction.bank || 'N/A'}</td>
              <td style={styles.transactionTableTd}>{transaction.paymentMethod}</td>
              <td style={styles.transactionTableTd}>{parseInt(transaction.moneyGiven) - parseInt(transaction.moneyReceived)}</td>
              <td style={styles.transactionTableTd}>
                <div style={styles.actionIcons}>
                  <FaEdit
                    onClick={() => onEdit(index)}
                    style={{ cursor: 'pointer', color: '#007bff', marginRight: '10px' }}
                  />
                  <FaTrash
                    onClick={() => onDelete(index)}
                    style={{ cursor: 'pointer', color: '#ff0000' }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Main Page Component
const Page = () => {
  const [names, setNames] = useState([]);
  const [newName, setNewName] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [submittedModalIsOpen, setSubmittedModalIsOpen] = useState(false);
  const [selectedName, setSelectedName] = useState('');
  const [moneyGiven, setMoneyGiven] = useState('');
  const [moneyReceived, setMoneyReceived] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [submittedData, setSubmittedData] = useState({});
  const [personTransactions, setPersonTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingTransactionIndex, setEditingTransactionIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNames();
  }, []);

  const fetchNames = async () => {
    const querySnapshot = await getDocs(collection(db, 'names'));
    const namesList = querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
    setNames(namesList);
  };

  const handleNameSubmit = async () => {
    if (newName.trim()) {
      await addDoc(collection(db, 'names'), { name: newName, transactions: [] });
      setNewName('');
      fetchNames();
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'names', id));
    fetchNames();
  };

  const handleNameClick = async (name) => {
    setSelectedName(name);
    const querySnapshot = await getDocs(collection(db, 'names'));
    const nameDoc = querySnapshot.docs.find(doc => doc.data().name === name);
    if (nameDoc) {
      setPersonTransactions(nameDoc.data().transactions);
    }
    setModalIsOpen(true);
  };

  const handleModalSubmit = async () => {
    setLoading(true);
    if (moneyGiven.trim() && moneyReceived.trim() && selectedPerson && selectedPaymentMethod) {
      const newTransaction = {
        moneyGiven,
        moneyReceived,
        person: selectedPerson,
        bank: selectedBank || '', // Bank is optional, will default to an empty string if not selected
        paymentMethod: selectedPaymentMethod,
        date: new Date().toISOString(),
      };

      const querySnapshot = await getDocs(collection(db, 'names'));
      const nameDoc = querySnapshot.docs.find(doc => doc.data().name === selectedName);
      if (nameDoc) {
        if (editingTransactionIndex !== null) {
          const transactions = nameDoc.data().transactions;
          const updatedTransactions = transactions.map((transaction, index) => {
            return index === editingTransactionIndex ? newTransaction : transaction;
          });

          await updateDoc(doc(db, 'names', nameDoc.id), {
            transactions: updatedTransactions
          });
          setPersonTransactions(updatedTransactions);
        } else {
          await updateDoc(doc(db, 'names', nameDoc.id), {
            transactions: arrayUnion(newTransaction)
          });
          setPersonTransactions([...personTransactions, newTransaction]);
        }
      }

      toast.success('Transaction details submitted successfully!');
      setSubmittedData(newTransaction);
      setSubmittedModalIsOpen(true);
      resetModal();
      await fetchNames();
    }
    setLoading(false);
  };

  const resetModal = () => {
    setModalIsOpen(false);
    setMoneyGiven('');
    setMoneyReceived('');
    setSelectedPerson('');
    setSelectedBank('');
    setSelectedPaymentMethod('');
    setEditingTransactionIndex(null);
  };

  const closeSubmittedModal = () => {
    setSubmittedModalIsOpen(false);
  };

  const calculateTotalLeft = () => {
    return personTransactions.reduce((total, transaction) => {
      return total + (parseInt(transaction.moneyGiven) - parseInt(transaction.moneyReceived));
    }, 0);
  };

  const handleEditTransaction = (index) => {
    const transaction = personTransactions[index];
    setMoneyGiven(transaction.moneyGiven);
    setMoneyReceived(transaction.moneyReceived);
    setSelectedPerson(transaction.person);
    setSelectedBank(transaction.bank);
    setSelectedPaymentMethod(transaction.paymentMethod);
    setEditingTransactionIndex(index);
  };

  const handleDeleteTransaction = async (index) => {
    const querySnapshot = await getDocs(collection(db, 'names'));
    const nameDoc = querySnapshot.docs.find(doc => doc.data().name === selectedName);
    if (nameDoc) {
      const transactions = nameDoc.data().transactions;
      const updatedTransactions = transactions.filter((_, i) => i !== index);

      await updateDoc(doc(db, 'names', nameDoc.id), {
        transactions: updatedTransactions,
      });
      setPersonTransactions(updatedTransactions);
    }
  };

  const filteredNames = names.filter(nameItem => 
    nameItem.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <ToastContainer />
      <div style={styles.inputContainer}>
        <input 
          type="text" 
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={styles.input}
          placeholder="Enter a name"
        />
        <button onClick={handleNameSubmit} style={styles.button}>Add Name</button>
      </div>
      <div style={styles.searchContainer}>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.input}
          placeholder="Search for a name..."
        />
      </div>
      <div style={styles.namesList}>
        {filteredNames.map((nameItem) => (
          <div 
            key={nameItem.id} 
            style={styles.nameItem} 
            onClick={() => handleNameClick(nameItem.name)}
          >
            {nameItem.name}
            <FaTrash 
              onClick={(e) => { e.stopPropagation(); handleDelete(nameItem.id); }} 
              style={styles.deleteIcon} 
            />
          </div>
        ))}
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={resetModal}
        style={modalStyles}
        shouldCloseOnEsc={true}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
      >
        <h2>Transaction Details for {selectedName}</h2>
        <input
          type="text"
          value={moneyGiven}
          onChange={(e) => setMoneyGiven(e.target.value)}
          placeholder="Money Given"
          style={styles.input}
        />
        <input
          type="text"
          value={moneyReceived}
          onChange={(e) => setMoneyReceived(e.target.value)}
          placeholder="Money Received"
          style={styles.input}
        />
        <select
          value={selectedPerson}
          onChange={(e) => setSelectedPerson(e.target.value)}
          style={styles.input}
        >
          <option value="">Select Person</option>
          <option value="Sajawal">Sajawal</option>
          <option value="Bilawal">Bilawal</option>
          <option value="Afzal">Afzal</option>
        </select>
        <select
          value={selectedBank}
          onChange={(e) => setSelectedBank(e.target.value)}
          style={styles.input}
        >
          <option value="">Select Bank (Optional)</option>
          <option value="UBL">UBL</option>
          <option value="HBL">HBL</option>
          <option value="Allied">Allied</option>
          <option value="National">National</option>
          <option value="Meezan">Meezan</option>
          <option value="Punjab">Punjab</option>
          <option value="Faisal">Faisal</option>
        </select>
        <select
          value={selectedPaymentMethod}
          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
          style={styles.input}
        >
          <option value="">Select Payment Method</option>
          <option value="Cash">Cash</option>
          <option value="Check">Check</option>
        </select>
        <button 
          onClick={handleModalSubmit} 
          style={styles.button} 
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
        <h3>Previous Transactions</h3>
        {personTransactions.length > 0 ? (
          <TransactionList 
            transactions={personTransactions} 
            onEdit={handleEditTransaction} 
            onDelete={handleDeleteTransaction} 
          />
        ) : (
          <p>No previous transactions available.</p>
        )}
        <div style={styles.totalContainer}>
          <strong>Total Left:</strong> {calculateTotalLeft()}
        </div>
      </Modal>
      <Modal
        isOpen={submittedModalIsOpen}
        onRequestClose={closeSubmittedModal}
        style={modalStyles}
        shouldCloseOnEsc={true}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
      >
        <h2>Submitted Transaction Details</h2>
        <p><strong>Person:</strong> {submittedData.person}</p>
        <p><strong>Money Given:</strong> {submittedData.moneyGiven}</p>
        <p><strong>Money Received:</strong> {submittedData.moneyReceived}</p>
        <p><strong>Bank:</strong> {submittedData.bank || 'N/A'}</p>
        <p><strong>Payment Method:</strong> {submittedData.paymentMethod}</p>
        <button onClick={closeSubmittedModal} style={styles.button}>Close</button>
      </Modal>
    </div>
  );
};

const styles = {
  page: {
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
    marginTop: '20px',
    padding: '0 10px',
  },
  inputContainer: {
    marginBottom: '20px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    marginRight: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginBottom: '10px',
    width: '100%',
    maxWidth: '300px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  searchContainer: {
    marginBottom: '20px',
  },
  namesList: {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  nameItem: {
    backgroundColor: '#f1f1f1',
    padding: '10px',
    borderRadius: '5px',
    margin: '5px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: '300px',
    cursor: 'pointer',
  },
  deleteIcon: {
    cursor: 'pointer',
    color: '#ff0000',
  },
  totalContainer: {
    marginTop: '10px',
    fontWeight: 'bold',
  },
  transactionTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  transactionTableTh: {
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
  },
  transactionTableTd: {
    padding: '10px',
    textAlign: 'center',
    borderBottom: '1px solid #ccc',
  },
  actionIcons: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
};

const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '800px',
    padding: '20px',
    maxHeight: "600px",
  },
};

export default Page;
