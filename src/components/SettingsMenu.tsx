"use client";

import { DownOutlined, LogoutOutlined, UpOutlined } from "@ant-design/icons";
import { ConfigProvider, Popover, Segmented } from "antd";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { popoverDarkTheme } from "@/constants/antdTheme";
import { SORT_OPTIONS } from "@/constants/sortOptions";
import { CALENDAR_RANGES, FREQ_RANGES, LAYOUT_MODES, VIEW_MODES } from "@/constants/viewOptions";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import type { ViewMode } from "@/store/useSectionsStore";
import { selectIsGridCollapsed, useSectionsStore } from "@/store/useSectionsStore";

function SlidersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
}

function SettingsMenuSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-b border-zinc-700 last:border-0", className)}>
      <h3 className="mb-inline px-inline pt-inline text-caption font-semibold uppercase tracking-wider text-zinc-400">
        {title}
      </h3>
      <div className="pb-inline">{children}</div>
    </div>
  );
}

function OptionButton<T extends string>({
  value,
  current,
  label,
  onSelect,
  className,
}: {
  value: T;
  current: T;
  label: string;
  onSelect: (v: T) => void;
  className?: string;
}) {
  const isActive = value === current;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        "min-h-touch min-w-touch touch-manipulation rounded-lg px-3 py-2.5 text-left text-body-sm font-medium transition-colors",
        isActive
          ? "bg-zinc-700 text-zinc-50"
          : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100",
        className
      )}
    >
      {label}
    </button>
  );
}

function OptionRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-inline px-inline">{children}</div>;
}

export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { signOut } = useAuth();

  const viewMode = useSectionsStore((s) => s.viewMode);
  const setViewMode = useSectionsStore((s) => s.setViewMode);
  const sortBy = useSectionsStore((s) => s.sortBy);
  const sortDir = useSectionsStore((s) => s.sortDir);
  const setSort = useSectionsStore((s) => s.setSort);
  const layoutMode = useSectionsStore((s) => s.layoutMode);
  const setLayoutMode = useSectionsStore((s) => s.setLayoutMode);
  const calendarRange = useSectionsStore((s) => s.calendarRange);
  const setCalendarRange = useSectionsStore((s) => s.setCalendarRange);
  const freqRange = useSectionsStore((s) => s.freqRange);
  const setFreqRange = useSectionsStore((s) => s.setFreqRange);
  const isGridCollapsed = useSectionsStore(selectIsGridCollapsed);
  const collapseAll = useSectionsStore((s) => s.collapseAll);
  const expandAll = useSectionsStore((s) => s.expandAll);

  const handleCollapseAll = useCallback(() => {
    if (isGridCollapsed) expandAll();
    else collapseAll();
  }, [isGridCollapsed, expandAll, collapseAll]);

  const popoverContent = (
    <ConfigProvider theme={popoverDarkTheme}>
      <div className="w-[min(320px,calc(100vw-2rem))] max-h-[min(70vh,420px)] overflow-y-auto p-px text-zinc-100">
        <SettingsMenuSection title="Sort by">
          <div className="space-y-px px-inline">
            {SORT_OPTIONS.map((opt) => (
              <div key={opt.value} className="flex items-center gap-inline">
                <OptionButton
                  value={opt.value}
                  current={sortBy}
                  label={opt.label}
                  onSelect={(v) => setSort(v, opt.hasDirection ? sortDir : "asc")}
                  className="min-h-touch flex-1"
                />
                {opt.hasDirection && sortBy === opt.value && (
                  <button
                    type="button"
                    onClick={() => setSort(sortBy, sortDir === "asc" ? "desc" : "asc")}
                    className="flex min-h-touch min-w-touch touch-manipulation items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                    title={
                      sortDir === "desc"
                        ? "Descending (click for ascending)"
                        : "Ascending (click for descending)"
                    }
                    aria-label={sortDir === "desc" ? "Switch to ascending" : "Switch to descending"}
                  >
                    {sortDir === "desc" ? (
                      <DownOutlined className="text-body-sm" />
                    ) : (
                      <UpOutlined className="text-body-sm" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </SettingsMenuSection>

        <SettingsMenuSection title="View">
          <div className="px-inline">
            <Segmented
              value={viewMode}
              onChange={(v) => setViewMode(v as ViewMode)}
              options={VIEW_MODES}
              block
              size="large"
            />
          </div>
        </SettingsMenuSection>

        {viewMode === "list" && (
          <SettingsMenuSection title="List layout">
            <OptionRow>
              {LAYOUT_MODES.map((m) => (
                <OptionButton
                  key={m.value}
                  value={m.value}
                  current={layoutMode}
                  label={m.label}
                  onSelect={setLayoutMode}
                />
              ))}
            </OptionRow>
            {layoutMode === "grid" && (
              <div className="mt-inline px-inline">
                <button
                  type="button"
                  onClick={handleCollapseAll}
                  className="min-h-touch w-full touch-manipulation rounded-lg border border-zinc-600 bg-zinc-800/80 px-3 py-2.5 text-body-sm font-medium text-zinc-200 hover:bg-zinc-800"
                >
                  {isGridCollapsed ? "Expand all" : "Collapse all"}
                </button>
              </div>
            )}
          </SettingsMenuSection>
        )}

        {viewMode === "calendar" && (
          <SettingsMenuSection title="Calendar range">
            <OptionRow>
              {CALENDAR_RANGES.map((r) => (
                <OptionButton
                  key={r.value}
                  value={r.value}
                  current={calendarRange}
                  label={r.label}
                  onSelect={setCalendarRange}
                />
              ))}
            </OptionRow>
          </SettingsMenuSection>
        )}

        {viewMode === "freq" && (
          <SettingsMenuSection title="Frequency range">
            <OptionRow>
              {FREQ_RANGES.map((r) => (
                <OptionButton
                  key={r.value}
                  value={r.value}
                  current={freqRange}
                  label={r.label}
                  onSelect={setFreqRange}
                />
              ))}
            </OptionRow>
          </SettingsMenuSection>
        )}

        <SettingsMenuSection title="Account">
          <div className="px-inline">
            <button
              type="button"
              onClick={async () => {
                setOpen(false);
                await signOut();
                router.replace("/login");
              }}
              className="flex min-h-touch w-full touch-manipulation items-center gap-inline rounded-lg text-left text-body-sm font-medium text-zinc-200 hover:bg-zinc-800"
            >
              <LogoutOutlined />
              Log out
            </button>
          </div>
        </SettingsMenuSection>
      </div>
    </ConfigProvider>
  );

  return (
    <Popover
      content={popoverContent}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      arrow={{ pointAtCenter: false }}
      styles={{
        body: {
          background: "#18181b",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "0.75rem",
          padding: 4,
        },
      }}
    >
      <button
        type="button"
        className="flex min-h-touch touch-manipulation items-center gap-inline rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2.5 text-body-sm font-medium text-foreground shadow-sm transition-colors hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="View and sort settings"
      >
        <SlidersIcon className="shrink-0 text-muted-fg" />
        <span className="hidden sm:inline">View &amp; sort</span>
        <DownOutlined
          className={cn("shrink-0 text-muted-fg transition-transform", open && "rotate-180")}
        />
      </button>
    </Popover>
  );
}
