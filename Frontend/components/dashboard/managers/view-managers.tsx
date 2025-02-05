"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";

interface Manager {
    name: string;
    email: string;
    status: "Invited" | "Accepted";
  }

export function ManagerList(){
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [managers, setManagers] = useState<Manager[]>([
        { name: "Alice Johnson", email: "alice@example.com", status: "Invited" },
        { name: "Bob Smith", email: "bob@example.com", status: "Accepted" },
        { name: "Carol White", email: "carol@example.com", status: "Invited" },
      ]);
      const filteredManagers = managers.filter(
        (manager) =>
          manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          manager.email.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const resendInvite = (email: string) => {
        console.log(`Resending invite to ${email}`);
        // Add actual API logic if required
      };

      const removeManager = (email: string) => {
        setManagers((prev) => prev.filter((manager) => manager.email !== email));
        console.log(`Removed manager with email ${email}`);
      };

    return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md">
        <div className="flex items-center gap-10">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">All Managers</h2>
            <div className="mb-4 flex-1">
                <Input
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
                />
            </div>
        </div>

        <Table className="w-full text-sm text-left border border-gray-200 bg-white">
            <TableHeader>
                <TableRow className="bg-gray-100">
                <TableHead className="p-3">Name</TableHead>
                <TableHead className="p-3">Status</TableHead>
                <TableHead className="p-3 text-center">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredManagers.length > 0 ? (
                filteredManagers.map((manager, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell className="p-3">{manager.name}</TableCell>
                    <TableCell className="p-3">
                        <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                            manager.status === "Accepted"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                        >
                        {manager.status}
                        </span>
                    </TableCell>
                    <TableCell className="p-3 text-center space-x-2">
                        {manager.status === "Invited" && (
                        <Button
                            onClick={() => resendInvite(manager.email)}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"
                        >
                            Resend Invite
                        </Button>
                        )}
                        <Button
                        onClick={() => removeManager(manager.email)}
                        className="text-xs bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                        >
                        Remove
                        </Button>
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={3} className="p-3 text-center text-gray-500">
                    No managers found.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
        </Table>
    </div>
    )
}