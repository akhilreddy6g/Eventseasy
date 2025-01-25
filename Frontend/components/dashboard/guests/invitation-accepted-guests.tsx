import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AcceptedUser {
  name: string;
  email: string;
}

const InvitationAcceptedList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [acceptedUsers, setAcceptedUsers] = useState<AcceptedUser[]>([
    { name: "John Doe", email: "john@example.com" },
    { name: "Jane Smith", email: "jane@example.com" },
    { name: "Michael Brown", email: "michael@example.com" },
  ]);

  const filteredAcceptedUsers = acceptedUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const removeUser = (email: string) => {
    setAcceptedUsers((prev) => prev.filter((user) => user.email !== email));
    console.log(`User with email ${email} removed.`);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md">
        <div className="flex items-center gap-10">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Accepted Guests</h2>
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
            <TableHead className="p-3">Email</TableHead>
            <TableHead className="p-3 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAcceptedUsers.length > 0 ? (
            filteredAcceptedUsers.map((user, index) => (
              <TableRow key={index} className="hover:bg-gray-50">
                <TableCell className="p-3">{user.name}</TableCell>
                <TableCell className="p-3">{user.email}</TableCell>
                <TableCell className="p-3 text-center">
                  <Button
                    onClick={() => removeUser(user.email)}
                    className="text-xs font-medium bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="p-3 text-center text-gray-500 italic">
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvitationAcceptedList;
