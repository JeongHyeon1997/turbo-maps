import { useState } from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';
import { theme } from '@maps/tokens';
import { useTheme } from '@/lib/theme';

export type TextFieldProps = TextInputProps;

// Border stays a constant width in both states — only the color toggles on
// focus. DESIGN.md describes 1px (rest) -> 2px (focus), but RN border-width
// is a layout property (no box-shadow "ring" like the web's `ring-2`), so
// changing it live shifts the box by 1px each way. Fixing it at the focus
// width avoids the shift; the color swap alone still reads clearly as focus.
const BORDER_WIDTH = 2;

/**
 * Input atom — bare `TextInput` + theme. Label/error/hint live in the
 * `FormField` molecule (not here); this atom only owns the input box itself
 * per DESIGN.md "TextField — atom 신설" (height 52-56 / radius 12 / neutral
 * border, brand focus ring — see `BORDER_WIDTH` note on why the width itself
 * doesn't change between the two states here).
 */
export function TextField({ style, onFocus, onBlur, ...rest }: TextFieldProps) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TextInput
      placeholderTextColor={colors.input.placeholder}
      onFocus={(e) => {
        setIsFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        onBlur?.(e);
      }}
      style={[
        styles.base,
        {
          color: colors.textPrimary,
          backgroundColor: colors.surface,
          borderColor: isFocused ? colors.input.underlineFocus : colors.input.underline,
        },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    height: theme.space[12] + theme.space[1],
    borderRadius: theme.radius.lg,
    borderWidth: BORDER_WIDTH,
    paddingHorizontal: theme.space[4],
    fontSize: theme.font.size.base,
  },
});
