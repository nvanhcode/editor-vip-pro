import { useEffect, useMemo, useState } from "react";

import { ActiveTool, Editor } from "@/components/svg-editor/types";
import { ToolSidebarClose } from "@/components/svg-editor/tool-sidebar-close";
import { ToolSidebarHeader } from "@/components/svg-editor/tool-sidebar-header";
import { ColorPicker } from "@/components/svg-editor/color-picker";

import { cn } from "@/components/svg-editor/lib/utils";
import { Label } from "@/components/svg-editor/ui/label";
import { Button } from "@/components/svg-editor/ui/button";
import { ScrollArea } from "@/components/svg-editor/ui/scroll-area";

interface SettingsSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const SettingsSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: SettingsSidebarProps) => {
  const workspace = editor?.getWorkspace();

  const initialWidth = useMemo(() => `${workspace?.width ?? 0}`, [workspace]);
  const initialHeight = useMemo(() => `${workspace?.height ?? 0}`, [workspace]);
  const initialBackground = useMemo(() => (workspace?.fill as string) ?? "#ffffff", [workspace]);

  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [background, setBackground] = useState(initialBackground);

  useEffect(() => {
    setWidth(initialWidth);
    setHeight(initialHeight);
    setBackground(initialBackground);
  }, 
  [
    initialWidth,
    initialHeight,
    initialBackground
  ]);

  const changeWidth = (value: string) => setWidth(value);
  const changeHeight = (value: string) => setHeight(value);
  const changeBackground = (value: string) => {
    setBackground(value);
    editor?.changeBackground(value);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    editor?.changeSize({
      width: parseInt(width, 10),
      height: parseInt(height, 10),
    });
  }

  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r border-slate-100/80 z-[40] w-[360px] h-full flex flex-col shadow-[10px_0_30px_-15px_rgba(0,0,0,0.03)] transition-all duration-200",
        activeTool === "settings" ? "visible block" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Settings"
        description="Change the look of your workspace"
      />
      <ScrollArea className="flex-1">
        <form className="space-y-4 p-4 border-b" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label className="text-sm">
              Height
            </Label>
            <input
              placeholder="Height"
              value={height}
              type="number"
              onChange={(e) => changeHeight(e.target.value)}
              className="w-full h-9 px-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">
              Width
            </Label>
            <input
              placeholder="Width"
              value={width}
              type="number"
              onChange={(e) => changeWidth(e.target.value)}
              className="w-full h-9 px-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
          </div>
          <Button type="submit" className="w-full h-9">
            Resize
          </Button>
        </form>
        <div className="p-4">
          <Label className="text-sm block mb-3">
            Canvas Background
          </Label>
          <ColorPicker
            value={background}
            onChange={changeBackground}
          />
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
