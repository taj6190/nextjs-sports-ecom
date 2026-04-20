import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Category from "@/models/Category";

// GET /api/analytics - Advanced analytics for admin dashboard
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalRevenue,
      monthlyRevenue,
      lastMonthRevenue,
      todayRevenue,
      todayOrders,
      revenueByProduct,
      revenueByCategory,
      topProducts,
      ordersByStatus,
      dailyRevenue,
    ] = await Promise.all([
      // Total revenue (non-cancelled)
      Order.aggregate([
        { $match: { orderStatus: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),

      // This month revenue
      Order.aggregate([
        { $match: { orderStatus: { $ne: "cancelled" }, createdAt: { $gte: thisMonth } } },
        { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),

      // Last month revenue
      Order.aggregate([
        { $match: { orderStatus: { $ne: "cancelled" }, createdAt: { $gte: lastMonth, $lt: thisMonth } } },
        { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),

      // Today's revenue
      Order.aggregate([
        { $match: { orderStatus: { $ne: "cancelled" }, createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),

      // Today's order count
      Order.countDocuments({ createdAt: { $gte: today } }),

      // Revenue by product (top 10)
      Order.aggregate([
        { $match: { orderStatus: { $ne: "cancelled" } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            productName: { $first: "$items.productName" },
            totalRevenue: { $sum: "$items.subtotal" },
            totalQuantity: { $sum: "$items.quantity" },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 },
      ]),

      // Revenue by category
      Order.aggregate([
        { $match: { orderStatus: { $ne: "cancelled" } } },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.product",
            foreignField: "_id",
            as: "productInfo",
          },
        },
        { $unwind: "$productInfo" },
        {
          $lookup: {
            from: "categories",
            localField: "productInfo.category",
            foreignField: "_id",
            as: "categoryInfo",
          },
        },
        { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$productInfo.category",
            categoryName: { $first: "$categoryInfo.name" },
            categoryIcon: { $first: "$categoryInfo.icon" },
            totalRevenue: { $sum: "$items.subtotal" },
            totalQuantity: { $sum: "$items.quantity" },
          },
        },
        { $sort: { totalRevenue: -1 } },
      ]),

      // Top purchased products
      Product.find({ isActive: true, purchaseCount: { $gt: 0 } })
        .select("name slug images basePrice purchaseCount")
        .sort({ purchaseCount: -1 })
        .limit(10)
        .lean(),

      // Orders by status
      Order.aggregate([
        { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
      ]),

      // Daily revenue last 30 days
      Order.aggregate([
        { $match: { orderStatus: { $ne: "cancelled" }, createdAt: { $gte: last30Days } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Get category count
    const totalCategories = await Category.countDocuments({ isActive: true, deletedAt: null });

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalOrders: totalRevenue[0]?.count || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        monthlyOrders: monthlyRevenue[0]?.count || 0,
        lastMonthRevenue: lastMonthRevenue[0]?.total || 0,
        todayRevenue: todayRevenue[0]?.total || 0,
        todayOrders,
        revenueByProduct,
        revenueByCategory,
        topProducts,
        ordersByStatus: ordersByStatus.reduce((acc: Record<string, number>, item: { _id: string; count: number }) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        dailyRevenue,
        totalCategories,
      },
    });
  } catch (error) {
    console.error("Analytics GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
