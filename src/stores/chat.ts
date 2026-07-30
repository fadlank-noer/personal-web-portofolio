import { atom } from 'nanostores';

export const $hasChats = atom(false);

export function setHasChats(value: boolean) {
  $hasChats.set(value);
}