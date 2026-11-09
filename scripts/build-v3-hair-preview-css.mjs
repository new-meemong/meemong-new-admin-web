import fs from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';
const source = path.resolve('src/components/features/contents/v3-hair-consultation-preview/preview.css');
const result = await postcss([tailwind()]).process(await fs.readFile(source, 'utf8'), { from: source });
await fs.mkdir('public/v3-hair-preview', { recursive: true });
await fs.writeFile('public/v3-hair-preview/preview.css', result.css);
