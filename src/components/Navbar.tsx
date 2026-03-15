"use client";

import { SearchOutlined } from "@ant-design/icons";
import { Input } from "antd";
import { useSectionsStore } from "@/store/useSectionsStore";
import { SettingsMenu } from "@/components/SettingsMenu";

export function Navbar() {
  const searchQuery = useSectionsStore((s) => s.searchQuery);
  const setSearchQuery = useSectionsStore((s) => s.setSearchQuery);

  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-background/95 px-4 py-3 backdrop-blur dark:border-stone-700">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="min-w-0 max-w-md flex-1">
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sections & updates..."
            prefix={<SearchOutlined className="text-stone-400" />}
            allowClear
            aria-label="Search"
            className="rounded-xl"
          />
        </div>
        <div className="shrink-0">
          <SettingsMenu />
        </div>
      </div>
    </header>
  );
}
