import { useState } from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';
import { theme } from '@maps/tokens';
import { useTheme } from '@/lib/theme';

export type TextFieldProps = TextInputProps;

/**
 * Input atom — bare `TextInput` + theme. Label/error/hint live in the
 * `FormField` molecule (not here); this atom only owns the input box itself
 * per DESIGN.md "TextField — atom 신설" (height 52-56 / radius 12 / 1px
 * neutral border / 2px brand focus ring).
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
          borderWidth: isFocused ? 2 : 1,
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
    paddingHorizontal: theme.space[4],
    fontSize: theme.font.size.base,
  },
});
