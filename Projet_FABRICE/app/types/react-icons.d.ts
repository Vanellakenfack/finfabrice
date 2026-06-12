import { ComponentType, SVGAttributes } from 'react';

type IconType = ComponentType<SVGAttributes<SVGElement> & {
  size?: string | number;
  color?: string;
  title?: string;
}>;

declare module 'react-icons/fa' {
  const content: { [key: string]: IconType };
  export = content;
}

declare module 'react-icons/fi' {
  const content: { [key: string]: IconType };
  export = content;
}

declare module 'react-icons/md' {
  const content: { [key: string]: IconType };
  export = content;
}

declare module 'react-icons/bi' {
  const content: { [key: string]: IconType };
  export = content;
}

declare module 'react-icons/hi' {
  const content: { [key: string]: IconType };
  export = content;
}

declare module 'react-icons/io' {
  const content: { [key: string]: IconType };
  export = content;
}

declare module 'react-icons/si' {
  const content: { [key: string]: IconType };
  export = content;
}
