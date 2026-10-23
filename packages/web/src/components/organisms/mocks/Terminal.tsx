import { FC, ReactNode } from 'react';

interface TerminalLine {
  prefix?: string;
  text: string;
  highlight?: boolean;
}

interface TerminalProps {
  lines?: TerminalLine[];
  children?: ReactNode;
  className?: string;
}

export const Terminal: FC<TerminalProps> = ({ lines, children, className = '' }) => {
  return (
    <div className={`mockup-code w-full ${className}`}>
      {lines
        ? lines.map((line, i) => (
            <pre
              key={i}
              data-prefix={line.prefix ?? ''}
              className={line.highlight ? 'bg-warning text-warning-content' : ''}>
              <code>{line.text}</code>
            </pre>
          ))
        : children}
    </div>
  );
};
Terminal.displayName = 'Terminal';
