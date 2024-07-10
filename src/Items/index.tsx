import { forwardRef } from "react";
import { Group } from "three";

export type ItemRef = Group
export type ItemProps = JSX.IntrinsicElements['group'] & {
  openable?: boolean
};
export type ItemComponent = ReturnType<typeof forwardRef<Group, ItemProps>>
