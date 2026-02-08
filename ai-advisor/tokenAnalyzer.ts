/**
 * Token Analyzer - AI Advisor for Token Creation
 * 
 * This module runs ENTIRELY on the client side.
 * NO private keys, NO fund access, NO backend execution.
 * 
 * It only ANALYZES and SUGGESTS - the user decides and signs.
 */

export interface TokenParams {
    name: string;
    symbol: string;
    decimals: number;
    initialSupply: string;
}

export interface TokenSuggestion {
    field: 'name' | 'symbol' | 'decimals' | 'initialSupply';
    type: 'warning' | 'suggestion' | 'info' | 'error';
    message: string;
}

export interface TokenAnalysis {
    isValid: boolean;
    suggestions: TokenSuggestion[];
    score: number; // 0-100, higher is better
    summary: string;
}

/**
 * Analyze token parameters and provide AI-like suggestions
 */
export function analyzeTokenParams(params: TokenParams): TokenAnalysis {
    const suggestions: TokenSuggestion[] = [];
    let score = 100;

    // ============ NAME ANALYSIS ============
    if (!params.name || params.name.trim().length === 0) {
        suggestions.push({
            field: 'name',
            type: 'error',
            message: 'Token name is required'
        });
        score -= 30;
    } else {
        if (params.name.length < 3) {
            suggestions.push({
                field: 'name',
                type: 'warning',
                message: 'Token name is very short. Consider a more descriptive name.'
            });
            score -= 10;
        }
        if (params.name.length > 32) {
            suggestions.push({
                field: 'name',
                type: 'warning',
                message: 'Token name is long. Some wallets may truncate it.'
            });
            score -= 5;
        }
        // Check for suspicious patterns
        const suspiciousPatterns = ['scam', 'rug', 'moon', 'elon', '100x', '1000x'];
        const lowerName = params.name.toLowerCase();
        for (const pattern of suspiciousPatterns) {
            if (lowerName.includes(pattern)) {
                suggestions.push({
                    field: 'name',
                    type: 'warning',
                    message: `Name contains "${pattern}" which may trigger spam filters on some platforms.`
                });
                score -= 15;
                break;
            }
        }
    }

    // ============ SYMBOL ANALYSIS ============
    if (!params.symbol || params.symbol.trim().length === 0) {
        suggestions.push({
            field: 'symbol',
            type: 'error',
            message: 'Token symbol is required'
        });
        score -= 30;
    } else {
        if (params.symbol.length < 2) {
            suggestions.push({
                field: 'symbol',
                type: 'warning',
                message: 'Symbol is very short. Most tokens use 3-5 characters.'
            });
            score -= 5;
        }
        if (params.symbol.length > 11) {
            suggestions.push({
                field: 'symbol',
                type: 'error',
                message: 'Symbol is too long (max 11 characters).'
            });
            score -= 20;
        }
        if (!/^[A-Z0-9]+$/.test(params.symbol)) {
            suggestions.push({
                field: 'symbol',
                type: 'suggestion',
                message: 'Symbols are typically uppercase letters and numbers only (e.g., BNB, USDT).'
            });
            score -= 5;
        }
        // Check for reserved/common symbols
        const reservedSymbols = ['BTC', 'ETH', 'BNB', 'USDT', 'USDC', 'BUSD', 'DAI'];
        if (reservedSymbols.includes(params.symbol.toUpperCase())) {
            suggestions.push({
                field: 'symbol',
                type: 'warning',
                message: `"${params.symbol}" is a well-known token symbol. Consider a unique symbol.`
            });
            score -= 10;
        }
    }

    // ============ DECIMALS ANALYSIS ============
    if (params.decimals < 0 || params.decimals > 18) {
        suggestions.push({
            field: 'decimals',
            type: 'error',
            message: 'Decimals must be between 0 and 18.'
        });
        score -= 20;
    } else if (params.decimals !== 18) {
        suggestions.push({
            field: 'decimals',
            type: 'info',
            message: `Most tokens use 18 decimals for maximum compatibility. You selected ${params.decimals}.`
        });
    }

    // ============ SUPPLY ANALYSIS ============
    const supply = parseFloat(params.initialSupply);
    if (isNaN(supply) || supply <= 0) {
        suggestions.push({
            field: 'initialSupply',
            type: 'error',
            message: 'Initial supply must be a positive number.'
        });
        score -= 30;
    } else {
        if (supply < 1000) {
            suggestions.push({
                field: 'initialSupply',
                type: 'info',
                message: 'Low supply token. This is fine for NFT-style or rare tokens.'
            });
        }
        if (supply > 1e15) {
            suggestions.push({
                field: 'initialSupply',
                type: 'warning',
                message: 'Very high supply (>1 quadrillion). Consider if this is intentional.'
            });
            score -= 5;
        }
        // Common supplies
        const commonSupplies = [1e6, 1e9, 1e12, 21e6, 100e6];
        const isCommon = commonSupplies.some(s => Math.abs(supply - s) < s * 0.01);
        if (isCommon) {
            suggestions.push({
                field: 'initialSupply',
                type: 'info',
                message: '✓ This is a commonly used supply amount.'
            });
        }
    }

    // ============ GENERATE SUMMARY ============
    score = Math.max(0, Math.min(100, score));

    let summary: string;
    if (score >= 90) {
        summary = '✅ Excellent! Your token parameters look great.';
    } else if (score >= 70) {
        summary = '👍 Good configuration with minor suggestions.';
    } else if (score >= 50) {
        summary = '⚠️ Some issues detected. Review the suggestions.';
    } else {
        summary = '❌ Critical issues found. Please fix the errors.';
    }

    const hasErrors = suggestions.some(s => s.type === 'error');

    return {
        isValid: !hasErrors,
        suggestions,
        score,
        summary
    };
}

/**
 * Generate a suggested symbol from a token name
 */
export function suggestSymbol(name: string): string {
    if (!name) return '';

    // Remove common words
    const words = name
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => !['the', 'a', 'an', 'token', 'coin'].includes(w.toLowerCase()));

    if (words.length === 0) return '';

    if (words.length === 1) {
        // Single word: take first 3-4 letters
        return words[0].substring(0, 4).toUpperCase();
    }

    // Multiple words: take first letter of each (max 5)
    return words
        .slice(0, 5)
        .map(w => w[0])
        .join('')
        .toUpperCase();
}

/**
 * Format supply for display
 */
export function formatSupply(supply: string | number): string {
    const num = typeof supply === 'string' ? parseFloat(supply) : supply;
    if (isNaN(num)) return '0';

    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toLocaleString();
}
