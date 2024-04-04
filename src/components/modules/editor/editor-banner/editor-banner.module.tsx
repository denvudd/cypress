import { useAppState } from "@/hooks/use-app-state";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import React from "react";

interface EditorBannerProps {
  bannerUrl: string | undefined | null;
}

const EditorBanner: React.FC<EditorBannerProps> = ({ bannerUrl }) => {
  const supabaseClient = createClientComponentClient();
  const { state: appState } = useAppState();

  const bannerImage = React.useMemo(() => {
    return (
      bannerUrl &&
      supabaseClient.storage.from("file-banners").getPublicUrl(bannerUrl).data
        .publicUrl
    );
  }, [appState, bannerUrl]);

  if (!bannerImage) return undefined;

  return (
    <div className="relative w-full h-[200px]">
      <Image
        src={bannerImage ?? "/BannerImage.png"}
        fill
        className="w-full md:h-48 h-20 object-cover"
        alt="Banner Image"
      />
    </div>
  );
};

export default EditorBanner;
