export const validateName = (name: string): 'short' | 'long' | 'invalid' | null => {
    const trimmed = name.trim();
    if (trimmed.length < 3) return 'short';
    if (trimmed.length > 30) return 'long';

    const nameRegex = /^[a-zA-Z0-9_ -]+$/;
    if (!nameRegex.test(trimmed)) return 'invalid';

    return null;
}

export const validatePassword = (password: string): 'short' | 'spaces' | null => {
    if (password.length < 8) return 'short';

    const noSpacesRegex = /^\S+$/;
    if (!noSpacesRegex.test(password)) return 'spaces';

    return null;
}