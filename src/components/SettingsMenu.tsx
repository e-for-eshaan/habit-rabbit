"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { DownOutlined, LogoutOutlined, UpOutlined } from "@ant-design/icons";
import { ConfigProvider, Popover, Segmented } from "antd";
import { popoverDarkTheme } from "@/constants/antdTheme";
import { useSectionsStore, selectIsGridCollapsed } from "@/store/useSectionsStore";
import { useAuth } from "@/contexts/AuthContext";
import { SORT_OPTIONS } from "@/constants/sortOptions";
import { VIEW_MODES, CALENDAR_RANGES, FREQ_RANGES, LAYOUT_MODES } from "@/constants/viewOptions";
import type { ViewMode } from "@/store/useSectionsStore";
import { cn } from "@/lib/utils";

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
    <div
      className={cn(
        "border-b border-stone-200 last:border-0 dark:border-stone-600",
        "in-[.popover-dark-theme]:border-stone-600",
        className
      )}
    >
      <h3
        className={cn(
          "mb-2 px-3 pt-3 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400",
          "in-[.popover-dark-theme]:text-stone-400"
        )}
      >
        {title}
      </h3>
      <div className="pb-3">{children}</div>
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
        "min-h-[44px] min-w-[44px] rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors touch-manipulation",
        isActive
          ? "bg-stone-200 text-stone-900 dark:bg-stone-600 dark:text-stone-100 in-[.popover-dark-theme]:bg-stone-600 in-[.popover-dark-theme]:text-stone-100"
          : "text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-700 in-[.popover-dark-theme]:text-stone-300 in-[.popover-dark-theme]:hover:bg-stone-700",
        className
      )}
    >
      {label}
    </button>
  );
}

function OptionRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2 px-3">{children}</div>;
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
      <div className="popover-dark-theme w-[min(320px,calc(100vw-2rem))] max-h-[min(70vh,420px)] overflow-y-auto bg-transparent p-1 text-stone-100">
        <SettingsMenuSection title="Sort by">
          <div className="space-y-1 px-3">
            {SORT_OPTIONS.map((opt) => (
              <div key={opt.value} className="flex items-center gap-2">
                <OptionButton
                  value={opt.value}
                  current={sortBy}
                  label={opt.label}
                  onSelect={(v) => setSort(v, opt.hasDirection ? sortDir : "asc")}
                  className="min-h-[44px] flex-1"
                />
                {opt.hasDirection && sortBy === opt.value && (
                  <button
                    type="button"
                    onClick={() => setSort(sortBy, sortDir === "asc" ? "desc" : "asc")}
                    className="flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-700 dark:hover:text-stone-200 in-[.popover-dark-theme]:text-stone-400 in-[.popover-dark-theme]:hover:bg-stone-700 in-[.popover-dark-theme]:hover:text-stone-200"
                    title={
                      sortDir === "desc"
                        ? "Descending (click for ascending)"
                        : "Ascending (click for descending)"
                    }
                    aria-label={sortDir === "desc" ? "Switch to ascending" : "Switch to descending"}
                  >
                    {sortDir === "desc" ? (
                      <DownOutlined className="text-sm" />
                    ) : (
                      <UpOutlined className="text-sm" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </SettingsMenuSection>

        <SettingsMenuSection title="View">
          <div className="px-3">
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
              <div className="mt-2 px-3">
                <button
                  type="button"
                  onClick={handleCollapseAll}
                  className="min-h-[44px] w-full touch-manipulation rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 in-[.popover-dark-theme]:border-stone-600 in-[.popover-dark-theme]:bg-stone-800 in-[.popover-dark-theme]:text-stone-200 in-[.popover-dark-theme]:hover:bg-stone-700"
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
          <div className="px-3">
            <button
              type="button"
              onClick={async () => {
                setOpen(false);
                await signOut();
                router.replace("/login");
              }}
              className="flex min-h-[44px] w-full touch-manipulation items-center gap-2 rounded-lg text-left text-sm font-medium text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-700 in-[.popover-dark-theme]:text-stone-200 in-[.popover-dark-theme]:hover:bg-stone-700"
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
          background: "rgb(28 25 23)",
          border: "1px solid rgb(87 83 78)",
          borderRadius: "0.5rem",
        },
      }}
    >
      <button
        type="button"
        className="flex min-h-[44px] touch-manipulation items-center gap-2 rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 dark:focus:ring-stone-500"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="View and sort settings"
      >
        <SlidersIcon className="shrink-0 text-stone-500 dark:text-stone-400" />
        <span className="hidden sm:inline">View & sort</span>
        <DownOutlined
          className={cn(
            "shrink-0 text-stone-500 transition-transform dark:text-stone-400",
            open && "rotate-180"
          )}
        />
      </button>
    </Popover>
  );
}
