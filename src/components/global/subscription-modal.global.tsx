"use client";

import React from "react";
import Image from "next/image";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

import { useSupabaseUser } from "@/hooks/user-supabase-user";
import { useSubscriptionModal } from "@/hooks/use-subscription-modal";

import { Price, ProductWirhPrice } from "@/types/supabase.types";
import { formatPrice, postStripeData } from "@/lib/utils";
import checkIcon from "../../../public/icons/check.svg";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getStripe } from "@/lib/stripe/stripe-client";

interface SubscriptionModalProps {
  products: ProductWirhPrice[];
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ products }) => {
  const router = useRouter();
  const { isOpen, setIsOpen } = useSubscriptionModal();
  const { subscription } = useSupabaseUser();
  const { user } = useSupabaseUser();
  
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const handleContinue = async (price: Price) => {
    setIsLoading(true);

    try {
      if (!user) {
        router.push("/login");
        return undefined;
      }

      if (subscription) {
        toast.error("You are already on a paid plan!");
        return undefined;
      }

      const { sessionId } = await postStripeData({
        url: `/api/create-checkout-session`,
        data: { price },
      });

      console.log("Getting checkout session for Stripe...");

      const stripe = await getStripe();
      stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      toast.error("Oops! Something went wrong.", {
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            <DialogClose />
          </DialogHeader>

          {products.length
            ? products.map((product) => (
                <div className="flex flex-col gap-3" key={product.id}>
                  <div className="flex justify-between items-center">
                    {product.prices?.map((price) => (
                      <React.Fragment key={price.id}>
                        <b className="text-foreground">
                          {formatPrice(price)} / <small>{price.interval}</small>
                        </b>
                        <Button
                          isLoading={isLoading}
                          onClick={() => handleContinue(price)}
                        >
                          {isLoading ? "Upgrading..." : "Upgrade ✨"}
                        </Button>
                      </React.Fragment>
                    ))}
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
                      <Image src={checkIcon} alt="Check Icon" />1 year day page
                      history
                    </li>
                    <li className="flex items-center gap-2 text-sm font-medium">
                      <Image src={checkIcon} alt="Check Icon" />
                      Invite 10 guests
                    </li>
                  </ul>
                </div>
              ))
            : ""}
        </DialogContent>
      )}
    </Dialog>
  );
};

export default SubscriptionModal;
