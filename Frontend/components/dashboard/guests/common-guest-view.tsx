"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Guest } from "./view-guests";

export default function CommonGuestView({guests, headers, special, footer, spclComp}:{guests: Guest [], headers: string [], special: string, footer: string, spclComp: any}){
    return (
        <>
          <Table className="w-full text-sm text-left border border-gray-200 bg-white">
            <TableHeader>
              <TableRow className="bg-gray-100 flex-1">
                {headers.map((curr)=>(
                    <TableHead key={curr} className={`p-3 w-1/${headers.length} text-center`}>{curr}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="flex-1">
              {guests?.length > 0 ? (
                guests?.map((guest: any, index: any) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    {headers.map((curr)=>(
                        curr==special? spclComp(guest, special, curr+index+guest.curr): <TableCell key={curr+index+guest.curr} className={`p-3 w-1/${headers.length} text-center`}>{guest?.[curr]}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="p-3 text-center text-gray-500 italic">
                    {footer}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </>
      );
}