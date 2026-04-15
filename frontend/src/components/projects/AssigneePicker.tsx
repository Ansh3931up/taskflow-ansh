import { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

function formatUserLine(u: User) {
  return `${u.name} · ${u.email}`;
}

type Props = {
  id: string;
  labelId?: string;
  users: User[];
  value: string;
  onChange: (userId: string) => void;
  disabled?: boolean;
};

export function AssigneePicker({ id, labelId, users, value, onChange, disabled }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');

  const selectedUser = useMemo(() => users.find((u) => u.id === value), [users, value]);

  const inputValue = open ? draft : selectedUser ? formatUserLine(selectedUser) : '';

  /** While the draft still matches the selected row, show the full list; once the user edits, filter by substring. */
  const filterQuery = useMemo(() => {
    if (!open) return '';
    if (selectedUser && draft === formatUserLine(selectedUser)) return '';
    const q = draft.trim().toLowerCase();
    return q;
  }, [open, draft, selectedUser]);

  const filtered = useMemo(() => {
    if (!filterQuery) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(filterQuery) || u.email.toLowerCase().includes(filterQuery),
    );
  }, [users, filterQuery]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const handleFocus = () => {
    const u = users.find((x) => x.id === value);
    setDraft(u ? formatUserLine(u) : '');
    setOpen(true);
  };

  const pick = (userId: string, line: string) => {
    onChange(userId);
    setDraft(line);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <Label htmlFor={id} id={labelId} className="text-xs font-medium text-muted-foreground">
        Assignee
      </Label>
      <Input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={`${id}-listbox`}
        disabled={disabled}
        autoComplete="off"
        placeholder="Search by name or email…"
        value={inputValue}
        onChange={(e) => {
          setDraft(e.target.value);
          setOpen(true);
        }}
        onFocus={handleFocus}
        className={cn(
          'mt-1.5 h-10',
          open && 'ring-2 ring-ring ring-offset-2 ring-offset-background',
        )}
      />
      {open && !disabled ? (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-[200] mt-1 max-h-48 w-full overflow-auto rounded-md border border-border bg-popover py-1 text-popover-foreground shadow-md"
        >
          <li role="presentation">
            <button
              type="button"
              role="option"
              className="flex w-full px-3 py-2 text-left text-sm hover:bg-muted"
              onMouseDown={(e) => {
                e.preventDefault();
                pick('', '');
              }}
            >
              <span className="text-muted-foreground">Unassigned</span>
            </button>
          </li>
          {filtered.map((u) => (
            <li key={u.id} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={u.id === value}
                className={cn(
                  'flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm hover:bg-muted',
                  u.id === value && 'bg-muted/80',
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(u.id, formatUserLine(u));
                }}
              >
                <span className="font-medium text-foreground">{u.name}</span>
                <span className="text-xs text-muted-foreground">{u.email}</span>
              </button>
            </li>
          ))}
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">No users match this search.</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
