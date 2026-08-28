// Gregorian → Jalali (Shamsi) conversion.
// Standard algorithm (Roozbeh Pournader / Mohammad Toossi). Inline, dependency-free.

const G_D_M = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

/** Convert Gregorian (gy, gm 1..12, gd 1..31) to Jalali [jy, jm 1..12, jd 1..31]. */
export function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    G_D_M[gm - 1];

  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;

  jy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }

  return [jy, jm, jd];
}

/** Convenience: takes Gregorian YYYYMMDD as an integer and returns Jalali. */
export function dEvenToJalali(dEven: number): [number, number, number] | null {
  if (!Number.isFinite(dEven)) return null;
  const gy = Math.floor(dEven / 10000);
  const gm = Math.floor((dEven / 100) % 100);
  const gd = dEven % 100;
  if (gy < 1 || gm < 1 || gm > 12 || gd < 1 || gd > 31) return null;
  return gregorianToJalali(gy, gm, gd);
}
