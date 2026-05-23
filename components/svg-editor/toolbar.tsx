import { useState } from "react";
import { useFilePicker } from "use-file-picker";

import { 
  FaBold, 
  FaItalic, 
  FaStrikethrough, 
  FaUnderline
} from "react-icons/fa";
import { TbColorFilter } from "react-icons/tb";
import { BsBorderWidth } from "react-icons/bs";
import { RxTransparencyGrid } from "react-icons/rx";
import { 
  ArrowUp, 
  ArrowDown, 
  ChevronDown, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Trash,
  Copy,
  Type,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Download,
  FileJson,
  Shapes
} from "lucide-react";
import { CiFileOn } from "react-icons/ci";

import { isTextType } from "@/components/svg-editor/utils";
import { FontSizeInput } from "@/components/svg-editor/font-size-input";
import { 
  ActiveTool, 
  Editor, 
  FONT_SIZE, 
  FONT_WEIGHT
} from "@/components/svg-editor/types";

import { cn } from "@/components/svg-editor/lib/utils";
import { Hint } from "@/components/svg-editor/hint";
import { Button } from "@/components/svg-editor/ui/button";
import { Separator } from "@/components/svg-editor/ui/separator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/svg-editor/ui/dropdown-menu";

interface ToolbarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  hideExport?: boolean;
};

export const Toolbar = ({
  editor,
  activeTool,
  onChangeActiveTool,
  hideExport = false,
}: ToolbarProps) => {
  const initialFillColor = editor?.getActiveFillColor();
  const initialStrokeColor = editor?.getActiveStrokeColor();
  const initialFontFamily = editor?.getActiveFontFamily();
  const initialFontWeight = editor?.getActiveFontWeight() || FONT_WEIGHT;
  const initialFontStyle = editor?.getActiveFontStyle();
  const initialFontLinethrough = editor?.getActiveFontLinethrough();
  const initialFontUnderline = editor?.getActiveFontUnderline();
  const initialTextAlign = editor?.getActiveTextAlign();
  const initialFontSize = editor?.getActiveFontSize() || FONT_SIZE

  const [properties, setProperties] = useState({
    fillColor: initialFillColor,
    strokeColor: initialStrokeColor,
    fontFamily: initialFontFamily,
    fontWeight: initialFontWeight,
    fontStyle: initialFontStyle,
    fontLinethrough: initialFontLinethrough,
    fontUnderline: initialFontUnderline,
    textAlign: initialTextAlign,
    fontSize: initialFontSize,
  });

  // Image Upload handler
  const { openFilePicker: openImagePicker } = useFilePicker({
    accept: "image/*",
    onFilesSuccessfullySelected: ({ plainFiles }: any) => {
      if (plainFiles && plainFiles.length > 0) {
        const file = plainFiles[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          if (reader.result) {
            editor?.addImage(reader.result as string);
          }
        };
      }
    },
  });

  const selectedObject = editor?.selectedObjects[0];
  const selectedObjectType = editor?.selectedObjects[0]?.type;

  const isText = isTextType(selectedObjectType);
  const isImage = selectedObjectType === "image";

  const onChangeFontSize = (value: number) => {
    if (!selectedObject) {
      return;
    }

    editor?.changeFontSize(value);
    setProperties((current) => ({
      ...current,
      fontSize: value,
    }));
  };

  const onChangeTextAlign = (value: string) => {
    if (!selectedObject) {
      return;
    }

    editor?.changeTextAlign(value);
    setProperties((current) => ({
      ...current,
      textAlign: value,
    }));
  };

  const toggleBold = () => {
    if (!selectedObject) {
      return;
    }

    const newValue = properties.fontWeight > 500 ? 500 : 700;

    editor?.changeFontWeight(newValue);
    setProperties((current) => ({
      ...current,
      fontWeight: newValue,
    }));
  };

  const toggleItalic = () => {
    if (!selectedObject) {
      return;
    }

    const isItalic = properties.fontStyle === "italic";
    const newValue = isItalic ? "normal" : "italic";

    editor?.changeFontStyle(newValue);
    setProperties((current) => ({
      ...current,
      fontStyle: newValue,
    }));
  };

  const toggleLinethrough = () => {
    if (!selectedObject) {
      return;
    }

    const newValue = properties.fontLinethrough ? false : true;

    editor?.changeFontLinethrough(newValue);
    setProperties((current) => ({
      ...current,
      fontLinethrough: newValue,
    }));
  };

  const toggleUnderline = () => {
    if (!selectedObject) {
      return;
    }

    const newValue = properties.fontUnderline ? false : true;

    editor?.changeFontUnderline(newValue);
    setProperties((current) => ({
      ...current,
      fontUnderline: newValue,
    }));
  };

  const hasSelection = editor && editor.selectedObjects.length > 0;

  return (
    <div className="shrink-0 h-[56px] border-b border-slate-100/80 bg-white w-full flex items-center justify-between z-[49] px-4 gap-x-2 select-none shadow-2xs">
      {/* Left side: Context-sensitive formatting properties (shown only when elements are selected) */}
      <div className="flex items-center gap-x-2 overflow-x-auto flex-1 h-full py-1">
        {hasSelection && (
          <>
            {!isImage && (
              <div className="flex items-center h-full justify-center">
                <Hint label="Fill Color" side="bottom" sideOffset={5}>
                  <Button
                    onClick={() => onChangeActiveTool("fill")}
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "h-8 w-8 rounded-lg hover:bg-slate-50 transition-colors",
                      activeTool === "fill" && "bg-slate-100/70"
                    )}
                  >
                    <div
                      className="rounded-[3px] size-3.5 border border-slate-200/80 shadow-3xs"
                      style={{ backgroundColor: properties.fillColor || "rgba(0,0,0,0)" }}
                    />
                  </Button>
                </Hint>
              </div>
            )}
            {!isText && (
              <div className="flex items-center h-full justify-center">
                <Hint label="Stroke color" side="bottom" sideOffset={5}>
                  <Button
                    onClick={() => onChangeActiveTool("stroke-color")}
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "h-8 w-8 rounded-lg hover:bg-slate-50 transition-colors",
                      activeTool === "stroke-color" && "bg-slate-100/70"
                    )}
                  >
                    <div
                      className="rounded-[3px] size-3.5 border border-slate-200/80 bg-white shadow-3xs"
                      style={{ borderColor: properties.strokeColor || "transparent" }}
                    />
                  </Button>
                </Hint>
              </div>
            )}
            {!isText && (
              <div className="flex items-center h-full justify-center">
                <Hint label="Stroke width" side="bottom" sideOffset={5}>
                  <Button
                    onClick={() => onChangeActiveTool("stroke-width")}
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "h-8 w-8 rounded-lg hover:bg-slate-50 transition-colors",
                      activeTool === "stroke-width" && "bg-slate-100/70 text-blue-600"
                    )}
                  >
                    <BsBorderWidth className="size-3.5" />
                  </Button>
                </Hint>
              </div>
            )}
            {isText && (
              <div className="flex items-center h-full justify-center gap-x-2">
                <Hint label="Font family" side="bottom" sideOffset={5}>
                  <Button
                    onClick={() => onChangeActiveTool("font")}
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "w-auto px-2 text-xs h-8 border border-slate-100 rounded-md gap-x-1 hover:bg-slate-50/50 transition font-medium",
                      activeTool === "font" && "bg-slate-100/70 text-blue-600 border-slate-200/50"
                    )}
                  >
                    <div className="max-w-[100px] truncate font-medium text-slate-700">
                      {properties.fontFamily}
                    </div>
                    <ChevronDown className="size-3.5 opacity-60 shrink-0" />
                  </Button>
                </Hint>

                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 border border-slate-100 rounded-md gap-x-1 hover:bg-slate-50/50 transition font-medium px-2 text-xs text-slate-600"
                    >
                      <span>Text Style</span>
                      <ChevronDown className="size-3.5 opacity-60 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-44">
                    <DropdownMenuItem
                      onClick={() => {
                        editor?.changeFontSize(48);
                        editor?.changeFontWeight(700);
                      }}
                      className="cursor-pointer"
                    >
                      <span className="font-bold text-sm text-slate-800">Heading 1</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        editor?.changeFontSize(36);
                        editor?.changeFontWeight(700);
                      }}
                      className="cursor-pointer"
                    >
                      <span className="font-bold text-xs text-slate-800">Heading 2</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        editor?.changeFontSize(28);
                        editor?.changeFontWeight(700);
                      }}
                      className="cursor-pointer"
                    >
                      <span className="font-bold text-[11px] text-slate-800">Heading 3</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        editor?.changeFontSize(24);
                        editor?.changeFontWeight(600);
                      }}
                      className="cursor-pointer"
                    >
                      <span className="font-semibold text-[10px] text-slate-800">Heading 4</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        editor?.changeFontSize(18);
                        editor?.changeFontWeight(600);
                      }}
                      className="cursor-pointer"
                    >
                      <span className="font-semibold text-[9px] text-slate-800">Heading 5</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        editor?.changeFontSize(14);
                        editor?.changeFontWeight(600);
                      }}
                      className="cursor-pointer"
                    >
                      <span className="font-semibold text-[9px] text-slate-800">Heading 6</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        editor?.changeFontSize(16);
                        editor?.changeFontWeight(400);
                      }}
                      className="cursor-pointer"
                    >
                      <span className="font-normal text-xs text-slate-500">Paragraph</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            {isText && (
              <div className="flex items-center h-full justify-center">
                <Hint label="Bold" side="bottom" sideOffset={5}>
                  <Button
                    onClick={toggleBold}
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "h-8 w-8 rounded-lg hover:bg-slate-50 transition-colors",
                      properties.fontWeight > 500 && "bg-slate-100/70 text-blue-600"
                    )}
                  >
                    <FaBold className="size-3.5" />
                  </Button>
                </Hint>
              </div>
            )}
            {isText && (
              <div className="flex items-center h-full justify-center">
                <Hint label="Italic" side="bottom" sideOffset={5}>
                  <Button
                    onClick={toggleItalic}
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "h-8 w-8 rounded-lg hover:bg-slate-50 transition-colors",
                      properties.fontStyle === "italic" && "bg-slate-100/70 text-blue-600"
                    )}
                  >
                    <FaItalic className="size-3.5" />
                  </Button>
                </Hint>
              </div>
            )}
            {isText && (
              <div className="flex items-center h-full justify-center">
                <Hint label="Underline" side="bottom" sideOffset={5}>
                  <Button
                    onClick={toggleUnderline}
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "h-8 w-8 rounded-lg hover:bg-slate-50 transition-colors",
                      properties.fontUnderline && "bg-slate-100/70 text-blue-600"
                    )}
                  >
                    <FaUnderline className="size-3.5" />
                  </Button>
                </Hint>
              </div>
            )}
            {isText && (
              <div className="flex items-center h-full justify-center">
                <Hint label="Strike" side="bottom" sideOffset={5}>
                  <Button
                    onClick={toggleLinethrough}
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "h-8 w-8 rounded-lg hover:bg-slate-50 transition-colors",
                      properties.fontLinethrough && "bg-slate-100/70 text-blue-600"
                    )}
                  >
                    <FaStrikethrough className="size-3.5" />
                  </Button>
                </Hint>
              </div>
            )}
            {isText && (
              <div className="flex items-center h-full justify-center">
                <Hint label="Align left" side="bottom" sideOffset={5}>
                  <Button
                    onClick={() => onChangeTextAlign("left")}
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "h-8 w-8 rounded-lg hover:bg-slate-50 transition-colors",
                      properties.textAlign === "left" && "bg-slate-100/70 text-blue-600"
                    )}
                  >
                    <AlignLeft className="size-4" />
                  </Button>
                </Hint>
              </div>
            )}
            {isText && (
              <div className="flex items-center h-full justify-center">
                <Hint label="Align center" side="bottom" sideOffset={5}>
                  <Button
                    onClick={() => onChangeTextAlign("center")}
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "h-8 w-8 rounded-lg hover:bg-slate-50 transition-colors",
                      properties.textAlign === "center" && "bg-slate-100/70 text-blue-600"
                    )}
                  >
                    <AlignCenter className="size-4" />
                  </Button>
                </Hint>
              </div>
            )}
            {isText && (
              <div className="flex items-center h-full justify-center">
                <Hint label="Align right" side="bottom" sideOffset={5}>
                  <Button
                    onClick={() => onChangeTextAlign("right")}
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "h-8 w-8 rounded-lg hover:bg-slate-50 transition-colors",
                      properties.textAlign === "right" && "bg-slate-100/70 text-blue-600"
                    )}
                  >
                    <AlignRight className="size-4" />
                  </Button>
                </Hint>
              </div>
            )}
            {isText && (
              <div className="flex items-center h-full justify-center">
               <FontSizeInput
                  value={properties.fontSize}
                  onChange={onChangeFontSize}
               />
              </div>
            )}
            {isImage && (
              <div className="flex items-center h-full justify-center">
                <Hint label="Filters" side="bottom" sideOffset={5}>
                  <Button
                    onClick={() => onChangeActiveTool("filter")}
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "h-8 w-8 rounded-lg hover:bg-slate-50 transition-colors",
                      activeTool === "filter" && "bg-slate-100/70 text-blue-600"
                    )}
                  >
                    <TbColorFilter className="size-4" />
                  </Button>
                </Hint>
              </div>
            )}
            
            <Separator orientation="vertical" className="h-5 bg-slate-100/80 mx-1.5" />
 
            <div className="flex items-center h-full justify-center">
              <Hint label="Bring forward" side="bottom" sideOffset={5}>
                <Button
                  onClick={() => editor?.bringForward()}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-lg hover:bg-slate-50 text-slate-600 transition"
                >
                  <ArrowUp className="size-4" />
                </Button>
              </Hint>
            </div>
            <div className="flex items-center h-full justify-center">
              <Hint label="Send backwards" side="bottom" sideOffset={5}>
                <Button
                  onClick={() => editor?.sendBackwards()}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-lg hover:bg-slate-50 text-slate-600 transition"
                >
                  <ArrowDown className="size-4" />
                </Button>
              </Hint>
            </div>
            <div className="flex items-center h-full justify-center">
              <Hint label="Opacity" side="bottom" sideOffset={5}>
                <Button
                  onClick={() => onChangeActiveTool("opacity")}
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "h-8 w-8 rounded-lg hover:bg-slate-50 transition-colors",
                    activeTool === "opacity" && "bg-slate-100/70 text-blue-600"
                  )}
                >
                  <RxTransparencyGrid className="size-4" />
                </Button>
              </Hint>
            </div>
            <div className="flex items-center h-full justify-center">
              <Hint label="Duplicate" side="bottom" sideOffset={5}>
                <Button
                  onClick={() => {
                    editor?.onCopy();
                    editor?.onPaste();
                  }}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-lg hover:bg-slate-50 text-slate-600 transition"
                >
                  <Copy className="size-4" />
                </Button>
              </Hint>
            </div>
            <div className="flex items-center h-full justify-center">
              <Hint label="Delete selection" side="bottom" sideOffset={5}>
                <Button
                  onClick={() => editor?.delete()}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50/50 transition-all duration-150"
                >
                  <Trash className="size-4" />
                </Button>
              </Hint>
            </div>
          </>
        )}
      </div>

      {/* Right side: Global Canvas operations (Add shapes, Add text, Add image, Undo/Redo, Export) */}
      <div className="flex items-center gap-x-1 shrink-0 h-full py-1">
        {/* Add Shapes */}
        <Hint label="Add shapes" side="bottom" sideOffset={5}>
          <Button
            onClick={() => onChangeActiveTool("shapes")}
            size="icon"
            variant="ghost"
            className={cn(
              "h-8 w-8 rounded-lg hover:bg-slate-50 text-slate-600 transition",
              activeTool === "shapes" && "bg-slate-100/70"
            )}
          >
            <Shapes className="size-4" />
          </Button>
        </Hint>

        {/* Add Textbox */}
        <Hint label="Add textbox" side="bottom" sideOffset={5}>
          <Button
            onClick={() => onChangeActiveTool("text")}
            size="icon"
            variant="ghost"
            className={cn(
              "h-8 w-8 rounded-lg hover:bg-slate-50 text-slate-600 transition",
              activeTool === "text" && "bg-slate-100/70"
            )}
          >
            <Type className="size-4" />
          </Button>
        </Hint>

        {/* Add Image */}
        <Hint label="Add image" side="bottom" sideOffset={5}>
          <Button
            onClick={() => openImagePicker()}
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-lg hover:bg-slate-50 text-slate-600 transition"
          >
            <ImageIcon className="size-4" />
          </Button>
        </Hint>

        <Separator orientation="vertical" className="h-5 bg-slate-100/80 mx-1.5" />

        {/* Undo */}
        <Hint label="Undo" side="bottom" sideOffset={5}>
          <Button
            disabled={!editor?.canUndo()}
            onClick={() => editor?.onUndo()}
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <Undo2 className="size-4" />
          </Button>
        </Hint>

        {/* Redo */}
        <Hint label="Redo" side="bottom" sideOffset={5}>
          <Button
            disabled={!editor?.canRedo()}
            onClick={() => editor?.onRedo()}
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <Redo2 className="size-4" />
          </Button>
        </Hint>

        <Separator orientation="vertical" className="h-5 bg-slate-100/80 mx-1.5" />

        {/* Export Button */}
        {!hideExport && (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button 
                size="sm" 
                variant="default" 
                className="h-8 px-3 gap-x-1.5 font-semibold text-xs rounded-lg shadow-xs bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer select-none"
              >
                Export
                <Download className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="flex items-center gap-x-3 cursor-pointer"
                onClick={() => editor?.saveJson()}
              >
                <FileJson className="size-5 text-slate-500" />
                <div>
                  <p className="font-semibold text-xs text-slate-800">Export JSON</p>
                  <p className="text-[10px] text-slate-400">Save workspace state locally</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-x-3 cursor-pointer"
                onClick={() => editor?.savePng()}
              >
                <CiFileOn className="size-5 text-slate-500" />
                <div>
                  <p className="font-semibold text-xs text-slate-800">Export PNG</p>
                  <p className="text-[10px] text-slate-400">High-resolution sharing</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-x-3 cursor-pointer"
                onClick={() => editor?.saveJpg()}
              >
                <CiFileOn className="size-5 text-slate-500" />
                <div>
                  <p className="font-semibold text-xs text-slate-800">Export JPG</p>
                  <p className="text-[10px] text-slate-400">Perfect for printing</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-x-3 cursor-pointer"
                onClick={() => editor?.saveSvg()}
              >
                <CiFileOn className="size-5 text-slate-500" />
                <div>
                  <p className="font-semibold text-xs text-slate-800">Export SVG</p>
                  <p className="text-[10px] text-slate-400">Vector software ready</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};
