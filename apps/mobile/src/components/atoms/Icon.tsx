import Svg, { Path } from 'react-native-svg';

export interface IconProps {
  /** SVG path `d` attribute — same stroke-icon convention as web's inline `I(d)` helper. */
  path: string;
  /** Square pixel size. Matches the icon's own 24×24 viewBox unit, not the spacing scale
   * (icon glyphs are sized independently of layout spacing, same precedent as web's `h-5 w-5`). */
  size?: number;
  color: string;
  strokeWidth?: number;
}

/** Generic stroke-icon atom — renders a single `Path` inside a 24×24 viewBox. Used by the
 * tab bar (`(tabs)/_layout.tsx`) and anywhere else a line icon is needed. */
export function Icon({ path, size = 24, color, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <Path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
