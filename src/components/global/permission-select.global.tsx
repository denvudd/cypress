import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Lock, Users2 } from "lucide-react";
import { PermissionsKey } from "@/types/global.type";

interface PermissionSelectProps {
  setPermission: React.Dispatch<React.SetStateAction<PermissionsKey>>;
  onValueChange?: (value: PermissionsKey) => void;
  defaultValue: string | undefined;
}

const PermissionSelect: React.FC<PermissionSelectProps> = ({
  defaultValue,
  onValueChange,
  setPermission,
}) => {
  return (
    <Select
      onValueChange={(option: PermissionsKey) =>
        onValueChange ? onValueChange(option) : setPermission(option)
      }
      defaultValue={defaultValue}
      value={defaultValue}
    >
      <SelectTrigger className="w-full h-26">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="sm:max-w-[462px] w-full">
        <SelectGroup>
          <SelectItem value="private" className="">
            <div className="flex gap-2 sm:gap-4 justify-center items-center">
              <Lock className="size-4 flex-shrink-0" />
              <article className="text-left min-w-0 flex-col gap-0.5">
                <span className="font-medium">Private</span>
                <p className="hidden sm:block text-xs text-muted-foreground overflow-ellipsis text-wrap">
                  Your workspace is private to you. You can choose to share it
                  later.
                </p>
              </article>
            </div>
          </SelectItem>
          <SelectItem value="shared" className="">
            <div className="flex gap-2 sm:gap-4 justify-center items-center">
              <Users2 className="size-4 flex-shrink-0" />
              <article className="text-left min-w-0 flex-col gap-0.5">
                <span className="font-medium">Public</span>
                <p className="hidden sm:block text-xs text-muted-foreground overflow-ellipsis text-wrap">
                  Your workspace is public to everyone. You can invite
                  collaborators.
                </p>
              </article>
            </div>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default PermissionSelect;
