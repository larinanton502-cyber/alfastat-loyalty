import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storage } from '../storage/storage';
import { colors } from '../constants/colors';
import { WELCOME_BONUS, TRIAL_DURATION_DAYS } from '../constants/subscriptions';
import PrimaryButton from '../components/PrimaryButton';

const SLIDES = [
  {
    title: 'AlfaStat',
    subtitle: 'Платформа SEO-аналитики',
    description:
      'Более 20 источников информации. Ежедневное обновление данных по вашему проекту.',
    visual: 'logo',
  },
  {
    title: 'Новая философия SEO',
    subtitle: 'Иерархия данных',
    description:
      'Запрос → Страница → Категория → Направление → Проект. Анализ работает на любом уровне детализации.',
    visual: 'hierarchy',
    items: ['Запрос', 'Страница', 'Категория', 'Направление', 'Проект'],
  },
  {
    title: 'Идея платформы',
    subtitle: 'Анализ страниц по 13+ параметрам',
    description: 'Каждая страница исследуется по комплексу метрик одновременно.',
    visual: 'chips',
    items: [
      'Популярность',
      'Наличие товара',
      'Текстовая релевантность',
      'Трафик',
      'Код ответа',
      'Позиции',
      'Индексация',
      'Клики',
      'Изменения',
      'Внешние ссылки',
      'Кол-во товаров',
      'Релевантный URL',
      'Мета-теги',
    ],
  },
  {
    title: 'Источники данных',
    subtitle: 'Интеграции с лучшими сервисами',
    description:
      'Объединяем данные из всех ключевых сервисов аналитики в одной платформе.',
    visual: 'chips',
    items: [
      'Поиск Яндекса',
      'Поиск Google',
      'Search Console',
      'Яндекс.Метрика',
      'Яндекс.Директ',
      'Google Analytics 4',
      'PageSpeed Insights',
      'Ahrefs',
      'Semrush',
      'Keyso',
      'Wordstat',
      'Яндекс.Вебмастер',
      'Google Ads',
      'AlfaStat AI парсеры',
    ],
  },
  {
    title: 'Какие задачи решает?',
    subtitle: 'Готовые сценарии для роста',
    description: '',
    visual: 'list',
    items: [
      'Точки роста — какие страницы принесут больше денег',
      'Узнать о проблемах раньше Яндекса/Google',
      'Найти все страницы вне индекса',
      'Добавить страницу в индекс Google',
      'Найти внешние ссылки',
      'Найти все недоступные страницы (404/301/410)',
      'Найти страницы без товаров',
      'Найти страницы где просел SEO-трафик',
    ],
  },
  {
    title: 'Возможности платформы',
    subtitle: 'Полный набор инструментов',
    description: '',
    visual: 'twoColumns',
    items: [
      'Агрегированные данные',
      'Уведомления о проблемах',
      'Отчёт по конкурентам',
      'Контроль изменений (радар)',
      'Проверка индексации',
      'Своя проверка «живой выдачи»',
      'Поиск внешних ссылок',
      'A/B тесты',
      'Контроль внешних ссылок',
      'Проверка доступности сайта',
      'Ежедневный парсинг (под ключ)',
    ],
  },
  {
    title: 'Программа лояльности',
    subtitle: 'Начните прямо сейчас',
    description: `Зарегистрируйтесь и получите ${WELCOME_BONUS.toLocaleString(
      'ru-RU'
    )} баллов на счёт и пробный период ${TRIAL_DURATION_DAYS} дней с доступом ко всем премиум-функциям.`,
    visual: 'cta',
  },
];

const Slide = ({ slide, width }) => {
  const { visual, items = [] } = slide;

  return (
    <View style={[styles.slide, { width }]}>
      <ScrollView
        contentContainerStyle={styles.slideContent}
        showsVerticalScrollIndicator={false}
      >
        {visual === 'logo' && (
          <View style={styles.logoBox}>
            <Text style={styles.logoMark}>α</Text>
          </View>
        )}

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
        {slide.description ? (
          <Text style={styles.description}>{slide.description}</Text>
        ) : null}

        {visual === 'hierarchy' && (
          <View style={styles.hierarchy}>
            {items.map((item, i) => (
              <View key={item} style={styles.hierarchyRow}>
                <View style={styles.hierarchyItem}>
                  <Text style={styles.hierarchyText}>{item}</Text>
                </View>
                {i < items.length - 1 && (
                  <Text style={styles.hierarchyArrow}>↓</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {visual === 'chips' && (
          <View style={styles.chipsWrap}>
            {items.map((item) => (
              <View key={item} style={styles.chip}>
                <Text style={styles.chipText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {visual === 'list' && (
          <View style={styles.list}>
            {items.map((item) => (
              <View key={item} style={styles.listRow}>
                <View style={styles.listBullet} />
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {visual === 'twoColumns' && (
          <View style={styles.list}>
            {items.map((item) => (
              <View key={item} style={styles.listRow}>
                <Text style={styles.listPlus}>+</Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {visual === 'cta' && (
          <View style={styles.ctaCards}>
            <View style={styles.ctaCard}>
              <Text style={styles.ctaCardValue}>
                {WELCOME_BONUS.toLocaleString('ru-RU')}
              </Text>
              <Text style={styles.ctaCardLabel}>Стартовый баланс</Text>
            </View>
            <View style={styles.ctaCard}>
              <Text style={styles.ctaCardValue}>{TRIAL_DURATION_DAYS} дней</Text>
              <Text style={styles.ctaCardLabel}>Премиум пробный период</Text>
            </View>
            <View style={styles.ctaCard}>
              <Text style={styles.ctaCardValue}>До −20%</Text>
              <Text style={styles.ctaCardLabel}>Скидка за длительность</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const OnboardingScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const slideWidth = Math.min(width, 480);
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      const next = index + 1;
      setIndex(next);
      scrollRef.current?.scrollTo({ x: slideWidth * next, animated: true });
    } else {
      finish();
    }
  };

  const finish = async () => {
    await storage.setOnboardingSeen();
    navigation.replace('Login');
  };

  const onMomentumScrollEnd = (e) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / slideWidth);
    if (i !== index) setIndex(i);
  };

  const isLast = index === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.scrollWrapper}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumScrollEnd}
            style={{ width: slideWidth, alignSelf: 'center' }}
          >
            {SLIDES.map((s, i) => (
              <Slide key={i} slide={s} width={slideWidth} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.bottom}>
          <PrimaryButton
            title={isLast ? 'Зарегистрироваться' : 'Далее'}
            onPress={goNext}
            style={{ marginBottom: 10, width: '100%', maxWidth: 360, alignSelf: 'center' }}
          />
          {!isLast && (
            <TouchableOpacity onPress={finish}>
              <Text style={styles.skip}>Пропустить</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollWrapper: {
    flex: 1,
  },
  slide: {
    flex: 1,
  },
  slideContent: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 24,
    alignItems: 'center',
  },
  logoBox: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoMark: {
    fontSize: 50,
    color: colors.textOnPrimary,
    fontWeight: '900',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  hierarchy: {
    alignItems: 'center',
    marginTop: 8,
  },
  hierarchyRow: {
    alignItems: 'center',
  },
  hierarchyItem: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 26,
    minWidth: 180,
    alignItems: 'center',
  },
  hierarchyText: {
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 14,
  },
  hierarchyArrow: {
    fontSize: 22,
    color: colors.primary,
    marginVertical: 4,
    fontWeight: '700',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 6,
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
    margin: 4,
  },
  chipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    width: '100%',
    marginTop: 6,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  listBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 8,
    marginRight: 10,
  },
  listPlus: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 16,
    marginRight: 8,
    marginTop: 1,
  },
  listText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  ctaCards: {
    width: '100%',
    marginTop: 8,
  },
  ctaCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  ctaCardValue: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.primary,
  },
  ctaCardLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 14,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 22,
  },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  skip: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
    paddingVertical: 8,
  },
});

export default OnboardingScreen;
