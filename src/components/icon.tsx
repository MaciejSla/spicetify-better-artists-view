import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & { name: Spicetify.Icon };

export function Icon({ name, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: Spicetify.SVGIcons[name] }}
      {...props}
    />
  );
}
