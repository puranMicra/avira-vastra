import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const data = await adminAPI.getCustomers();
            setCustomers(data?.customers ?? (Array.isArray(data) ? data : []));
        } catch (err) {
            toast.error('Failed to fetch customer data');
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
    );

    if (loading) return <div className="admin-loading">Loading Customers...</div>;

    return (
        <div className="admin-users">
            <h2 className="admin-title">Customer Relationship Management</h2>

            <div className="admin-card">
                <div style={{ marginBottom: '2rem' }}>
                    <div className="admin-form" style={{ maxWidth: '400px' }}>
                        <div className="form-group">
                            <label>Search Customers</label>
                            <input
                                type="text"
                                placeholder="Name, Email, or Phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Contact Information</th>
                                <th>Joined On</th>
                                <th>Total Orders</th>
                                <th>Last Order</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map((customer) => (
                                <tr key={customer._id}>
                                    <td>
                                        <div style={{ fontWeight: '600', color: 'var(--admin-primary)' }}>{customer.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#666' }}>ID: {customer._id.slice(-6).toUpperCase()}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <span style={{ fontSize: '0.9rem' }}>📧 {customer.email}</span>
                                            <span style={{ fontSize: '0.9rem' }}>📱 {customer.phone}</span>
                                        </div>
                                    </td>
                                    <td>{new Date(customer.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                    <td>
                                        <span style={{
                                            background: '#f0f0f0',
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '4px',
                                            fontWeight: '600'
                                        }}>
                                            {customer.totalOrders}
                                        </span>
                                    </td>
                                    <td>
                                        {customer.lastOrderDate ? (
                                            new Date(customer.lastOrderDate).toLocaleDateString()
                                        ) : (
                                            <span style={{ color: '#ccc', fontStyle: 'italic' }}>No orders yet</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredCustomers.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
                                        No customers found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
