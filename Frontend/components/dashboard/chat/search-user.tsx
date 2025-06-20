import { useState } from "react";
import { Input } from "@/components/ui/input";
import { X } from "@mynaui/icons-react";
import { UserInfo } from "./chat-form";

export function SearchUser({ users, selectedUsers, setSelectedUsers }: {users: UserInfo [], selectedUsers: UserInfo [], setSelectedUsers: any}) {
  const [searchTerm, setSearchTerm] = useState("");

  const addUser = (data: UserInfo) => {
    setSelectedUsers([...selectedUsers, data]);
    setSearchTerm("");
  };

  const removeRestrictedUser = (data: UserInfo) => {
    setSelectedUsers(selectedUsers.filter((selData: UserInfo) => selData.user !== data.user));
  };

  const filteredUsers = users.length>0 ? users.filter(
    (data: UserInfo) =>
      data.userName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedUsers.some((selData: UserInfo) => selData.user === data.user)
  ): [];

  return (
    <div className="space-y-2 my-2">
      <Input
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => {setSearchTerm(e.target.value)}}
        className="mb-4"
      />
    <div className= "relative">
        {searchTerm.length > 2 && filteredUsers.length > 0 && (
        <div className="relative top-0">
            <ul className="max-h-32 overflow-y-auto bg-white border rounded p-2 mb-3 w-full shadow-lg">
            {filteredUsers.map((data: UserInfo) => (
                <li 
                key={data.user} 
                className="cursor-pointer p-1 hover:bg-gray-200" 
                onClick={() => { addUser(data)}}>
                {data.userName}
                </li>
            ))}
            </ul>
        </div>
        )}
        <div className="flex flex-wrap gap-2 relative top-0">
            {selectedUsers.length > 0 ? (
            selectedUsers.map((data: UserInfo) => (
                <button 
                key={data.user} 
                className="flex gap-2 items-center text-sm bg-red-200 px-2 py-1 rounded"
                onClick={() => removeRestrictedUser(data)}
                >
                <X /> {data.userName}
                </button>
            ))
            ) : (
            <p className="text-gray-400 text-sm">No users selected</p>
            )}
        </div>
    </div>
    </div>
  );
}