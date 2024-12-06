declare module "*.svg" {
  import React = require("react");
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement>
  >;
  const src: string;
  export default src;
}

declare module 'react-slider' {
  import * as React from 'react';

  interface ReactSliderProps {
    // Core functionality
    min?: number;
    max?: number;
    step?: number;
    value?: number | number[];
    defaultValue?: number | number[];
    
    // Event handlers
    onChange?: (value: number | number[]) => void;
    onBeforeChange?: (value: number | number[]) => void;
    onAfterChange?: (value: number | number[]) => void;
    onSliderClick?: (value: number) => void;
    
    // Appearance and behavior
    orientation?: 'horizontal' | 'vertical';
    className?: string;
    thumbClassName?: string;
    thumbActiveClassName?: string;
    trackClassName?: string;
    disabled?: boolean;
    snapDragDisabled?: boolean;
    pearling?: boolean;
    minDistance?: number;
    withTracks?: boolean;
    
    // Rendering
    renderThumb?: (props: React.HTMLProps<HTMLDivElement>) => JSX.Element;
    renderTrack?: (props: React.HTMLProps<HTMLDivElement>) => JSX.Element;
  }

  class ReactSlider extends React.Component<ReactSliderProps> {}

  export = ReactSlider;
}

declare module "lodash";
