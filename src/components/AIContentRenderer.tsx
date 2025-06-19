import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

interface AIContentRendererProps {
  content: string;
}

const AIContentRenderer: React.FC<AIContentRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          
          if (!inline) {
            return (
              <SyntaxHighlighter
                style={oneDark}
                language={match ? match[1] : 'text'}
                PreTag="pre"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            );
          }
          
          return (
            <code
              style={{
                background: '#f1f3f4',
                borderRadius: 4,
                padding: '2px 6px',
                color: '#d73a49',
                fontSize: 13,
              }}
              {...props}
            >
              {children}
            </code>
          );
        },
        a({ children, ...props }) {
          return (
            <a
              {...props}
              style={{ color: '#1677ff', textDecoration: 'underline' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          );
        },
        // Override p to handle code blocks
        p({ children, ...props }) {
          // Check if children contain only code blocks
          const childrenArray = React.Children.toArray(children);
          const hasOnlyCodeBlock = childrenArray.length === 1 && 
            React.isValidElement(childrenArray[0]) && 
            childrenArray[0].type === 'code';
          
          if (hasOnlyCodeBlock) {
            return <>{children}</>;
          }
          
          return <p {...props}>{children}</p>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default AIContentRenderer; 