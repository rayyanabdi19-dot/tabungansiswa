import { Menu, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";

const MobileHeader = ({ onMenuClick }: { onMenuClick: () => void }) => {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-sidebar text-sidebar-foreground border-b border-sidebar-border">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <PiggyBank className="w-5 h-5 text-sidebar-primary" />
        </div>
        <span className="font-bold text-sm">TabunganKu</span>
      </div>
      <Button variant="ghost" size="icon" onClick={onMenuClick} className="text-sidebar-foreground">
        <Menu className="w-5 h-5" />
      </Button>
    </header>
  );
};

export default MobileHeader;
