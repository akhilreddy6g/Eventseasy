"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Guest } from "../guests/view-guests";
import { Manager } from "../managers/view-managers";

export default function CommonAttendeeView({attendee, headers, special, footer, spclComp}:{attendee: Guest [] | Manager [], headers: string [], special: string [], footer: string, spclComp: any}){
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
              {attendee?.length > 0 ? (
                attendee?.map((attendee: any, index: any) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    {headers.map((curr)=>(
                        special.includes(curr)? spclComp?.[curr]?.(attendee, curr, curr+index+attendee.curr): <TableCell key={curr+index+attendee.curr} className={`p-3 w-1/${headers.length} text-center`}>{attendee?.[curr]}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={headers.length} className="p-3 text-center text-gray-500 italic">
                    {footer}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </>
      );
}