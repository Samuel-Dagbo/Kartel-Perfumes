import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { Sale } from "@/lib/models/Sale";
import { Order } from "@/lib/models/Order";
import { Product } from "@/lib/models/Product";
import { User } from "@/lib/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin" && session.user.role !== "staff") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalProducts,
      totalUsers,
      activeUsers,
      lowStockCount,
      paidSalesAgg,
      paidOrdersAgg,
      todaySalesAgg,
      todayOrdersAgg,
      orderStatusesAgg,
      salePaymentMethods,
      orderPaymentMethods,
      dailySalesRevenue,
      dailyOrderRevenue,
      topSaleProducts,
      topOrderProducts,
      recentSales,
      recentOrders,
      lastWeekSales,
      lastWeekOrders,
      prevWeekSales,
      prevWeekOrders,
    ] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Product.countDocuments({ stock: { $gt: 0 }, isActive: true, $expr: { $lte: ["$stock", 5] } }),

      Sale.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, totalRevenue: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),

      Order.aggregate([
        { $match: { paymentStatus: "paid", status: { $ne: "cancelled" }, createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, totalRevenue: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),

      Sale.aggregate([
        { $match: { createdAt: { $gte: todayStart } } },
        { $group: { _id: null, totalRevenue: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),

      Order.aggregate([
        { $match: { paymentStatus: "paid", status: { $ne: "cancelled" }, createdAt: { $gte: todayStart } } },
        { $group: { _id: null, totalRevenue: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),

      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      Sale.aggregate([
        { $group: { _id: "$paymentMethod", total: { $sum: "$total" } } },
      ]),

      Order.aggregate([
        { $match: { paymentStatus: "paid", status: { $ne: "cancelled" } } },
        { $group: { _id: "$paymentMethod", total: { $sum: "$total" } } },
      ]),

      Sale.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),

      Order.aggregate([
        { $match: { paymentStatus: "paid", status: { $ne: "cancelled" }, createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),

      Sale.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $unwind: "$items" },
        { $group: { _id: "$items.name", quantity: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
      ]),

      Order.aggregate([
        { $match: { paymentStatus: "paid", status: { $ne: "cancelled" }, createdAt: { $gte: thirtyDaysAgo } } },
        { $unwind: "$items" },
        { $group: { _id: "$items.name", quantity: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
      ]),

      Sale.find().sort({ createdAt: -1 }).limit(10).lean(),
      Order.find().sort({ createdAt: -1 }).limit(10).lean(),

      Sale.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),

      Order.aggregate([
        { $match: { paymentStatus: "paid", status: { $ne: "cancelled" }, createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),

      Sale.aggregate([
        { $match: { $and: [{ createdAt: { $gte: fourteenDaysAgo } }, { createdAt: { $lt: sevenDaysAgo } }] } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),

      Order.aggregate([
        { $match: { paymentStatus: "paid", status: { $ne: "cancelled" }, $and: [{ createdAt: { $gte: fourteenDaysAgo } }, { createdAt: { $lt: sevenDaysAgo } }] } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

    const totalSaleRevenue = paidSalesAgg[0]?.totalRevenue || 0;
    const totalOrderRevenue = paidOrdersAgg[0]?.totalRevenue || 0;
    const totalRevenue = totalSaleRevenue + totalOrderRevenue;
    const totalTransactions = (paidSalesAgg[0]?.count || 0) + (paidOrdersAgg[0]?.count || 0);

    const todaySaleRevenue = todaySalesAgg[0]?.totalRevenue || 0;
    const todayOrderRevenue = todayOrdersAgg[0]?.totalRevenue || 0;

    const orderStatuses: Record<string, number> = {};
    orderStatusesAgg.forEach((o: { _id: string; count: number }) => {
      orderStatuses[o._id] = o.count;
    });

    const paymentMethods: Record<string, number> = {};
    salePaymentMethods.forEach((s: { _id: string; total: number }) => {
      paymentMethods[s._id] = (paymentMethods[s._id] || 0) + s.total;
    });
    orderPaymentMethods.forEach((o: { _id: string; total: number }) => {
      paymentMethods[o._id] = (paymentMethods[o._id] || 0) + o.total;
    });

    const dailyRevenueMap: Record<string, { revenue: number; count: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      dailyRevenueMap[key] = { revenue: 0, count: 0 };
    }
    [...dailySalesRevenue, ...dailyOrderRevenue].forEach((entry: { _id: string; revenue: number; count: number }) => {
      if (dailyRevenueMap[entry._id]) {
        dailyRevenueMap[entry._id].revenue += entry.revenue;
        dailyRevenueMap[entry._id].count += entry.count;
      }
    });
    const last30Days = Object.entries(dailyRevenueMap).map(([date, data]) => ({
      date,
      revenue: Math.round(data.revenue * 100) / 100,
      transactions: data.count,
    }));

    const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    [...topSaleProducts, ...topOrderProducts].forEach((item: { _id: string; quantity: number; revenue: number }) => {
      if (productSalesMap[item._id]) {
        productSalesMap[item._id].quantity += item.quantity;
        productSalesMap[item._id].revenue += item.revenue;
      } else {
        productSalesMap[item._id] = { name: item._id, quantity: item.quantity, revenue: item.revenue };
      }
    });
    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const lastWeekTotal = (lastWeekSales[0]?.total || 0) + (lastWeekOrders[0]?.total || 0);
    const prevWeekTotal = (prevWeekSales[0]?.total || 0) + (prevWeekOrders[0]?.total || 0);
    const revenueTrend = prevWeekTotal > 0
      ? Math.round(((lastWeekTotal - prevWeekTotal) / prevWeekTotal) * 100)
      : 0;

    const allRecent = [
      ...recentSales.map((s) => ({
        _id: s._id,
        title: s.saleNumber,
        type: "sale" as const,
        total: s.total,
        itemCount: (s.items || []).reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0),
        paymentMethod: s.paymentMethod,
        createdAt: s.createdAt,
      })),
      ...recentOrders.map((o) => ({
        _id: o._id,
        title: o.orderNumber,
        type: "order" as const,
        total: o.total,
        itemCount: (o.items || []).reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0),
        paymentMethod: o.paymentMethod,
        createdAt: o.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalTransactions,
      totalOrders: orderStatusesAgg.reduce((sum: number, o: { count: number }) => sum + o.count, 0),
      totalSales: paidSalesAgg[0]?.count || 0,
      todayRevenue: Math.round((todaySaleRevenue + todayOrderRevenue) * 100) / 100,
      todayTransactions: (todaySalesAgg[0]?.count || 0) + (todayOrdersAgg[0]?.count || 0),
      lowStockCount,
      totalProducts,
      totalUsers,
      activeUsers,
      revenueTrend,
      paymentMethods,
      orderStatuses,
      last30Days,
      topProducts,
      topTransactions: allRecent.slice(0, 5),
      recentTransactions: allRecent.slice(0, 10),
    });
  } catch (error) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
