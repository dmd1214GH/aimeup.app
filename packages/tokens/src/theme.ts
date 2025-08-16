import { tokens, getFontWeightForRN } from './tokens';
import type { Theme } from 'react-native-elements';

// React Native Elements theme configuration using tokens
export const theme: Theme = {
  colors: {
    primary: tokens.colors.primary[600],
    secondary: tokens.colors.secondary[600],
    success: tokens.colors.success[500],
    warning: tokens.colors.warning[500],
    error: tokens.colors.danger[500],
    // RN Elements specific greys
    grey0: tokens.colors.neutral[50],
    grey1: tokens.colors.neutral[100],
    grey2: tokens.colors.neutral[200],
    grey3: tokens.colors.neutral[300],
    grey4: tokens.colors.neutral[400],
    grey5: tokens.colors.neutral[500],
    // Additional colors
    white: tokens.colors.white,
    black: tokens.colors.black,
    divider: tokens.colors.neutral[200],
    platform: {
      ios: {
        primary: tokens.colors.primary[600],
        secondary: tokens.colors.secondary[600],
        success: tokens.colors.success[500],
        warning: tokens.colors.warning[500],
        error: tokens.colors.danger[500],
      },
      android: {
        primary: tokens.colors.primary[600],
        secondary: tokens.colors.secondary[600],
        success: tokens.colors.success[500],
        warning: tokens.colors.warning[500],
        error: tokens.colors.danger[500],
      },
      web: {
        primary: tokens.colors.primary[600],
        secondary: tokens.colors.secondary[600],
        success: tokens.colors.success[500],
        warning: tokens.colors.warning[500],
        error: tokens.colors.danger[500],
      },
    },
  },
  Button: {
    titleStyle: {
      fontSize: tokens.fontSize.base.size,
      fontWeight: getFontWeightForRN('semibold'),
    },
    buttonStyle: {
      borderRadius: tokens.borderRadius.lg,
      paddingVertical: tokens.spacing[3],
      paddingHorizontal: tokens.spacing[4],
    },
    disabledStyle: {
      opacity: tokens.opacity[50],
    },
    disabledTitleStyle: {
      color: tokens.colors.neutral[400],
    },
  },
  Input: {
    inputStyle: {
      fontSize: tokens.fontSize.base.size,
      color: tokens.colors.neutral[900],
    },
    containerStyle: {
      paddingHorizontal: 0,
    },
    inputContainerStyle: {
      borderBottomWidth: tokens.borderWidth[1],
      borderBottomColor: tokens.colors.neutral[300],
    },
    labelStyle: {
      fontSize: tokens.fontSize.sm.size,
      color: tokens.colors.neutral[700],
      fontWeight: getFontWeightForRN('medium'),
      marginBottom: tokens.spacing[1],
    },
    errorStyle: {
      color: tokens.colors.danger[500],
      fontSize: tokens.fontSize.xs.size,
      marginTop: tokens.spacing[1],
    },
    placeholderTextColor: tokens.colors.neutral[400],
  },
  Card: {
    containerStyle: {
      borderRadius: tokens.borderRadius.lg,
      padding: tokens.spacing[4],
      margin: 0,
      ...tokens.shadows.base,
    },
  },
  Text: {
    style: {
      fontSize: tokens.fontSize.base.size,
      color: tokens.colors.neutral[900],
    },
    h1Style: {
      fontSize: tokens.fontSize['3xl'].size,
      fontWeight: getFontWeightForRN('bold'),
      color: tokens.colors.neutral[900],
    },
    h2Style: {
      fontSize: tokens.fontSize['2xl'].size,
      fontWeight: getFontWeightForRN('semibold'),
      color: tokens.colors.neutral[900],
    },
    h3Style: {
      fontSize: tokens.fontSize.xl.size,
      fontWeight: getFontWeightForRN('semibold'),
      color: tokens.colors.neutral[900],
    },
    h4Style: {
      fontSize: tokens.fontSize.lg.size,
      fontWeight: getFontWeightForRN('medium'),
      color: tokens.colors.neutral[900],
    },
  },
  ListItem: {
    containerStyle: {
      paddingVertical: tokens.spacing[3],
      paddingHorizontal: tokens.spacing[4],
    },
  },
  Header: {
    backgroundColor: tokens.colors.primary[600],
    centerComponent: {
      style: {
        color: tokens.colors.white,
        fontSize: tokens.fontSize.lg.size,
        fontWeight: getFontWeightForRN('semibold'),
      },
    },
  },
};

// Export button variants using theme colors
export const buttonVariants = {
  primary: {
    buttonStyle: {
      backgroundColor: tokens.colors.primary[600],
    },
    titleStyle: {
      color: tokens.colors.white,
    },
  },
  secondary: {
    buttonStyle: {
      backgroundColor: tokens.colors.secondary[600],
    },
    titleStyle: {
      color: tokens.colors.white,
    },
  },
  outline: {
    buttonStyle: {
      backgroundColor: 'transparent',
      borderWidth: tokens.borderWidth[1],
      borderColor: tokens.colors.neutral[300],
    },
    titleStyle: {
      color: tokens.colors.neutral[900],
    },
  },
  clear: {
    buttonStyle: {
      backgroundColor: 'transparent',
    },
    titleStyle: {
      color: tokens.colors.primary[600],
    },
  },
};

// Export button sizes
export const buttonSizes = {
  sm: {
    buttonStyle: {
      paddingVertical: tokens.spacing[2],
      paddingHorizontal: tokens.spacing[3],
      minHeight: 32,
    },
    titleStyle: {
      fontSize: tokens.fontSize.sm.size,
    },
  },
  md: {
    buttonStyle: {
      paddingVertical: tokens.spacing[3],
      paddingHorizontal: tokens.spacing[4],
      minHeight: 44,
    },
    titleStyle: {
      fontSize: tokens.fontSize.base.size,
    },
  },
  lg: {
    buttonStyle: {
      paddingVertical: tokens.spacing[4],
      paddingHorizontal: tokens.spacing[6],
      minHeight: 52,
    },
    titleStyle: {
      fontSize: tokens.fontSize.lg.size,
    },
  },
};

// Export card variants
export const cardVariants = {
  default: {
    containerStyle: {
      ...tokens.shadows.base,
      backgroundColor: tokens.colors.white,
    },
  },
  elevated: {
    containerStyle: {
      ...tokens.shadows.lg,
      backgroundColor: tokens.colors.white,
    },
  },
  outlined: {
    containerStyle: {
      ...tokens.shadows.none,
      borderWidth: tokens.borderWidth[1],
      borderColor: tokens.colors.neutral[200],
      backgroundColor: tokens.colors.white,
    },
  },
};
