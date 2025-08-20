import { config } from 'dotenv';
config();

import '@/ai/flows/explain-code-block.ts';
import '@/ai/flows/project-overview.ts';
import '@/ai/flows/file-summary.ts';
import '@/ai/flows/code-suggestions.ts';
import '@/ai/flows/get-repo-file-tree.ts';
