"use client";

import { SearchOutlined } from "@ant-design/icons";
import { Input } from "antd";

import { SettingsMenu } from "@/components/SettingsMenu";
import { useSectionsStore } from "@/store/useSectionsStore";

export function Navbar() {
  const searchQuery = useSectionsStore((s) => s.searchQuery);
  const setSearchQuery = useSectionsStore((s) => s.setSearchQuery);

  return (
    <header className="sticky top-0 z-10 border-b border-border-subtle bg-surface/90 px-page py-inline backdrop-blur-md sm:py-3">
      <div className="mx-auto flex max-w-6xl items-center gap-tight sm:gap-inline">
        <div className="min-w-0 flex-1 md:max-w-md">
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search habits & logs…"
            prefix={<SearchOutlined className="text-muted-fg" />}
            allowClear
            aria-label="Search"
            className="rounded-xl"
            size="large"
          />
        </div>
        <div className="shrink-0">
          <SettingsMenu />
        </div>
      </div>
    </header>
  );
}
