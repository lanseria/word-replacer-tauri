import { defineConfig } from 'unocss'

export default defineConfig({
  shortcuts: {
    'input-base': 'w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500',
    'form-group': 'mb-4',
    'form-label': 'block text-gray-700 text-sm font-bold mb-2',
    'form-section': 'bg-gray-50 p-6 rounded-lg mb-6',
    'checkbox-wrapper': 'flex items-center gap-2',
  },
})
