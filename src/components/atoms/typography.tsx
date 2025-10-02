import React, { HtmlHTMLAttributes } from 'react';

interface TypographyProps
  extends HtmlHTMLAttributes<HTMLHeadElement & HTMLParagraphElement> {
  children: string;
  elementType: 'h1' | 'h2' | 'h3' | 'span' | 'p';
}

export const Typography = ({
  children,
  elementType = 'span',
  ...rest
}: TypographyProps) => {
  const Tag = elementType;

  return <Tag {...rest}>{children} </Tag>;
};
