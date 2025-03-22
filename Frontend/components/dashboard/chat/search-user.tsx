import { useState } from "react";
import { Input } from "@/components/ui/input";
import { X } from "@mynaui/icons-react";

export function SearchUser({ users, selectedUsers, setSelectedUsers }: {users: any, selectedUsers: any, setSelectedUsers: any}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [charCount, setCharCount] = useState(0)

  const filteredUsers = users.filter(
    (user: string) =>
      user.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedUsers.includes(user)
  );

  const addUser = (user: string) => {
    setSelectedUsers([...selectedUsers, user]);
    setSearchTerm("");
  };

  const removeRestrictedUser = (user: string) => {
    setSelectedUsers(selectedUsers.filter((u: string) => u !== user));
  };

  return (
    <div className="space-y-2 my-2">
      <Input
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => {setSearchTerm(e.target.value); setCharCount(e.target.value.length)}}
        className="mb-4"
      />
    <div className= "relative">
        {charCount > 3 && filteredUsers.length > 0 && (
        <div className="relative top-0">
            <ul className="max-h-32 overflow-y-auto bg-white border rounded p-2 mb-3 w-full shadow-lg">
            {filteredUsers.map((user: string) => (
                <li 
                key={user} 
                className="cursor-pointer p-1 hover:bg-gray-200" 
                onClick={() => { addUser(user); setCharCount(0); }}>
                {user}
                </li>
            ))}
            </ul>
        </div>
        )}
        <div className="flex flex-wrap gap-2 relative top-0">
            {selectedUsers.length > 0 ? (
            selectedUsers.map((user: string) => (
                <button 
                key={user} 
                className="flex gap-2 items-center text-sm bg-red-200 px-2 py-1 rounded"
                onClick={() => removeRestrictedUser(user)}
                >
                <X /> {user}
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