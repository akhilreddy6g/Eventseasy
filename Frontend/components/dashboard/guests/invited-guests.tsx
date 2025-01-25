import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Invitee {
  name: string;
  email: string;
}

const InvitedList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [invitees, setInvitees] = useState<Invitee[]>([
    { name: "Alice Johnson", email: "alice@example.com" },
    { name: "Bob Smith", email: "bob@example.com" },
    { name: "Carol White", email: "carol@example.com" },
  ]);

  const filteredInvitees = invitees.filter(
    (invitee) =>
      invitee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invitee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resendInvite = (email: string) => {
    console.log(`Invite resent to ${email}`);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md">
        <div className="flex items-center gap-10">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Invited Guests</h2>
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
          {filteredInvitees.length > 0 ? (
            filteredInvitees.map((invitee, index) => (
              <TableRow key={index} className="hover:bg-gray-50">
                <TableCell className="p-3">{invitee.name}</TableCell>
                <TableCell className="p-3">{invitee.email}</TableCell>
                <TableCell className="p-3 text-center">
                  <Button
                    onClick={() => resendInvite(invitee.email)}
                    className="text-xs font-medium bg-primary text-white px-3 py-1 rounded-md hover:bg-primary/90"
                  >
                    Resend Invite
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="p-3 text-center text-gray-500 italic">
                No invitees found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvitedList;
