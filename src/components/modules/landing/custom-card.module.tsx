import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React from "react";

interface CustomCardProps extends React.ComponentProps<typeof Card> {
  cardHeader?: React.ReactNode;
  cardContent?: React.ReactNode;
  cardFooter?: React.ReactNode;
}
const CustomCard: React.FC<CustomCardProps> = ({
  cardContent,
  cardFooter,
  cardHeader,
  className,
  ...props
}) => {
  return (
    <Card className={cn("w-[380px]", className)} {...props}>
      <CardHeader>{cardHeader}</CardHeader>
      <CardContent className="grid gap-4">{cardContent}</CardContent>
      <CardFooter>{cardFooter}</CardFooter>
    </Card>
  );
};

export default CustomCard;
