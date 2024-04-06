"use client";

import { useSubscriptionModal } from "@/hooks/use-subscription-modal";
import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useSupabaseUser } from "@/hooks/user-supabase-user";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import Image from "next/image";

import checkIcon from "../../../public/icons/check.svg";

interface SubscriptionModalProps {}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({}) => {
  const { isOpen, setIsOpen } = useSubscriptionModal();
  const { subscription } = useSupabaseUser();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {subscription?.status === "active" ? (
        <DialogContent>Already on a paid plan!</DialogContent>
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to Pro</DialogTitle>
            <DialogDescription>
              To access Pro features you need to have a paid plan.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <React.Fragment>
                <b className="text-foreground">
                  $12.99 / <small>month</small>
                </b>
                <Button isLoading={isLoading}>
                  {isLoading ? "Upgrading..." : "Upgrade ✨"}
                </Button>
              </React.Fragment>
            </div>
            <Separator />
            <ul className="flex flex-col gap-4">
              <small className="font-medium">Everything in Free +</small>
              <li className="flex items-center gap-2 text-sm font-medium">
                <Image src={checkIcon} alt="Check Icon" />
                Unlimited blocks for teams
              </li>
              <li className="flex items-center gap-2 text-sm font-medium">
                <Image src={checkIcon} alt="Check Icon" />
                Unlimited file uploads
              </li>
              <li className="flex items-center gap-2 text-sm font-medium">
                <Image src={checkIcon} alt="Check Icon" />1 year day
                page history
              </li>
              <li className="flex items-center gap-2 text-sm font-medium">
                <Image src={checkIcon} alt="Check Icon" />
                Invite 10 guests
              </li>
            </ul>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default SubscriptionModal;
