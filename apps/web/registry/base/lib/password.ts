/**
 * Password strength calculation and generation utilities.
 * Based on NIST SP 800-63B-4 (2024) guidelines.
 */

export interface PasswordCriteria {
    minLength?: number;
    maxLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumber?: boolean;
    requireSpecial?: boolean;
}

export interface PasswordStrengthResult {
    /** Score from 0 to 4 (0=none, 1=weak, 2=fair, 3=strong, 4=excellent) */
    score: number;
    /** Text label for the strength */
    label: "none" | "weak" | "fair" | "strong" | "excellent";
    /** Whether all required criteria are met */
    allMet: boolean;
    /** Individual criteria check results */
    checks: {
        minLength: boolean;
        maxLength: boolean;
        hasUppercase: boolean;
        hasLowercase: boolean;
        hasNumber: boolean;
        hasSpecial: boolean;
    };
}

/**
 * Calculates password strength based on criteria.
 */
export function calculatePasswordStrength(
    password: string,
    criteria: PasswordCriteria = {}
): PasswordStrengthResult {
    const {
        minLength = 8,
        maxLength,
        requireUppercase = false,
        requireLowercase = false,
        requireNumber = false,
        requireSpecial = false,
    } = criteria;

    const checks = {
        minLength: password.length >= minLength,
        maxLength: maxLength ? password.length <= maxLength : true,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[^A-Za-z0-9]/.test(password),
    };

    const requiredChecks = [
        { met: checks.minLength, isRequired: true },
        { met: checks.maxLength, isRequired: maxLength !== undefined },
        { met: checks.hasUppercase, isRequired: requireUppercase },
        { met: checks.hasLowercase, isRequired: requireLowercase },
        { met: checks.hasNumber, isRequired: requireNumber },
        { met: checks.hasSpecial, isRequired: requireSpecial },
    ].filter((c) => c.isRequired);

    const metRequiredCount = requiredChecks.filter((c) => c.met).length;
    const allMet = metRequiredCount === requiredChecks.length;

    if (!password) {
        return { score: 0, label: "none", allMet: false, checks };
    }

    const varietyCount = [
        checks.hasUppercase,
        checks.hasLowercase,
        checks.hasNumber,
        checks.hasSpecial,
    ].filter(Boolean).length;

    let score = 0;

    if (password.length < 4) {
        score = 0;
    } else if (password.length < minLength) {
        score = 1;
    } else {
        score = Math.min(varietyCount, 4);
        if (password.length >= 16) score = Math.min(score + 1, 4);
    }

    if (!allMet) {
        score = Math.min(score, 2);
    }

    const labels: Record<number, PasswordStrengthResult["label"]> = {
        0: "none",
        1: "weak",
        2: "fair",
        3: "strong",
        4: "excellent",
    };

    return { score, label: labels[score] || "none", allMet, checks };
}

/**
 * Generates a strong password that meets the specified criteria.
 */
export function generateStrongPassword(
    criteria: PasswordCriteria = {}
): string {
    const {
        minLength = 16,
        requireUppercase = true,
        requireLowercase = true,
        requireNumber = true,
        requireSpecial = true,
    } = criteria;

    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numberChars = "0123456789";
    const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let allChars = "";
    let password = "";

    if (requireUppercase) {
        allChars += uppercaseChars;
        password +=
            uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
    }
    if (requireLowercase) {
        allChars += lowercaseChars;
        password +=
            lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
    }
    if (requireNumber) {
        allChars += numberChars;
        password += numberChars[Math.floor(Math.random() * numberChars.length)];
    }
    if (requireSpecial) {
        allChars += specialChars;
        password += specialChars[Math.floor(Math.random() * specialChars.length)];
    }

    if (!allChars) {
        allChars = lowercaseChars + uppercaseChars + numberChars;
    }

    const targetLength = Math.max(minLength, 12);
    const remainingLength = Math.max(0, targetLength - password.length);

    for (let i = 0; i < remainingLength; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    return password
        .split("")
        .sort(() => 0.5 - Math.random())
        .join("");
}

/** Strength label display text */
export const strengthLabels: Record<PasswordStrengthResult["label"], string> = {
    none: "",
    weak: "Weak",
    fair: "Fair",
    strong: "Strong",
    excellent: "Excellent",
};

/** Get strength bar color class */
export function getStrengthColor(score: number, allMet: boolean): string {
    if (allMet && score >= 3) return "bg-green-500";
    if (score >= 3) return "bg-emerald-500";
    if (score === 2) return "bg-orange-500";
    if (score === 1) return "bg-red-500";
    return "bg-muted";
}

/** Get strength text color class */
export function getStrengthTextColor(score: number, allMet: boolean): string {
    if (allMet && score >= 3) return "text-green-600 dark:text-green-400";
    if (score >= 3) return "text-emerald-600 dark:text-emerald-400";
    if (score === 2) return "text-orange-600 dark:text-orange-400";
    if (score === 1) return "text-red-600 dark:text-red-400";
    return "text-muted-foreground";
}
