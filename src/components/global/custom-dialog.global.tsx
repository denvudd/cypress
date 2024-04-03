import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { cn } from "@/lib/utils";

interface CustomDialogProps {
  header?: React.ReactNode;
  content?: React.ReactNode;
  trigger?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}

const CustomDialog: React.FC<CustomDialogProps> = ({
  trigger,
  className,
  content,
  description,
  header,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild className={cn("", className)}>{trigger}</DialogTrigger>
      <DialogContent className="overflow-auto w-full">
        <DialogHeader>
          <DialogTitle>{header}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="pt-4">{content}</div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomDialog;
