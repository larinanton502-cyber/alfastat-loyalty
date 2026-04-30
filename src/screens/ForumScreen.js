import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { storage } from '../storage/storage';
import { colors } from '../constants/colors';
import PrimaryButton from '../components/PrimaryButton';
import { notify } from '../utils/dialog';

const SEED_POSTS = [
  {
    id: 'seed_1',
    authorName: 'Команда AlfaStat',
    isModerator: true,
    title: 'Добро пожаловать в сообщество AlfaStat!',
    body: 'Здесь вы можете обмениваться опытом с другими SEO-специалистами, задавать вопросы и получать консультации от наших экспертов. Соблюдайте уважение и делитесь полезной информацией.',
    date: Date.now() - 14 * 24 * 60 * 60 * 1000,
    likes: 47,
    tag: 'Объявление',
  },
  {
    id: 'seed_2',
    authorName: 'Александра М.',
    isModerator: false,
    title: 'Как использовать радар изменений?',
    body: 'Добрый день! Подскажите, как настроить уведомления о просадке трафика? Хочу получать оповещения только при существенных изменениях.',
    date: Date.now() - 5 * 24 * 60 * 60 * 1000,
    likes: 12,
    tag: 'Вопрос',
  },
  {
    id: 'seed_3',
    authorName: 'Команда AlfaStat',
    isModerator: true,
    title: 'Ответ: настройка фильтра уведомлений',
    body: 'Перейдите в раздел «Радар» → «Фильтры» → создайте новое правило с условиями (например: трафик упал более чем на 15% за день). Можно настроить отдельные фильтры для разных проектов.',
    date: Date.now() - 4 * 24 * 60 * 60 * 1000,
    likes: 23,
    tag: 'Консультация',
  },
  {
    id: 'seed_4',
    authorName: 'Дмитрий К.',
    isModerator: false,
    title: 'Делюсь опытом: интеграция с Ahrefs',
    body: 'Подключил Ahrefs к AlfaStat — теперь вижу backlinks конкурентов в одном дашборде. Очень удобно для еженедельной аналитики.',
    date: Date.now() - 2 * 24 * 60 * 60 * 1000,
    likes: 31,
    tag: 'Опыт',
  },
  {
    id: 'seed_5',
    authorName: 'Ирина С.',
    isModerator: false,
    title: 'A/B тесты — кто пробовал?',
    body: 'Хочу запустить A/B тест на категорийных страницах интернет-магазина. Посоветуйте, на каких метриках стоит фокусироваться?',
    date: Date.now() - 1 * 24 * 60 * 60 * 1000,
    likes: 8,
    tag: 'Вопрос',
  },
];

const formatDate = (ts) => {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (days === 0) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    if (hours === 0) {
      const mins = Math.floor(diff / (60 * 1000));
      return mins <= 1 ? 'только что' : `${mins} мин. назад`;
    }
    return `${hours} ч. назад`;
  }
  if (days === 1) return 'вчера';
  if (days < 7) return `${days} дн. назад`;
  const d = new Date(ts);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}.${d.getFullYear()}`;
};

const PostCard = ({ post, onLike, liked }) => (
  <View style={styles.postCard}>
    <View style={styles.postHeader}>
      <View
        style={[
          styles.avatar,
          post.isModerator && styles.avatarModerator,
        ]}
      >
        <Text style={styles.avatarText}>
          {post.authorName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.authorRow}>
          <Text style={styles.authorName}>{post.authorName}</Text>
          {post.isModerator && (
            <View style={styles.modBadge}>
              <Text style={styles.modBadgeText}>МОДЕРАТОР</Text>
            </View>
          )}
        </View>
        <Text style={styles.postDate}>{formatDate(post.date)}</Text>
      </View>
      {post.tag && (
        <View style={styles.tag}>
          <Text style={styles.tagText}>{post.tag}</Text>
        </View>
      )}
    </View>

    <Text style={styles.postTitle}>{post.title}</Text>
    <Text style={styles.postBody}>{post.body}</Text>

    <TouchableOpacity onPress={onLike} style={styles.likeButton}>
      <Text style={[styles.likeIcon, liked && styles.likeIconActive]}>
        ♥
      </Text>
      <Text style={[styles.likeCount, liked && styles.likeCountActive]}>
        {post.likes}
      </Text>
    </TouchableOpacity>
  </View>
);

const ForumScreen = () => {
  const { user, addForumPost } = useAuth();
  const [posts, setPosts] = useState([]);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [likedIds, setLikedIds] = useState({});

  useEffect(() => {
    (async () => {
      let stored = await storage.getForumPosts();
      if (!stored) {
        stored = SEED_POSTS;
        await storage.saveForumPosts(stored);
      }
      setPosts(stored);
    })();
  }, []);

  const submit = async () => {
    if (!title.trim() || !body.trim()) {
      notify({ title: 'Заполните поля', message: 'Введите заголовок и текст' });
      return;
    }
    setSubmitting(true);
    try {
      const newPost = {
        id: `user_${Date.now()}`,
        authorName: user.name,
        isModerator: false,
        title: title.trim(),
        body: body.trim(),
        date: Date.now(),
        likes: 0,
        tag: 'Опыт',
      };
      const next = [newPost, ...posts];
      setPosts(next);
      await storage.saveForumPosts(next);
      await addForumPost();
      setTitle('');
      setBody('');
      setCreating(false);
      notify({
        title: 'Сообщение опубликовано',
        message: 'Спасибо за вклад в сообщество!',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = async (id) => {
    const isLiked = likedIds[id];
    const next = posts.map((p) => {
      if (p.id !== id) return p;
      return { ...p, likes: p.likes + (isLiked ? -1 : 1) };
    });
    setPosts(next);
    setLikedIds((prev) => ({ ...prev, [id]: !isLiked }));
    await storage.saveForumPosts(next);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Сообщество</Text>
          <Text style={styles.headerSubtitle}>
            Эксперты AlfaStat и пользователи
          </Text>
        </View>
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => setCreating(true)}
        >
          <Text style={styles.newButtonText}>+ Написать</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            liked={likedIds[item.id]}
            onLike={() => toggleLike(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Пока нет сообщений</Text>
        }
      />

      <Modal visible={creating} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalRoot}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setCreating(false)}
          />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Новое сообщение</Text>

            <Text style={styles.fieldLabel}>Заголовок</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="О чём хотите написать?"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              maxLength={120}
            />

            <Text style={styles.fieldLabel}>Текст</Text>
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Поделитесь опытом или задайте вопрос"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, styles.textarea]}
              multiline
              maxLength={1000}
            />

            <View style={styles.modalActions}>
              <PrimaryButton
                title="Отмена"
                variant="ghost"
                onPress={() => setCreating(false)}
                style={{ flex: 1 }}
              />
              <View style={{ width: 10 }} />
              <PrimaryButton
                title="Опубликовать"
                onPress={submit}
                loading={submitting}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  newButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  newButtonText: {
    color: colors.textOnPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  list: {
    padding: 14,
    paddingBottom: 30,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 40,
  },
  postCard: {
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarModerator: {
    backgroundColor: colors.primary,
  },
  avatarText: {
    color: colors.textOnPrimary,
    fontWeight: '800',
    fontSize: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  modBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  modBadgeText: {
    color: colors.textOnPrimary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  postDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  tag: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
  },
  postTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  postBody: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  likeIcon: {
    fontSize: 18,
    color: colors.textMuted,
    marginRight: 6,
  },
  likeIconActive: {
    color: colors.error,
  },
  likeCount: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '700',
  },
  likeCountActive: {
    color: colors.error,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13,71,161,0.4)',
  },
  modalSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    paddingBottom: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
    marginBottom: 14,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 4,
  },
});

export default ForumScreen;
