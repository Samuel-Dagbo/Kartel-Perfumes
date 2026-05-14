"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Shield, User as UserIcon, Mail, Phone, Calendar, AlertTriangle, ToggleLeft, ToggleRight, Filter } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

interface User {
  _id: string;
  email: string;
  name: string;
  role: "admin" | "customer" | "staff";
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

interface UsersTableProps {
  users: User[];
  onRefresh: () => void;
}

const roleColors: Record<string, "premium" | "default" | "info"> = {
  admin: "premium",
  staff: "info",
  customer: "default",
};

const roles = ["admin", "staff", "customer"] as const;

export default function UsersTable({ users, onRefresh }: UsersTableProps) {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        toast.success(`User role updated to ${newRole}`);
        setSelectedUser(null);
        onRefresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update role");
      }
    } catch {
      toast.error("Failed to update user");
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, isActive: !user.isActive }),
      });
      if (res.ok) {
        toast.success(`User ${user.isActive ? "deactivated" : "activated"}`);
        onRefresh();
      } else {
        toast.error("Failed to update user status");
      }
    } catch {
      toast.error("Failed to update user");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-mist/50 rounded-xl text-sm placeholder:text-charcoal/25 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {["all", "admin", "staff", "customer"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2.5 text-xs tracking-[0.1em] uppercase rounded-xl border transition-all duration-200 font-medium ${
                roleFilter === r
                  ? "bg-charcoal text-white border-charcoal shadow-sm"
                  : "bg-white text-charcoal/50 border-mist/60 hover:border-charcoal/30 hover:text-charcoal"
              }`}
            >
              {r === "all" ? "All" : r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-mist/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mist/40 bg-gradient-to-r from-mist/30 to-mist/10">
                <th className="text-left py-4 px-5 text-[10px] tracking-[0.15em] uppercase text-charcoal/50 font-medium">User</th>
                <th className="text-left py-4 px-5 text-[10px] tracking-[0.15em] uppercase text-charcoal/50 font-medium hidden md:table-cell">Contact</th>
                <th className="text-left py-4 px-5 text-[10px] tracking-[0.15em] uppercase text-charcoal/50 font-medium">Role</th>
                <th className="text-left py-4 px-5 text-[10px] tracking-[0.15em] uppercase text-charcoal/50 font-medium hidden sm:table-cell">Status</th>
                <th className="text-left py-4 px-5 text-[10px] tracking-[0.15em] uppercase text-charcoal/50 font-medium hidden lg:table-cell">Joined</th>
                <th className="text-right py-4 px-5 text-[10px] tracking-[0.15em] uppercase text-charcoal/50 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((user) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-mist/20 hover:bg-mist/10 transition-colors duration-150"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/10 to-gold/5 flex items-center justify-center shrink-0 border border-gold/10 shadow-sm">
                          <UserIcon className="w-4 h-4 text-gold-dark/60" />
                        </div>
                        <div>
                          <span className="font-medium text-charcoal">{user.name}</span>
                          <span className="block text-xs text-charcoal/30 mt-0.5">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-charcoal/50">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-charcoal/40">
                            <Phone className="w-3 h-3" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <Badge variant={roleColors[user.role] || "default"} size="sm">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-4 px-5 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          {user.isActive ? (
                            <>
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage/40 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-sage" />
                            </>
                          ) : (
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-charcoal/30" />
                          )}
                        </span>
                        <span className="text-xs text-charcoal/50">
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-charcoal/40 text-xs hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleActive(user)}
                          className="p-2 hover:bg-mist/50 rounded-xl transition-colors duration-200"
                          aria-label={user.isActive ? "Deactivate user" : "Activate user"}
                          title={user.isActive ? "Deactivate" : "Activate"}
                        >
                          {user.isActive ? (
                            <ToggleRight className="w-4 h-4 text-sage" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-charcoal/30" />
                          )}
                        </button>
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 hover:bg-mist/50 rounded-xl transition-colors duration-200"
                          aria-label="Manage user"
                        >
                          <Shield className="w-4 h-4 text-charcoal/40 hover:text-gold-dark transition-colors" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-mist/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-7 h-7 text-charcoal/20" />
            </div>
            <p className="text-charcoal/40 text-sm">No users found</p>
          </div>
        )}
      </div>

      {/* Role Management Modal */}
      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title={`Manage User — ${selectedUser?.name}`} size="md">
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-mist/30 to-mist/10 rounded-xl border border-mist/20">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/10 to-gold/5 flex items-center justify-center border border-gold/10">
                <UserIcon className="w-5 h-5 text-gold-dark/60" />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal">{selectedUser.name}</p>
                <p className="text-xs text-charcoal/50">{selectedUser.email}</p>
                <p className="text-xs text-charcoal/40 mt-0.5">
                  Current role: <span className="font-medium capitalize text-gold-dark">{selectedUser.role}</span>
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs tracking-[0.15em] uppercase text-charcoal/60 mb-3 font-medium">Change Role</p>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleUpdate(selectedUser._id, role)}
                    disabled={selectedUser.role === role}
                    className={`flex flex-col items-center gap-2 py-4 rounded-xl border text-xs transition-all duration-200 capitalize ${
                      selectedUser.role === role
                        ? "border-gold bg-gold/5 text-gold-dark shadow-sm ring-1 ring-gold/20 cursor-not-allowed"
                        : "border-mist text-charcoal/60 hover:border-charcoal/30 hover:bg-mist/20 hover:shadow-sm"
                    }`}
                  >
                    <Shield className={`w-5 h-5 ${selectedUser.role === role ? "text-gold" : ""}`} />
                    {role}
                    {selectedUser.role === role && (
                      <span className="text-[9px] text-gold/60">Current</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {selectedUser.role !== "admin" && (
              <div className="pt-2">
                <p className="text-xs tracking-[0.15em] uppercase text-charcoal/60 mb-3 font-medium">Account Status</p>
                <button
                  onClick={() => { handleToggleActive(selectedUser); setSelectedUser(null); }}
                  className={`flex items-center gap-3 w-full p-4 rounded-xl border text-sm transition-all duration-200 ${
                    selectedUser.isActive
                      ? "border-rosegold/30 text-rosegold hover:bg-rosegold/5"
                      : "border-sage/30 text-sage hover:bg-sage/5"
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                  {selectedUser.isActive ? "Deactivate this user" : "Activate this user"}
                </button>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-mist/40">
              <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
