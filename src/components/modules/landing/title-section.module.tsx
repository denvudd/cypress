import React from "react";

interface TitleSectionProps {
  title: string;
  subTitle?: string;
  pill: string;
}

const TitleSection: React.FC<TitleSectionProps> = ({
  pill,
  title,
  subTitle,
}) => {
  return (
    <React.Fragment>
      <div className="flex flex-col gap-4 justify-center items-center md:items-center">
        <article className="rounded-full p-[1px] text-sm dark:bg-gradient-to-r dark:from-brand-primaryBlue dark:to-brand-primaryPurple">
          <span className="bg-slate-800 z-[99999] no-underline group relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6  inline-block">
            <span className="absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
            </span>
            <div className="relative flex space-x-2 items-center z-10 rounded-full bg-background py-0.5 px-4 ring-1 ring-white/10 ">
              <span>{pill}</span>
            </div>
            <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-primary/0 via-primary/90 to-primary/0 transition-opacity duration-500 group-hover:opacity-40"></span>
          </span>
        </article>
        {subTitle ? (
          <>
            <h2 className="text-left text-3xl sm:text-5xl sm:max-w-[700px] md:text-center font-semibold">
              {title}
            </h2>
            <p className="dark:text-washed-purple-700 sm:max-w-[850px] md:text-center">
              {subTitle}
            </p>
          </>
        ) : (
          <h1 className="text-left text-4xl sm:text-6xl sm:max-w-[850px] md:text-center font-semibold">
            {title}
          </h1>
        )}
      </div>
    </React.Fragment>
  );
};

export default TitleSection;
