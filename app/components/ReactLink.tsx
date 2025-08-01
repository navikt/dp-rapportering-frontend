import { Button, Link } from "@navikt/ds-react";
import type { PropsWithChildren, Ref } from "react";
import { forwardRef } from "react";
import type { LinkProps } from "react-router";
import { useHref } from "react-router";
import { useLinkClickHandler } from "react-router";

type TReactLinkSize = "small" | "medium" | "xsmall";
type TReactLinkVariant =
  | "secondary"
  | "primary"
  | "primary-neutral"
  | "secondary-neutral"
  | "tertiary"
  | "tertiary-neutral"
  | "danger";

interface IProps extends LinkProps {
  as: "Link" | "Button";
  size?: TReactLinkSize;
  variant?: TReactLinkVariant;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  disabled?: boolean;
  className?: string;
}

export const ReactLink = forwardRef(ReactLinkComponent);

function ReactLinkComponent(
  props: PropsWithChildren<IProps>,
  ref: Ref<HTMLAnchorElement> | undefined,
) {
  const {
    onClick,
    replace = false,
    state,
    target,
    to,
    as,
    children,
    size = "medium",
    variant = "primary",
    iconPosition = "left",
    icon,
    disabled = false,
    className,
  } = props;
  const href = useHref(to);

  const handleClick = useLinkClickHandler(to, {
    replace,
    state,
    target,
  });

  if (as === "Button") {
    return (
      <Button
        href={href}
        size={size}
        variant={variant}
        onClick={(event) => {
          /* Dette er OK å ignorere, den klager på at det er feil type 
          (Anchor i stedet for Button), og siden vi alltid sender med 
          as="a" overstyrer vi dette til å være en anchor-tag. Typene 
          bakover i designsystemet gjenspeiler ikke dette. */
          // @ts-expect-error ts klager over feil event-type
          onClick?.(event);
          if (!event.defaultPrevented && !disabled) {
            // @ts-expect-error ts klager over feil event-type
            handleClick(event);
          }
        }}
        ref={ref}
        icon={icon}
        iconPosition={iconPosition}
        as="a"
        disabled={disabled}
        className={className}
      >
        {children}
      </Button>
    );
  }

  return (
    <Link
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          handleClick(event);
        }
      }}
      ref={ref}
      className={className}
    >
      {icon && iconPosition === "left" && icon}
      {children}
      {icon && iconPosition === "right" && icon}
    </Link>
  );
}
