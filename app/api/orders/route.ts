import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Create a new order
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { items, shippingAddress, paymentMethod, notes } = body;

        if (!items || items.length === 0) {
            return NextResponse.json(
                { error: 'Order must contain at least one item' },
                { status: 400 }
            );
        }

        if (!shippingAddress) {
            return NextResponse.json(
                { error: 'Shipping address is required' },
                { status: 400 }
            );
        }

        // Calculate total amount
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const productId = item.productId || item.id;

            if (!productId) {
                return NextResponse.json(
                    { error: 'Product ID is missing for one of the items' },
                    { status: 400 }
                );
            }

            const product = await prisma.product.findUnique({
                where: { id: productId },
            });

            if (!product) {
                return NextResponse.json(
                    { error: `Product ${productId} not found` },
                    { status: 404 }
                );
            }

            const price = product.isOnSale && product.salePrice
                ? product.salePrice
                : product.price;

            totalAmount += price * item.quantity;

            orderItems.push({
                productId: productId,
                quantity: item.quantity,
                price: price,
                size: item.size,
                color: item.color,
            });
        }

        // Generate unique order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Handle address saving if it's the user's first time or they don't have one set
        const fullUser = await prisma.user.findUnique({
            where: { id: user.userId },
            select: {
                shippingAddressId: true,
                firstName: true,
                lastName: true,
                phone: true
            }
        });

        let finalShippingAddress = shippingAddress;

        if (fullUser && !fullUser.shippingAddressId) {
            try {
                // Save this address as the default for the user
                const savedAddress = await prisma.address.create({
                    data: {
                        userId: user.userId,
                        fullName: shippingAddress.fullName || `${fullUser.firstName || ''} ${fullUser.lastName || ''}`.trim() || 'Client',
                        street: shippingAddress.street || shippingAddress.address || '',
                        city: shippingAddress.city || '',
                        postalCode: shippingAddress.postalCode || shippingAddress.zipCode || '',
                        country: shippingAddress.country || 'France',
                        phone: shippingAddress.phone || fullUser.phone || '',
                        isDefault: true
                    }
                });

                // Link it to the user
                await prisma.user.update({
                    where: { id: user.userId },
                    data: { shippingAddressId: savedAddress.id }
                });
            } catch (addrError) {
                console.error('Failed to save address:', addrError);
                // Continue with order creation even if address saving fails
            }
        }

        // Create order
        const order = await prisma.order.create({
            data: {
                userId: user.userId,
                orderNumber,
                totalAmount,
                shippingAddress: JSON.stringify(finalShippingAddress),

                // Customer Snapshot
                customerEmail: user.email,
                customerName: shippingAddress.fullName || `${fullUser?.firstName || ''} ${fullUser?.lastName || ''}`.trim() || 'Client',
                customerPhone: shippingAddress.phone || fullUser?.phone || '',

                // Structured Shipping Address
                shippingName: shippingAddress.fullName || `${fullUser?.firstName || ''} ${fullUser?.lastName || ''}`.trim(),
                shippingStreet: shippingAddress.street || shippingAddress.address || '',
                shippingCity: shippingAddress.city || '',
                shippingPostalCode: shippingAddress.postalCode || shippingAddress.zipCode || '',
                shippingCountry: shippingAddress.country || 'France',
                shippingPhone: shippingAddress.phone || fullUser?.phone || '',

                paymentMethod,
                notes,
                items: {
                    create: orderItems,
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        return NextResponse.json({
            message: 'Order created successfully',
            order,
        });
    } catch (error) {
        console.error('Create order error:', error);
        return NextResponse.json(
            { error: 'Failed to create order' },
            { status: 500 }
        );
    }
}

// Get user's orders
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const orders = await prisma.order.findMany({
            where: { userId: user.userId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ orders });
    } catch (error) {
        console.error('Get orders error:', error);
        return NextResponse.json(
            { error: 'Failed to get orders' },
            { status: 500 }
        );
    }
}
