export type DoctorPortraitGender = "men" | "women";

const PORTRAIT_POOL_SIZE = 100;

function hashKey(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getDoctorPortrait(index: number): string {
  const gender: DoctorPortraitGender = index % 2 === 0 ? "men" : "women";
  const portraitIndex = Math.floor(index / 2) % PORTRAIT_POOL_SIZE;
  return `https://randomuser.me/api/portraits/${gender}/${portraitIndex}.jpg`;
}

export function getDoctorPortraitForKey(key: string): string {
  const hash = hashKey(key);
  const gender: DoctorPortraitGender = hash % 2 === 0 ? "men" : "women";
  const portraitIndex = hash % PORTRAIT_POOL_SIZE;
  return `https://randomuser.me/api/portraits/${gender}/${portraitIndex}.jpg`;
}