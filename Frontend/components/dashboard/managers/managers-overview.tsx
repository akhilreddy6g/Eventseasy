"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Hand, BookUser } from "@mynaui/icons-react";
import { ManagerList } from "./view-managers";
import { ManagerRequests } from "./manager-requests";
import InviteUser from "../invite/common-invite";


const ManagersOverview: React.FC = () => {
  return (
    <Card>
        <CardHeader>
        <CardTitle>Managers List</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="allmanagers">
          <TabsList className="flex gap-2">
            <TabsTrigger value="allmanagers" className="w-1/3">
              <BookUser className="mr-2 h-4" />
              All Managers ({15})
            </TabsTrigger>
            <TabsTrigger value="requests" className="w-1/3">
              <Hand className="mr-2 h-4" />
              Requests ({5})
            </TabsTrigger>
            <TabsTrigger value="invite" className="w-1/3">
              <Plus className="mr-2 h-4" />
              Send Invitation
            </TabsTrigger>
          </TabsList>
        <TabsContent value="allmanagers" className="mt-4">
            <ManagerList></ManagerList>
        </TabsContent>
        <TabsContent value="requests" className="mt-4">
            <ManagerRequests></ManagerRequests>
        </TabsContent>
        <TabsContent value="invite" className="mt-4">
            <InviteUser accType="manager"></InviteUser>
        </TabsContent>
      </Tabs>
    </CardContent>
    </Card>
  );
};

export default ManagersOverview;
