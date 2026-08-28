'use client';

import { ZoneLink } from '@/app/components/zone-link';

import { ReactNode } from 'react';
import { FileDown, FilePlus, FileUp, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function DropdownMenu5({ trigger }: { trigger: ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-[150px]" side="bottom" align="end">
        <DropdownMenuItem asChild>
          <ZoneLink href="/account/home/settings-plain">
            <FilePlus />
            <span>Add</span>
          </ZoneLink>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <ZoneLink href="/account/members/import-members">
            <FileDown />
            <span>Import</span>
          </ZoneLink>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FileUp />
            <span>Export</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-[150px]">
            <DropdownMenuItem asChild>
              <ZoneLink href="/account/home/settings-sidebar">
                <span>PDF</span>
              </ZoneLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <ZoneLink href="/account/home/settings-sidebar">
                <span>CSV</span>
              </ZoneLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <ZoneLink href="/account/home/settings-sidebar">
                <span>Excel</span>
              </ZoneLink>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem asChild>
          <ZoneLink href="/account/security/privacy-settings">
            <Settings />
            <span>Settings</span>
          </ZoneLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
