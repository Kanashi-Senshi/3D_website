// src/types/custom.d.ts
interface HTMLInputElement extends HTMLElement {
  webkitdirectory: boolean;
  directory: boolean;
}

declare namespace JSX {
  interface IntrinsicElements {
    input: React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement> & {
        webkitdirectory?: string;
        directory?: string;
      },
      HTMLInputElement
    >;
  }
}
