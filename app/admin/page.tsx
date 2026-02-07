import prisma from '@/lib/prisma';
import Link from 'next/link';
import DeleteProductButton from '@/components/admin/DeleteProductButton';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const products = await prisma.product.findMany({ include: { category: true } });
    const categories = await prisma.category.findMany();
    const usersCount = await prisma.user.count();
    const ordersCount = await prisma.order.count();

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h1>Admin Dashboard</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Link href="/admin/orders" className="btn btn-primary" style={{ background: '#27ae60' }}>Manage Orders ({ordersCount})</Link>
                    <Link href="/admin/users" className="btn btn-primary" style={{ background: '#8e44ad' }}>Manage Users ({usersCount})</Link>
                    <Link href="/admin/products/new" className="btn btn-primary">Add Product</Link>
                    <Link href="/admin/categories" className="btn btn-secondary" style={{ background: '#e67e22' }}>Manage Categories</Link>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div style={cardStyle}>
                    <h3>Products</h3>
                    <p style={valueStyle}>{products.length}</p>
                </div>
                <div style={cardStyle}>
                    <h3>Categories</h3>
                    <p style={valueStyle}>{categories.length}</p>
                </div>
                <div style={{ ...cardStyle, borderLeft: '4px solid #27ae60' }}>
                    <h3>Total Orders</h3>
                    <p style={valueStyle}>{ordersCount}</p>
                    <Link href="/admin/orders" style={{ color: '#27ae60', fontSize: '0.9rem' }}>View All →</Link>
                </div>
                <div style={{ ...cardStyle, borderLeft: '4px solid #8e44ad' }}>
                    <h3>Total Users</h3>
                    <p style={valueStyle}>{usersCount}</p>
                    <Link href="/admin/users" style={{ color: '#8e44ad', fontSize: '0.9rem' }}>View All →</Link>
                </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
                <h2>Products ({products.length})</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '10px' }}>ID</th>
                            <th style={{ padding: '10px' }}>Image</th>
                            <th style={{ padding: '10px' }}>Title</th>
                            <th style={{ padding: '10px' }}>Price</th>
                            <th style={{ padding: '10px' }}>Category</th>
                            <th style={{ padding: '10px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}>{product.id}</td>
                                <td style={{ padding: '10px' }}>
                                    {product.imageUrl && <img src={product.imageUrl} alt={product.title} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />}
                                </td>
                                <td style={{ padding: '10px' }}>{product.title}</td>
                                <td style={{ padding: '10px' }}>${product.price}</td>
                                <td style={{ padding: '10px' }}>{product.category.name}</td>
                                <td style={{ padding: '10px', display: 'flex', gap: '8px' }}>
                                    <Link
                                        href={`/admin/products/${product.id}`}
                                        style={{
                                            padding: '8px',
                                            borderRadius: '4px',
                                            background: '#f0f0f0',
                                            color: '#333',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        title="Modifier"
                                    >
                                        ✏️
                                    </Link>
                                    <DeleteProductButton id={product.id} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div>
                <h2>Categories ({categories.length})</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '10px' }}>ID</th>
                            <th style={{ padding: '10px' }}>Image</th>
                            <th style={{ padding: '10px' }}>Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}>{cat.id}</td>
                                <td style={{ padding: '10px' }}>
                                    {cat.imageUrl && <img src={cat.imageUrl} alt={cat.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />}
                                </td>
                                <td style={{ padding: '10px', fontWeight: 'bold' }}>{cat.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const cardStyle: React.CSSProperties = {
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    textAlign: 'center'
};

const valueStyle: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '10px 0'
};
