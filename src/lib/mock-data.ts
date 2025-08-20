export type FileNode = {
  id: string;
  name: string;
  type: 'file';
  content: string;
} | {
  id: string;
  name: string;
  type: 'folder';
  children: FileNode[];
};

export const countFiles = (nodes: FileNode[]): number => {
    let count = 0;
    for (const node of nodes) {
        if (node.type === 'file') {
            count++;
        } else {
            count += countFiles(node.children);
        }
    }
    return count;
};

export const mockFileTree: FileNode[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    children: [
      {
        id: '2',
        name: 'app',
        type: 'folder',
        children: [
          {
            id: '3',
            name: 'layout.tsx',
            type: 'file',
            content: `import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StudioFlow',
  description: 'Learn and understand any codebase.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,
          },
          {
            id: '4',
            name: 'page.tsx',
            type: 'file',
            content: `import { StudioFlowApp } from '@/components/studio-flow-app';

export default function Home() {
  return (
    <main>
      <StudioFlowApp />
    </main>
  );
}`,
          },
        ],
      },
      {
        id: '5',
        name: 'components',
        type: 'folder',
        children: [
          {
            id: '6',
            name: 'studio-flow-app.tsx',
            type: 'file',
            content: `// Main application component. You are currently viewing this file.
// It orchestrates the UI and handles state management.`,
          },
          {
            id: '7',
            name: 'ui',
            type: 'folder',
            children: [
              {
                id: '8',
                name: 'button.tsx',
                type: 'file',
                content: `import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }`,
              },
            ],
          },
        ],
      },
      {
        id: '9',
        name: 'lib',
        type: 'folder',
        children: [
          {
            id: '10',
            name: 'utils.ts',
            type: 'file',
            content: `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`,
          },
        ],
      },
    ],
  },
  {
    id: '11',
    name: 'package.json',
    type: 'file',
    content: `{
  "name": "studio-flow",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.3",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "eslint": "^8",
    "eslint-config-next": "14.2.3"
  }
}`,
  },
];

// Mock file tree with lazy loading placeholders for demonstration
export const mockFileTreeWithPlaceholders: FileNode[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    children: [
      {
        id: '2',
        name: 'components',
        type: 'folder',
        children: [
          {
            id: '3',
            name: 'button.tsx',
            type: 'file',
            content: '// Content for src/components/button.tsx will be loaded on demand.',
          },
          {
            id: '4',
            name: 'input.tsx',
            type: 'file',
            content: '// Content for src/components/input.tsx will be loaded on demand.',
          },
          {
            id: '5',
            name: 'card.tsx',
            type: 'file',
            content: `import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn("bg-white shadow-md rounded-lg p-4", className)}>
      {children}
    </div>
  );
};`, // This one has real content already loaded
          },
        ],
      },
      {
        id: '6',
        name: 'lib',
        type: 'folder',
        children: [
          {
            id: '7',
            name: 'utils.ts',
            type: 'file',
            content: '// Content for src/lib/utils.ts will be loaded on demand.',
          },
        ],
      },
    ],
  },
  {
    id: '8',
    name: 'package.json',
    type: 'file',
    content: '// Content for package.json will be loaded on demand.',
  },
];
