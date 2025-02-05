"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";

interface ManagerRequest {
    name: string;
    request: string;
  }

export function ManagerRequests(){
    const [searchTerm, setSearchTerm] = useState<string>("");

    const [requests, setRequests] = useState<ManagerRequest[]>([
      { name: "David Brown", request: "Request additional access to event data" },
      { name: "Eve Taylor", request: "Request approval for budget increase" },
    ]);
  
    const filteredRequests = requests.filter((req) =>
      req.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    const handleApprove = (name: string) => {
      console.log(`Approved request from ${name}`);
      setRequests((prev) => prev.filter((req) => req.name !== name));
    };
  
    const handleReject = (name: string) => {
      console.log(`Rejected request from ${name}`);
      setRequests((prev) => prev.filter((req) => req.name !== name));
    };

    return (<> 
    <h2 className="mb-4 text-lg font-semibold text-gray-800">Manager Requests</h2>
          <Input
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mb-4 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
          />
          <Table className="w-full text-sm border border-gray-200 bg-white">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="p-3">Name</TableHead>
                <TableHead className="p-3">Request</TableHead>
                <TableHead className="p-3 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell className="p-3">{req.name}</TableCell>
                    <TableCell className="p-3">{req.request}</TableCell>
                    <TableCell className="p-3 text-center space-x-2">
                      <Button
                        onClick={() => handleApprove(req.name)}
                        className="text-xs bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(req.name)}
                        className="text-xs bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="p-3 text-center text-gray-500">
                    No requests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
    </>
)
}