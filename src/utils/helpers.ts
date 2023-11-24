import { randomBytes } from 'crypto';

export const caseInSensitiveRegex = (val: string): RegExp => {
  return new RegExp(`^${val}$`, 'i');
};

export const isEmpty = (...args: string[]): boolean => {
  let push: boolean = false;
  args.every((e: string) => {
    if (!e || e.trim() === '') push = true;
    return false;
  });
  return push;
};

export const generateRandomHexadecimalToken = (): string => {
  return randomBytes(16).toString('hex');
};
