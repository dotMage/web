import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

function Icon({ size = 18, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconApps(p: IconProps) {
  return (
    <Icon {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Icon>
  );
}

export function IconDevices(p: IconProps) {
  return (
    <Icon {...p}>
      <rect x="2.5" y="4" width="14" height="10" rx="1.5" />
      <path d="M2.5 17.5h14" />
      <rect x="18" y="9" width="3.5" height="10.5" rx="1" />
    </Icon>
  );
}

export function IconAudit(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M5 3h9l5 5v13H5z" />
      <path d="M14 3v5h5" />
      <path d="M8.5 13h7M8.5 16.5h7M8.5 9.5h3" />
    </Icon>
  );
}

export function IconLogout(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </Icon>
  );
}

export function IconLock(p: IconProps) {
  return (
    <Icon {...p}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
      <circle cx="12" cy="15.2" r="1.3" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function IconChevR(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M9 6l6 6-6 6" />
    </Icon>
  );
}

export function IconChevD(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M6 9l6 6 6-6" />
    </Icon>
  );
}

export function IconArrowL(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M19 12H5" />
      <path d="M11 18l-6-6 6-6" />
    </Icon>
  );
}

export function IconClock(p: IconProps) {
  return (
    <Icon {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </Icon>
  );
}

export function IconRollback(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M4 8h8a6 6 0 1 1 0 12H9" />
      <path d="M4 8l3.5-3.5M4 8l3.5 3.5" />
    </Icon>
  );
}

export function IconUpload(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M12 16V5" />
      <path d="M7 10l5-5 5 5" />
      <path d="M5 19h14" />
    </Icon>
  );
}

export function IconDownload(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M12 5v11" />
      <path d="M7 11l5 5 5-5" />
      <path d="M5 20h14" />
    </Icon>
  );
}

export function IconUserCheck(p: IconProps) {
  return (
    <Icon {...p}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 12l2 2 4-4" />
    </Icon>
  );
}

export function IconUsers(p: IconProps) {
  return (
    <Icon {...p}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 4.8a3.5 3.5 0 0 1 0 6.4" />
      <path d="M17.5 15.2a5.5 5.5 0 0 1 3 4.8" />
    </Icon>
  );
}

export function IconBan(p: IconProps) {
  return (
    <Icon {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M6 6l12 12" />
    </Icon>
  );
}

export function IconPlus(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function IconCheck(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M5 12.5l4.5 4.5L19 6" />
    </Icon>
  );
}

export function IconCopy(p: IconProps) {
  return (
    <Icon {...p}>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </Icon>
  );
}

export function IconTerminal(p: IconProps) {
  return (
    <Icon {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 9l3 3-3 3M13 15h4" />
    </Icon>
  );
}

export function IconSearch(p: IconProps) {
  return (
    <Icon {...p}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </Icon>
  );
}

export function IconCpu(p: IconProps) {
  return (
    <Icon {...p}>
      <rect x="6.5" y="6.5" width="11" height="11" rx="1.5" />
      <path d="M9.5 2.5v3M14.5 2.5v3M9.5 18.5v3M14.5 18.5v3M2.5 9.5h3M2.5 14.5h3M18.5 9.5h3M18.5 14.5h3" />
    </Icon>
  );
}

export function Mark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="1.2" y="1.2" width="29.6" height="29.6" fill="#16140d" />
      <rect x="6" y="6" width="20" height="20" fill="#c2f53f" />
      <rect x="12.5" y="12.5" width="7" height="7" fill="#16140d" />
      <path d="M19 13 L26 6" stroke="#16140d" strokeWidth="2.4" />
    </svg>
  );
}
