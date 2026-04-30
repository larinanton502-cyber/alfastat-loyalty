import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../constants/colors';

const TextField = ({
  label,
  error,
  style,
  secureToggle = false,
  secureTextEntry = false,
  ...props
}) => {
  const [hidden, setHidden] = useState(true);
  const isSecure = secureTextEntry && (secureToggle ? hidden : true);
  const showToggle = secureToggle && secureTextEntry;

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputWrap}>
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            error && styles.inputError,
            showToggle && styles.inputWithToggle,
          ]}
          secureTextEntry={isSecure}
          {...props}
        />
        {showToggle && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setHidden((h) => !h)}
            activeOpacity={0.6}
          >
            <Text style={styles.toggleText}>
              {hidden ? 'Показать' : 'Скрыть'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
  },
  inputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    color: colors.text,
    fontSize: 15,
  },
  inputWithToggle: {
    paddingRight: 90,
  },
  inputError: {
    borderColor: colors.error,
  },
  toggleButton: {
    position: 'absolute',
    right: 6,
    top: 0,
    bottom: 0,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  toggleText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});

export default TextField;
