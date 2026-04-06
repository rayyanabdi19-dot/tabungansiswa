import { Menu, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";

const MobileHeader = ({ onMenuClick }: { onMenuClick: () => void }) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-sidebar/95 backdrop-blur-xl text-sidebar-foreground border-b border-sidebar-border">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shadow-md">
          <PiggyBank className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-sm block leading-tight font-heading">TabunganKu</span>
          <span className="text-[9px] text-sidebar-foreground/50 uppercase tracking-wider">Mickro Data 2R</span>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onMenuClick} className="text-sidebar-foreground hover:bg-sidebar-accent">
        <Menu className="w-5 h-5" />
      </Button>
    </header>
  );
};

export default MobileHeader;
