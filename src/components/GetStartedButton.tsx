import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export function GetStartedButton() {
  return (
    <a href="https://app.strandlyeu.com/" target="_blank" rel="noopener noreferrer">
      <Button
        className="group relative overflow-hidden bg-[#6B3F1D] text-white hover:bg-[#8a5a3e] mt-6 px-10 md:px-16 min-w-[360px]"
        size="lg"
      >
        <span className="mr-12 transition-opacity duration-500 group-hover:opacity-0 text-lg md:text-xl">
          Get Started
        </span>
        <i className="absolute right-1 top-1 bottom-1 rounded-sm z-10 grid w-1/3 md:w-1/4 place-items-center transition-all duration-500 bg-white/15 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95">
          <ChevronRight size={20} strokeWidth={2} aria-hidden="true" />
        </i>
      </Button>
    </a>
  );
}
