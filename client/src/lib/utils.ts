import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return `${formatDate(d)} ${formatTime(d)}`;
}

export function getCurrentDateTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function generateTransactionId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `TRX-${year}-${random}`;
}

export const statusColorMap: Record<string, { bg: string; text: string }> = {
  pending_scan: { bg: 'bg-amber-100', text: 'text-amber-800' },
  handover: { bg: 'bg-blue-100', text: 'text-blue-800' },
  scanning: { bg: 'bg-green-100', text: 'text-green-800' },
  scan_completed: { bg: 'bg-teal-100', text: 'text-teal-800' },
  qc_done: { bg: 'bg-green-100', text: 'text-green-800' },
  upload_initiated: { bg: 'bg-purple-100', text: 'text-purple-800' },
  upload_completed: { bg: 'bg-purple-100', text: 'text-purple-800' },
  returned: { bg: 'bg-neutral-100', text: 'text-neutral-800' },
};

export const priorityColorMap: Record<string, { bg: string; text: string }> = {
  normal: { bg: 'bg-neutral-100', text: 'text-neutral-800' },
  high: { bg: 'bg-amber-100', text: 'text-amber-800' },
  urgent: { bg: 'bg-red-100', text: 'text-red-800' },
};

export const statusLabels: Record<string, string> = {
  pending_scan: 'Pending Scan',
  handover: 'Handover',
  scanning: 'Scanning',
  scan_completed: 'Scan Completed',
  qc_done: 'QC Done',
  upload_initiated: 'Upload Initiated',
  upload_completed: 'Upload Completed',
  returned: 'Returned',
};

export const priorityLabels: Record<string, string> = {
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
};

export const caseTypes = [
  { value: 'civil', label: 'Civil' },
  { value: 'criminal', label: 'Criminal' },
  { value: 'writ', label: 'Writ Petition' },
  { value: 'appeal', label: 'Appeal' },
  { value: 'other', label: 'Other' },
];
