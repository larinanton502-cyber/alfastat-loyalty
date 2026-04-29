import { Alert, Platform } from 'react-native';

export const confirm = ({
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Отмена',
  destructive = false,
  onConfirm,
  onCancel,
}) => {
  if (Platform.OS === 'web') {
    const text = message ? `${title}\n\n${message}` : title;
    if (window.confirm(text)) {
      onConfirm && onConfirm();
    } else {
      onCancel && onCancel();
    }
  } else {
    Alert.alert(title, message, [
      { text: cancelText, style: 'cancel', onPress: onCancel },
      {
        text: confirmText,
        style: destructive ? 'destructive' : 'default',
        onPress: onConfirm,
      },
    ]);
  }
};

export const notify = ({ title, message, onClose }) => {
  if (Platform.OS === 'web') {
    const text = message ? `${title}\n\n${message}` : title;
    window.alert(text);
    onClose && onClose();
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress: onClose }]);
  }
};
