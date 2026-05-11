import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    prettier,
    {
        rules: {
            // catch unused variables
            '@typescript-eslint/no-unused-vars': 'off',

            // no explicit any
            '@typescript-eslint/no-explicit-any': 'warn',

            // always use const when variable is not reassigned
            'prefer-const': 'error',

            // no console.log left in code (use warn so it doesn't block)
            'no-console': 'off',
            'no-unused-vars': 'off'
        },
        ignores: ['node_modules', 'dist']
    }
);
