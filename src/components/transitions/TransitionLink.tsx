'use client';
import { usePageTransition } from './TransitionProvider';

interface Props extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export default function TransitionLink({ href, children, onClick, ...rest }: Props) {
  const { navigate } = usePageTransition();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let modifier-key clicks (new tab etc.) behave normally
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    // Only intercept same-origin internal links
    if (href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto') || href.startsWith('tel') || href.startsWith('#')) return;

    e.preventDefault();
    onClick?.(e);
    navigate(href);
  };

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
