interface ToolSidebarHeaderProps {
  title: string;
  description?: string;
};

export const ToolSidebarHeader = ({
  title,
  description
}: ToolSidebarHeaderProps) => {
  return (
    <div className="p-4 border-b border-slate-100/80 space-y-0.5 h-[68px] flex flex-col justify-center bg-slate-50/30">
      <p className="text-sm font-semibold text-slate-800">
        {title}
      </p>
      {description && (
        <p className="text-xs text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
};
