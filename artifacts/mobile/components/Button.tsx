import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface ButtonProps extends TouchableOpacityProps {
  title?: string;
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  title,
  variant = "default",
  size = "default",
  isLoading = false,
  icon,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const colors = useColors();

  const getBackgroundColor = () => {
    if (disabled && variant !== "outline" && variant !== "ghost") return colors.muted;
    switch (variant) {
      case "secondary":
        return colors.secondary;
      case "destructive":
        return colors.destructive;
      case "outline":
      case "ghost":
        return "transparent";
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.mutedForeground;
    switch (variant) {
      case "secondary":
        return colors.secondaryForeground;
      case "destructive":
        return colors.destructiveForeground;
      case "outline":
      case "ghost":
        return colors.foreground;
      default:
        return colors.primaryForeground;
    }
  };

  const getBorderColor = () => {
    if (variant === "outline") return colors.border;
    return "transparent";
  };

  const getHeight = () => {
    switch (size) {
      case "sm":
        return 36;
      case "lg":
        return 56;
      case "icon":
        return 44;
      default:
        return 48;
    }
  };

  const getPadding = () => {
    if (size === "icon") return 0;
    switch (size) {
      case "sm":
        return 12;
      case "lg":
        return 24;
      default:
        return 16;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === "outline" ? 1 : 0,
          height: getHeight(),
          paddingHorizontal: getPadding(),
          borderRadius: colors.radius,
          opacity: disabled || isLoading ? 0.7 : 1,
        },
        style,
      ]}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.content}>
          {icon && <View style={title ? styles.iconContainer : undefined}>{icon}</View>}
          {title && (
            <Text
              style={[
                styles.text,
                { color: getTextColor() },
                size === "lg" && styles.textLg,
                size === "sm" && styles.textSm,
              ]}
            >
              {title}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  textLg: {
    fontSize: 18,
  },
  textSm: {
    fontSize: 14,
  },
});
