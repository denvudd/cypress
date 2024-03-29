"use client";

import React from "react";
import { User } from "@/types/supabase.types";
import { useSupabaseUser } from "@/hooks/user-supabase-user";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Check, Search } from "lucide-react";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { searchUser } from "@/queries/auth";
import { Skeleton } from "../ui/skeleton";

interface CollaboratorSearchProps {
  existingCollaborators: User[];
  getCollaborator: (collaborator: User) => void;
  children: React.ReactNode;
}

const CollaboratorSearch: React.FC<CollaboratorSearchProps> = ({
  children,
  existingCollaborators,
  getCollaborator,
}) => {
  const { user } = useSupabaseUser();

  const [searchResults, setSearchResults] = React.useState<User[]>([]);
  const [isUsersLoading, setIsUsersLoading] = React.useState<boolean>(false);

  const timerRef = React.useRef<ReturnType<typeof setTimeout>>();

  React.useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (timerRef) {
      clearTimeout(timerRef.current);
    }

    setSearchResults([]);
    setIsUsersLoading(true);

    timerRef.current = setTimeout(async () => {
      const response = await searchUser(event.target.value);

      setIsUsersLoading(false);

      setSearchResults(response);
    }, 300);
  };

  const addCollaborator = (user: User) => {
    getCollaborator(user);
  };

  const filteredResults = React.useMemo(() => {
    return searchResults.filter((result) => result.id !== user?.id);
  }, [searchResults, existingCollaborators, user]);

  return (
    <Sheet>
      <SheetTrigger className="w-full">{children}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Search Collaborator</SheetTitle>
          <SheetDescription>
            You can also remove collaborators after adding them from settings
            tab.
          </SheetDescription>
        </SheetHeader>
        <div className="flex justify-center relative items-center gap-2 mt-2">
          <Search className="size-4 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
          <Input
            name="name"
            className="pl-8"
            placeholder="Email"
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-2 mt-2 max-w-full h-full w-full overflow-y-auto">
          {!!filteredResults.length &&
            filteredResults.map((user) => {
              const isCollaboratorAdded = existingCollaborators.some(
                (collaborator) => collaborator.id === user.id
              );

              return (
                <div
                  className="p-4 border animate-in fade-in-30 bg-card/30 blured rounded-md flex-shrink-0 overflow-y-hidden flex justify-between items-center"
                  key={user.id}
                >
                  <div className="flex gap-2 items-center">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/avatar/7.png" />
                      <AvatarFallback>CP</AvatarFallback>
                    </Avatar>
                    <div className="text-sm gap-2 overflow-hidden overflow-ellipsis w-[180px] text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => addCollaborator(user)}
                    disabled={isCollaboratorAdded}
                    size={isCollaboratorAdded ? "icon" : "default"}
                  >
                    {isCollaboratorAdded ? <Check className="size-4" /> : "Add"}
                  </Button>
                </div>
              );
            })}
          {!filteredResults.length && !isUsersLoading && (
            <div className="w-full animate-in fade-in-5 text-sm text-muted-foreground mt-4 text-center">
              No results found.
            </div>
          )}
          {isUsersLoading &&
            Array(7)
              .fill(null)
              .map((_, index) => (
                <div key={index} className="w-full animate-in fade-in-5">
                  <Skeleton className="w-full h-[70px]" />
                </div>
              ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CollaboratorSearch;
