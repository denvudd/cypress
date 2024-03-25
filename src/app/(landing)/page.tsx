import TitleSection from "@/components/modules/landing/title-section.module";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";
import {
  CLIENTS,
  PRICING_CARDS,
  PRICING_PLANS,
  TESTIMONIAL_USERS,
} from "@/lib/config/constants";
import calendarBanner from "../../../public/cal.png";
import diamondIcon from "../../../public/icons/diamond.svg";
import checkIcon from "../../../public/icons/check.svg";
import { randomUUID } from "crypto";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import CustomCard from "@/components/modules/landing/custom-card.module";

interface LandingPageProps {}

const LandingPage: React.FC<LandingPageProps> = ({}) => {
  return (
    <>
      <section>
        <div className="overflow-hidden px-4 sm:px-6 mt-10 sm:flex sm:flex-col md:justify-center md:items-center">
          <TitleSection
            pill={"✨ Your workspace, Perfected"}
            title="All-In-One Collaboration and Productivity Platform"
          />
          <div className="flex justify-center w-full mt-6">
            <Button size="lg">Get Cypress Free</Button>
          </div>
        </div>
      </section>
      <section
        className="overflow-hidden flex after:content[''] after:dark:from-brand-dark after:to-transparent 
      after:from-background after:bg-gradient-to-l after:right-0 after:bottom-0 after:top-0 after:w-20 after:z-10 after:content[''] after:absolute
       before:dark:from-brand-dark before:to-transparent before:from-background before:bg-gradient-to-r before:absolute before:left-0 
       before:bottom-0 before:top-0 before:w-20 before:z-10"
      >
        {Array(2)
          .fill(null)
          .map(() => (
            <div key={randomUUID()} className="flex flex-nowrap animate-slide">
              {CLIENTS.map((client) => (
                <div
                  key={client.alt}
                  className="relative w-[200px] m-20 shrink-0 flex items-center"
                >
                  <Image
                    src={client.logo}
                    alt={client.alt}
                    width={150}
                    className="object-contain max-w-none"
                  />
                </div>
              ))}
            </div>
          ))}
      </section>
      <section className="px-4 sm:px-6 flex justify-center items-center flex-col">
        <div
          aria-hidden
          aria-label="Blur"
          className="w-[30%] blur-[120px] rounded-full h-32 absolute bg-brand-primaryPurple/50 -z-10 top-22"
        />
        <TitleSection
          title="Keep track of your meetings all in one place"
          subTitle="Capture your ideas, thoughts, and meeting notes in a structured and organized manner"
          pill="Features"
        />
        <div className="mt-10 max-w-[450px] flex justify-center items-center relative sm:ml-0 rounded-2xl border-8 border-x-washed-blue-300 border-opacity-10">
          <Image
            src={calendarBanner}
            alt="Calendar Banner"
            quality={100}
            className="rounded-2xl"
          />
        </div>
      </section>
      <section className="relative">
        <div className="w-full blur-[120px] rounded-full h-32 absolute bg-brand-primaryPurple/50 z-10 top-56" />

        <div className="mt-20 px-4 sm:px-6 flex flex-col overflow-x-hidden overflow-visible">
          <TitleSection
            title="Trusted by all"
            subTitle="Join thousands of satisfied users who rely on our platform for their 
            personal and professional productivity needs."
            pill="Testimonials"
          />
          {Array(2)
            .fill(null)
            .map((_, index) => (
              <div
                key={randomUUID()}
                className={cn(
                  "mt-10 flex flex-nowrap gap-6 self-start hover:paused",
                  {
                    "flex-row-reverse animate-[slide_250s_linear_infinite_reverse] -ml-[100vw]":
                      index === 1,
                    "animate-[slide_250s_linear_infinite]": true,
                  }
                )}
              >
                {TESTIMONIAL_USERS.map((user, index) => (
                  <CustomCard
                    key={user.name}
                    className="w-[500px] shrink-0 rounded-xl dark:bg-gradient-to-t dark:from-border dark:to-background"
                    cardHeader={
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={`/avatars/${index + 1}.png`} />
                          <AvatarFallback>AV</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-foreground">
                            {user.name}
                          </CardTitle>
                          <CardDescription className="dark:text-washed-purple-800">
                            {user.name.toLocaleLowerCase()}
                          </CardDescription>
                        </div>
                      </div>
                    }
                    cardContent={
                      <p className="dark:text-washed-purple-800">
                        {user.message}
                      </p>
                    }
                  />
                ))}
              </div>
            ))}
        </div>
      </section>
      <section className="mt-20 pb-20 px-4 sm:px-6">
        <TitleSection
          title="The Perfect Plan For You"
          subTitle="Experience all the benefits of our platform. Select a plan that suits your needs and take your productivity to new heights."
          pill="Pricing"
        />
        <div className="flex flex-col-reverse sm:flex-row gap-4 justify-center sm:items-stretch items-center my-10">
          {PRICING_CARDS.map((card) => (
            <CustomCard
              key={card.planType}
              className={cn(
                "w-[300px] rounded-2xl dark:bg-black/40 background-blur-3xl relative",
                {
                  "border-brand-primaryPurple/70":
                    card.planType === PRICING_PLANS.proplan,
                }
              )}
              cardHeader={
                <CardTitle
                  className="text-2xl
                  font-semibold
              "
                >
                  {card.planType === PRICING_PLANS.proplan && (
                    <>
                      <div
                        className="hidden dark:block w-full blur-[120px] rounded-full h-32
                        absolute
                        bg-brand-primaryPurple/80
                        -z-10
                        top-0
                      "
                      />
                      <Image
                        src={diamondIcon}
                        alt="Pro Plan Icon"
                        className="absolute top-6 right-6"
                      />
                    </>
                  )}
                  {card.planType}
                </CardTitle>
              }
              cardContent={
                <CardContent className="p-0">
                  <span
                    className="font-normal 
                    text-2xl
                "
                  >
                    ${card.price}
                  </span>
                  {+card.price > 0 ? (
                    <span className="dark:text-washed-purple-800 ml-1">
                      /mo
                    </span>
                  ) : (
                    ""
                  )}
                  <p className="dark:text-washed-purple-800">
                    {card.description}
                  </p>
                  <Button className="whitespace-nowrap w-full mt-4">
                    {card.planType === PRICING_PLANS.proplan
                      ? "Go Pro"
                      : "Get Started"}
                  </Button>
                </CardContent>
              }
              cardFooter={
                <ul
                  className="font-normal
                  flex
                  mb-2
                  flex-col
                  gap-4
                "
                >
                  <small>{card.highlightFeature}</small>
                  {card.freatures.map((feature) => (
                    <li
                      key={feature}
                      className="flex
                      items-center
                      gap-2
                    "
                    >
                      <Image src={checkIcon} alt="Check Icon" />
                      {feature}
                    </li>
                  ))}
                </ul>
              }
            />
          ))}
        </div>
      </section>
    </>
  );
};

export default LandingPage;
