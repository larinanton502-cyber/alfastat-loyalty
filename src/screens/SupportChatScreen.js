import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';

const SUPPORT_NAME = 'Анна · Поддержка AlfaStat';

const QUICK_QUESTIONS = [
  'Как работают Альфа баллы?',
  'Что входит в премиум-тариф?',
  'Как использовать промокод?',
];

const matchAutoReply = (text) => {
  const t = text.toLowerCase();
  if (/(тариф|подпис|план|стоим|цен)/.test(t)) {
    return 'На вкладке «Тарифы» доступно 6 планов: Бесплатный, Базовый, Стартовый, Продвинутый, Корпоративный и Индивидуальный. При оплате на 6 месяцев скидка 10%, на 12 — 20%. Если нужна помощь с выбором — расскажите о ваших задачах.';
  }
  if (/(балл|коин|бонус|кэшбэк|cashback|карт)/.test(t)) {
    return 'Альфа баллы — внутренняя валюта Альфа-карты. Получать их можно за: ежедневный вход (+100), реферальную программу (+2000 за каждого друга), достижения и кэшбэк с покупок (10–15%). Списать Альфа баллы можно при покупке любого тарифа — 1 Альфа балл = 1 ₽.';
  }
  if (/(промокод|реферал|код|пригласить)/.test(t)) {
    return 'Ваш персональный промокод доступен в Профиле. Поделитесь им с другом — он получит 1000 Альфа баллов при регистрации, а вы 2000 Альфа баллов на счёт. Достижение «Друг привёл друга» даст ещё +1500 Альфа баллов.';
  }
  if (/(пробн|trial|14 дн)/.test(t)) {
    return 'После регистрации вы получаете пробный период 14 дней с активным тарифом «Продвинутый» — все премиум-функции открыты. После окончания тариф можно продлить за Альфа баллы или вернуться на бесплатный план.';
  }
  if (/(telegram|телеграм|канал)/.test(t)) {
    return 'Закрытый Telegram-канал доступен пользователям тарифов «Продвинутый», «Корпоративный» и «Индивидуальный». В нём — анонсы новых функций, экспертные советы и приоритетная поддержка. Ссылка на вступление появляется в Профиле после оформления подписки.';
  }
  if (/(пароль|логин|вход)/.test(t)) {
    return 'Сменить пароль можно в Профиле → «Сменить пароль». Если забыли текущий пароль — напишите ваш email, и мы поможем восстановить доступ.';
  }
  if (/(оплат|чек|счёт|деньг|возврат|рефанд)/.test(t)) {
    return 'Оплата в приложении производится Альфа баллами с Альфа-карты. Для оплаты картой/счётом обратитесь в коммерческий отдел через форму на сайте alfastat.ru. По возвратам и спорным операциям — ответим в течение 24 часов.';
  }
  if (/(привет|здравствуй|добрый|hi|hello)/.test(t)) {
    return 'Здравствуйте! Чем можем помочь? Опишите вашу ситуацию или выберите один из частых вопросов выше.';
  }
  if (/(спасибо|благодар|thanks)/.test(t)) {
    return 'Пожалуйста! Если возникнут ещё вопросы — пишите. Хорошего дня!';
  }
  return 'Спасибо за обращение! Передал ваш вопрос специалисту. Обычно отвечаем в течение 15 минут в рабочее время. Если нужна срочная консультация — напишите на support@alfastat.ru.';
};

const formatTime = (ts) => {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
};

const SupportChatScreen = () => {
  const { user } = useAuth();
  const scrollRef = useRef(null);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'init_1',
      from: 'support',
      text: `Здравствуйте, ${user?.name || 'друг'}! Я Анна, специалист поддержки AlfaStat. Чем могу помочь?`,
      date: Date.now() - 60_000,
    },
    {
      id: 'init_2',
      from: 'support',
      text: 'Можете описать вашу проблему словами или выбрать один из частых вопросов ниже.',
      date: Date.now() - 30_000,
    },
  ]);
  const [typing, setTyping] = useState(false);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const sendMessage = (content) => {
    const value = (content ?? text).trim();
    if (!value) return;

    const userMsg = {
      id: `u_${Date.now()}`,
      from: 'user',
      text: value,
      date: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setText('');
    setTyping(true);

    setTimeout(() => {
      const reply = matchAutoReply(value);
      setMessages((prev) => [
        ...prev,
        {
          id: `s_${Date.now()}`,
          from: 'support',
          text: reply,
          date: Date.now(),
        },
      ]);
      setTyping(false);
    }, 1100 + Math.random() * 700);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.headerInfo}>
        <View style={styles.supportAvatar}>
          <Text style={styles.supportAvatarText}>А</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.supportName}>{SUPPORT_NAME}</Text>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusText}>в сети · ответит за минуту</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={scrollToBottom}
        >
          {messages.map((m) => (
            <View
              key={m.id}
              style={[
                styles.messageRow,
                m.from === 'user' ? styles.messageRowUser : styles.messageRowSupport,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  m.from === 'user' ? styles.bubbleUser : styles.bubbleSupport,
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    m.from === 'user'
                      ? styles.bubbleTextUser
                      : styles.bubbleTextSupport,
                  ]}
                >
                  {m.text}
                </Text>
                <Text
                  style={[
                    styles.bubbleTime,
                    m.from === 'user'
                      ? styles.bubbleTimeUser
                      : styles.bubbleTimeSupport,
                  ]}
                >
                  {formatTime(m.date)}
                </Text>
              </View>
            </View>
          ))}

          {typing && (
            <View style={[styles.messageRow, styles.messageRowSupport]}>
              <View style={[styles.bubble, styles.bubbleSupport, styles.typingBubble]}>
                <View style={styles.typingDot} />
                <View style={[styles.typingDot, { marginLeft: 4 }]} />
                <View style={[styles.typingDot, { marginLeft: 4 }]} />
              </View>
            </View>
          )}

          {messages.filter((m) => m.from === 'user').length === 0 && (
            <View style={styles.quickQuestions}>
              <Text style={styles.quickTitle}>Частые вопросы</Text>
              {QUICK_QUESTIONS.map((q) => (
                <TouchableOpacity
                  key={q}
                  onPress={() => sendMessage(q)}
                  style={styles.quickButton}
                >
                  <Text style={styles.quickButtonText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Напишите сообщение…"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={() => sendMessage()}
            style={[
              styles.sendButton,
              !text.trim() && styles.sendButtonDisabled,
            ]}
            disabled={!text.trim()}
          >
            <Text style={styles.sendButtonText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  supportAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  supportAvatarText: {
    color: colors.textOnPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  supportName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    padding: 14,
    paddingBottom: 8,
  },
  messageRow: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowSupport: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleSupport: {
    backgroundColor: colors.background,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextUser: {
    color: colors.textOnPrimary,
  },
  bubbleTextSupport: {
    color: colors.text,
  },
  bubbleTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  bubbleTimeUser: {
    color: 'rgba(255,255,255,0.7)',
  },
  bubbleTimeSupport: {
    color: colors.textMuted,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
  },
  quickQuestions: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  quickTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 6,
  },
  quickButton: {
    backgroundColor: colors.background,
    borderColor: colors.primary,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    marginBottom: 6,
  },
  quickButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
    color: colors.text,
    fontSize: 14,
    marginRight: 8,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    color: colors.textOnPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
});

export default SupportChatScreen;
