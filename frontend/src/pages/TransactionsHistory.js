import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getAuthItem } from '../utils/authStorage';
import './Dashboard.css'; // Reusing premium table styles

const TransactionsHistory = ({ products }) => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const token = getAuthItem("token");
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const response = await axios.get("http://localhost:5000/api/sales", config);
                setSales(response.data);
            } catch (err) {
                console.error("Error fetching sales history:", err);
                toast.error("Failed to load transaction history");
            } finally {
                setLoading(false);
            }
        };
        fetchSales();
    }, []);

    const filteredSales = sales.filter(sale => {
        const matchId = sale._id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchMethod = (sale.paymentMethod || 'cash').toLowerCase().includes(searchTerm.toLowerCase());
        return matchId || matchMethod;
    });

    return (
        <div style={{ padding: '40px', background: '#f8fafc', minHeight: '100vh' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                            background: 'white', border: '1px solid #e2e8f0', color: '#64748b',
                            padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '16px',
                            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600'
                        }}
                    >
                        <i className="fas fa-arrow-left"></i> Back to Dashboard
                    </button>
                    <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800', color: '#0f172a' }}>
                        Transaction History
                    </h1>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '16px' }}>
                        Comprehensive view of all processed supermarket sales.
                    </p>
                </div>

                {/* Search & Actions */}
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                        <i className="fas fa-search" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                        <input
                            type="text"
                            placeholder="Search by ID or Payment..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px',
                                padding: '12px 16px 12px 42px', fontSize: '14px', width: '300px',
                                outline: 'none', color: '#0f172a', fontWeight: '500'
                            }}
                        />
                    </div>
                    <button style={{
                        background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px',
                        padding: '12px 24px', fontWeight: 'bold', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <i className="fas fa-download"></i> Export CSV
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '40px', color: '#3b82f6' }}></i>
                </div>
            ) : (
                <div className="table-panel-modern" style={{ marginTop: 0 }}>
                    <div className="table-responsive">
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Transaction ID / Time</th>
                                    <th>Customer Detail</th>
                                    <th>Purchased Items</th>
                                    <th>Payment Type</th>
                                    <th>Total Amount</th>
                                    <th style={{ textAlign: 'right' }}>Receipt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSales.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                                            <i className="fas fa-search" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}></i>
                                            <p style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>No transactions found</p>
                                            <p>Try adjusting your search criteria.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSales.map((sale) => {
                                        const paymentMethod = sale.paymentMethod || 'cash';
                                        const paymentIcons = { cash: 'fa-money-bill-wave', card: 'fa-credit-card', upi: 'fa-mobile-alt' };

                                        return (
                                            <tr key={sale._id}>
                                                <td>
                                                    <div className="table-item-primary">
                                                        <div className="table-item-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                                                            <i className="fas fa-receipt"></i>
                                                        </div>
                                                        <div className="table-item-details">
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <strong>#{sale._id.toUpperCase()}</strong>
                                                                <button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(sale._id);
                                                                        toast.success("Bill ID copied to clipboard!");
                                                                    }}
                                                                    style={{
                                                                        background: 'none', border: 'none', color: '#94a3b8',
                                                                        cursor: 'pointer', padding: '2px 4px', fontSize: '12px'
                                                                    }}
                                                                    title="Copy Bill ID"
                                                                >
                                                                    <i className="far fa-copy"></i>
                                                                </button>
                                                            </div>
                                                            <span>{new Date(sale.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(sale.date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="table-item-details">
                                                        <strong>{sale.customerName || 'Walk-in Customer'}</strong>
                                                        <span>{sale.customerPhone || 'No phone provided'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '300px' }}>
                                                        {sale.items?.map((item, idx) => {
                                                            const product = products.find(p => p._id === item.product?._id || p._id === item.product);
                                                            const name = product ? product.name : 'Unknown Item';
                                                            return (
                                                                <span key={idx} style={{
                                                                    fontSize: '12px', color: '#475569', background: '#f1f5f9',
                                                                    padding: '4px 8px', borderRadius: '6px', fontWeight: '600',
                                                                    border: '1px solid #e2e8f0'
                                                                }}>
                                                                    {item.quantity}x {name}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontWeight: '600' }}>
                                                        <i className={`fas ${paymentIcons[paymentMethod]}`}></i>
                                                        {paymentMethod.toUpperCase()}
                                                    </div>
                                                </td>
                                                <td>
                                                    <strong style={{ fontSize: '16px', color: '#0f172a' }}>₹{(sale.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button
                                                        onClick={() => navigate(`/bill/${sale._id}`)}
                                                        style={{
                                                            background: 'transparent', border: '1px solid #e2e8f0', color: '#3b82f6',
                                                            padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
                                                            display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                                    >
                                                        <i className="fas fa-file-invoice"></i> View Bill
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionsHistory;
