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

    const [
      rawSales,
      rawOrders,
      rawProducts,
      rawUsers,
      recentSales,
      recentOrders,
    ] = await Promise.all([
      Sale.find().sort({ createdAt: -1 }).lean(),
      Order.find().sort({ createdAt: -1 }).lean(),
      Product.find().lean(),
      User.find().lean(),
      Sale.find({ createdAt: { $gte: thirtyDaysAgo } }).sort({ createdAt: -1 }).lean(),
      Order.find({ createdAt: { $gte: thirtyDaysAgo } }).sort({ createdAt: -1 }).lean(),
    ]);

    const sales = rawSales as unknown as Array<{
      _id: string;
      saleNumber: string;
      total: number;
      subtotal: number;
      tax: number;
      paymentMethod: string;
      createdAt: Date;
      items: Array<{ name: string; quantity: number; price: number }>;
    }>;

    const orders = rawOrders as unknown as Array<{
      _id: string;
      orderNumber: string;
      total: number;
      status: string;
      paymentStatus: string;
      paymentMethod: string;
      createdAt: Date;
      items: Array<{ name: string; quantity: number; price: number }>;
    }>;

    const allTransactions = [
      ...sales.map((s) => ({ ...s, type: "sale" as const })),
      ...orders.map((o) => ({ ...o, type: "order" as const })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const paidTransactions = allTransactions.filter((t) => {
      if (t.type === "sale") return true;
      return t.paymentStatus === "paid" && t.status !== "cancelled";
    });

    const totalRevenue = paidTransactions.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = allTransactions.length;

    const recentTransactions = allTransactions.slice(0, 10);
    const topTransactions = paidTransactions.slice(0, 5);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayTransactions = paidTransactions.filter((t) => new Date(t.createdAt) >= todayStart);
    const lowStockCount = rawProducts.filter((p: { stock: number }) => p.stock > 0 && p.stock <= 5).length;

    const paymentMethods: Record<string, number> = {};
    paidTransactions.forEach((t) => {
      const method = t.paymentMethod || "unknown";
      paymentMethods[method] = (paymentMethods[method] || 0) + t.total;
    });

    const orderStatuses: Record<string, number> = {};
    orders.forEach((o) => {
      orderStatuses[o.status] = (orderStatuses[o.status] || 0) + 1;
    });

    const dailyRevenue: Record<string, number> = {};
    const last30Days: Array<{ date: string; revenue: number; transactions: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      dailyRevenue[key] = 0;
    }
    recentSales.forEach((s: { total: number; createdAt: Date }) => {
      const key = new Date(s.createdAt).toISOString().split("T")[0];
      if (dailyRevenue[key] !== undefined) dailyRevenue[key] += s.total;
    });
    recentOrders.forEach((o: { total: number; createdAt: Date; paymentStatus: string; status: string }) => {
      if (o.paymentStatus !== "paid" || o.status === "cancelled") return;
      const key = new Date(o.createdAt).toISOString().split("T")[0];
      if (dailyRevenue[key] !== undefined) dailyRevenue[key] += o.total;
    });
    Object.entries(dailyRevenue).forEach(([date, revenue]) => {
      const dayTransactions = paidTransactions.filter(
        (t) => new Date(t.createdAt).toISOString().split("T")[0] === date
      );
      last30Days.push({
        date,
        revenue: Math.round(revenue * 100) / 100,
        transactions: dayTransactions.length,
      });
    });

    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    paidTransactions.forEach((t) => {
      (t.items || []).forEach((item: { name: string; quantity: number; price: number }) => {
        if (!productSales[item.name]) {
          productSales[item.name] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSales[item.name].quantity += item.quantity;
        productSales[item.name].revenue += item.price * item.quantity;
      });
    });
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const weekAgoRevenue = paidTransactions
      .filter((t) => new Date(t.createdAt) >= sevenDaysAgo)
      .reduce((sum, t) => sum + t.total, 0);
    const twoWeeksAgoRevenue = paidTransactions
      .filter(
        (t) =>
          new Date(t.createdAt) >= new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) &&
          new Date(t.createdAt) < sevenDaysAgo
      )
      .reduce((sum, t) => sum + t.total, 0);
    const revenueTrend =
      twoWeeksAgoRevenue > 0
        ? Math.round(((weekAgoRevenue - twoWeeksAgoRevenue) / twoWeeksAgoRevenue) * 100)
        : 0;

    return NextResponse.json({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalTransactions,
      totalOrders: orders.length,
      totalSales: sales.length,
      todayRevenue: Math.round(todayTransactions.reduce((sum, t) => sum + t.total, 0) * 100) / 100,
      todayTransactions: todayTransactions.length,
      lowStockCount,
      totalProducts: rawProducts.length,
      totalUsers: rawUsers.length,
      activeUsers: rawUsers.filter((u: { isActive: boolean }) => u.isActive).length,
      revenueTrend,
      paymentMethods,
      orderStatuses,
      last30Days,
      topProducts,
      topTransactions: topTransactions.map((t) => ({
        _id: t._id,
        type: t.type,
        title: t.type === "sale" ? t.saleNumber : t.orderNumber,
        total: t.total,
        itemCount: (t.items || []).reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0),
        paymentMethod: t.paymentMethod,
        createdAt: t.createdAt,
      })),
      recentTransactions: recentTransactions.map((t) => ({
        _id: t._id,
        title: t.type === "sale" ? t.saleNumber : t.orderNumber,
        type: t.type,
        total: t.total,
        itemCount: (t.items || []).reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0),
        paymentMethod: t.paymentMethod,
        createdAt: t.createdAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
