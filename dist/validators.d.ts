declare const validator: {
    isEmail(str: string): RegExpMatchArray | null;
    isUrl(str: string): false | RegExpMatchArray | null;
    isPath(str: string): false | RegExpMatchArray | null;
    isIP(str: string): 0 | 4 | 6;
    isIPv4(str: string): boolean;
    isIPv6(str: string): boolean;
    isIPNet(str: string): boolean;
    isAlpha(str: string): RegExpMatchArray | null;
    isAlphanumeric(str: string): RegExpMatchArray | null;
    isAlphanumericExt(str: string): RegExpMatchArray | null;
    isUsername(str: string): boolean | null;
    isPassword(str: string): RegExpMatchArray | null;
    isPasswordExt(str: string): RegExpMatchArray | null;
    isNumeric(str: string): RegExpMatchArray | null;
    isNumber(n: any): boolean;
    isHex(str: string): boolean;
    isLowercase(str: string): RegExpMatchArray | null;
    isUppercase(str: string): RegExpMatchArray | null;
    isInt(str: string): boolean;
    isDecimal(str: string): false | RegExpMatchArray | null;
    isDivisibleBy(str: string, n: number): boolean;
    notNull(str: string): boolean;
    isNull(str: string): boolean;
    notEmpty(str: string): boolean;
    equals(a: any, b: any): boolean;
    contains(str: string, elem: string): boolean;
    notContains(str: string, elem: string): boolean;
    regex(str: string, pattern: any, modifiers: string): RegExpMatchArray | null;
    notRegex(str: string, pattern: any, modifiers: string): boolean;
    len(str: string, min: number, max?: number): boolean;
    isUUID(str: string, version: string | number): RegExpMatchArray | null;
    isDate(str: string): boolean;
    isAfter(str: string, date?: Date | string): boolean;
    isBefore(str: string, date: Date | string): boolean;
    min(str: string, val: number): boolean;
    max(str: string, val: number): boolean;
    isArray(str: string): boolean;
    isCreditCard(str: string): string | null;
    sanitize(str: string): string;
    strip: (str: string) => string;
    stripTags: (str: string) => string;
    stripScripts: (str: string) => string;
    stripAll(str: string): string;
};
export default validator;
