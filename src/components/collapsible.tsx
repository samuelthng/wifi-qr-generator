'use client';

import { useState, useRef, useEffect, useId } from 'react';

interface CollapsibleProps {
	title: string;
	defaultOpen?: boolean;
	children: React.ReactNode;
}

export function Collapsible({ title, defaultOpen = true, children }: CollapsibleProps) {
	const [open, setOpen] = useState(defaultOpen);
	const contentRef = useRef<HTMLDivElement>(null);
	const id = useId();
	const contentId = `${id}-content`;

	// Animate height on toggle
	useEffect(() => {
		const el = contentRef.current;
		if (!el) return;

		if (open) {
			el.style.maxHeight = el.scrollHeight + 'px';
			const handler = () => {
				el.style.maxHeight = 'none';
			};
			el.addEventListener('transitionend', handler, { once: true });
			return () => el.removeEventListener('transitionend', handler);
		} else {
			// Set explicit height first so transition works
			el.style.maxHeight = el.scrollHeight + 'px';
			// Force reflow
			el.offsetHeight;
			el.style.maxHeight = '0px';
		}
	}, [open]);

	return (
		<div className="rounded-lg border border-zinc-200 dark:border-zinc-700">
			<button
				type="button"
				onClick={() => setOpen(!open)}
				aria-expanded={open}
				aria-controls={contentId}
				className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
			>
				{title}
				<svg
					className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2}
				>
					<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
				</svg>
			</button>
			<div
				id={contentId}
				ref={contentRef}
				className="overflow-hidden transition-[max-height] duration-200 ease-in-out"
				style={{ maxHeight: defaultOpen ? 'none' : '0px' }}
			>
				<div className="px-4 pb-4">{children}</div>
			</div>
		</div>
	);
}
