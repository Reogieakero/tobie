import { getRemainingMs, getStartsInMs } from './useCountdown';

export function isActuallyScheduled(item: any): boolean {
  return item?.status === 'scheduled' && getStartsInMs(item.start_time) > 0;
}

export function isActuallyLive(item: any): boolean {
  if (item?.status === 'active') return true;
  return item?.status === 'scheduled' && getStartsInMs(item.start_time) <= 0;
}

export function isLive(item: any): boolean {
  return (
    item?.selling_type === 'auction' &&
    item?.end_time &&
    getRemainingMs(item.end_time) > 0 &&
    isActuallyLive(item)
  );
}

export function isEnded(item: any): boolean {
  return (
    item?.selling_type === 'auction' &&
    item?.end_time &&
    getRemainingMs(item.end_time) <= 0 &&
    isActuallyLive(item)
  );
}

export function hasNoTimer(item: any): boolean {
  return (
    item?.selling_type === 'auction' &&
    !item?.end_time &&
    isActuallyLive(item)
  );
}