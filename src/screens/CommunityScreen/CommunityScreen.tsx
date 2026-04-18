import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../../theme';
import {
  mockCommunityFriends,
  mockCommunityGroupThreads,
  mockCommunityPosts,
  mockCommunityStories,
  type CommunityFriend,
  type CommunityGroupThread,
  type CommunityPost,
  type CommunityTab,
} from '../../mock';

const d = colors.dark;
const TABS: Array<{ key: CommunityTab; label: string }> = [
  { key: 'feed', label: 'Feed' },
  { key: 'group', label: 'Group' },
  { key: 'friends', label: 'Friends' },
];

export const CommunityScreen = () => {
  const [activeTab, setActiveTab] = useState<CommunityTab>('feed');
  const [search, setSearch] = useState('');
  const [posts] = useState(mockCommunityPosts);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesTab = activeTab === 'feed' ? true : post.tab === activeTab;
      const haystack = `${post.author} ${post.role} ${post.content}`.toLowerCase();
      const matchesSearch = haystack.includes(search.trim().toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, posts, search]);

  const filteredGroups = useMemo(() => {
    return mockCommunityGroupThreads.filter((thread) => {
      const haystack = `${thread.name} ${thread.previewSender} ${thread.previewText}`.toLowerCase();
      return haystack.includes(search.trim().toLowerCase());
    });
  }, [search]);

  const filteredFriends = useMemo(() => {
    return mockCommunityFriends.filter((friend) => {
      const haystack = `${friend.name} ${friend.status}`.toLowerCase();
      return haystack.includes(search.trim().toLowerCase());
    });
  }, [search]);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Community</Text>
            <TouchableOpacity style={styles.headerAction} activeOpacity={0.8}>
              <Text style={styles.headerActionText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchWrap}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for competition, club or friend"
              placeholderTextColor={d.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storyRow}
            style={styles.storyStrip}
          >
            {mockCommunityStories.map((story) => (
              <TouchableOpacity key={story.id} style={styles.storyItem} activeOpacity={0.82}>
                <View
                  style={[
                    styles.storyRing,
                    story.isAdd && styles.storyRingAdd,
                    { borderColor: story.color },
                ]}
              >
                <View style={[styles.storyInner, { backgroundColor: story.color }]}>
                    <Text style={[styles.storyAvatarText, story.isAdd && styles.storyAddText]}>
                      {story.avatar}
                    </Text>
                  </View>
                </View>
                <Text style={styles.storyLabel}>{story.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.tabsWrap}>
            {TABS.map((tab) => {
              const isActive = tab.key === activeTab;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={styles.tabButton}
                  onPress={() => setActiveTab(tab.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
                  <View style={[styles.tabUnderline, isActive && styles.tabUnderlineActive]} />
                </TouchableOpacity>
              );
            })}
          </View>

          {activeTab === 'group'
            ? filteredGroups.map((thread) => (
                <GroupThreadRow key={thread.id} thread={thread} />
              ))
            : activeTab === 'friends'
              ? filteredFriends.map((friend) => (
                  <FriendRow key={friend.id} friend={friend} />
                ))
              : filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const PostCard = ({ post }: { post: CommunityPost }) => (
  <View style={styles.postCard}>
    <View style={styles.postHeader}>
      <View style={[styles.avatar, { backgroundColor: post.avatarColor }]}>
        <Text style={styles.avatarText}>{post.avatar}</Text>
      </View>
      <View style={styles.postMeta}>
        <Text style={styles.author}>{post.author}</Text>
        <Text style={styles.metaText}>
          {post.minutesAgo < 60
            ? `${post.minutesAgo} minutes ago`
            : `${Math.floor(post.minutesAgo / 60)} hours ago`}
          {'  '}•{'  '}
          {post.role}
        </Text>
      </View>
      <TouchableOpacity style={styles.moreButton} activeOpacity={0.8}>
        <Text style={styles.moreButtonText}>···</Text>
      </TouchableOpacity>
    </View>

    <Text style={styles.postContent}>{post.content}</Text>

    {post.gallery ? (
      <View style={styles.galleryRow}>
        {post.gallery.map((item) => (
          <View key={item} style={styles.galleryCard}>
            <Text style={styles.galleryText}>{item}</Text>
          </View>
        ))}
      </View>
    ) : null}

    <View style={styles.postFooter}>
      <View style={styles.footerLeft}>
        <Text style={styles.footerMetric}>♡ {post.likes}</Text>
        <Text style={styles.footerMetric}>◌ {post.comments}</Text>
      </View>
      <TouchableOpacity style={styles.replyButton} activeOpacity={0.8}>
        <Text style={styles.replyButtonText}>↩</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const GroupThreadRow = ({ thread }: { thread: CommunityGroupThread }) => (
  <TouchableOpacity style={styles.threadRow} activeOpacity={0.82}>
    <View style={[styles.threadAvatar, { backgroundColor: thread.avatarColor }]}>
      <Text style={styles.threadAvatarText}>{thread.avatar}</Text>
    </View>

    <View style={styles.threadContent}>
      <Text style={styles.threadTitle}>{thread.name}</Text>
      <Text style={styles.threadPreview} numberOfLines={1}>
        <Text style={styles.threadSender}>-{thread.previewSender}: </Text>
        {thread.previewText}
      </Text>
    </View>

    <View style={styles.threadMeta}>
      <Text style={styles.threadTime}>{thread.time}</Text>
      <View style={styles.threadBadge}>
        <Text style={styles.threadBadgeText}>{thread.unreadCount}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const FriendRow = ({ friend }: { friend: CommunityFriend }) => (
  <TouchableOpacity style={styles.friendRow} activeOpacity={0.82}>
    <View style={[styles.friendAvatar, { backgroundColor: friend.avatarColor }]}>
      <Text style={styles.friendAvatarText}>{friend.avatar}</Text>
    </View>

    <View style={styles.friendContent}>
      <Text style={styles.friendName}>{friend.name}</Text>
      <Text style={[styles.friendStatus, friend.isOnline && styles.friendStatusOnline]}>
        {friend.status}
      </Text>
    </View>

    <TouchableOpacity style={styles.unfollowButton} activeOpacity={0.85}>
      <Text style={styles.unfollowButtonText}>Unfollow</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: d.background,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    color: d.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  headerAction: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: d.surfaceElevated,
    borderWidth: 1,
    borderColor: d.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionText: {
    color: d.text,
    fontSize: 24,
    fontWeight: '300',
    marginTop: -2,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: d.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: d.border,
  },
  searchIcon: {
    color: d.textMuted,
    fontSize: 20,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: d.text,
    fontSize: 15,
    paddingVertical: spacing.sm,
  },
  storyRow: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  storyStrip: {
    flexGrow: 0,
  },
  storyItem: {
    width: 74,
    alignItems: 'center',
    gap: spacing.sm,
  },
  storyRing: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    borderWidth: 2,
    padding: 3,
    backgroundColor: d.surfaceElevated,
  },
  storyRingAdd: {
    borderColor: d.primary,
  },
  storyInner: {
    flex: 1,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  storyAddText: {
    fontSize: 28,
    fontWeight: '300',
  },
  storyLabel: {
    color: d.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  tabsWrap: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: d.border,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  tabText: {
    color: d.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  tabTextActive: {
    color: d.text,
  },
  tabUnderline: {
    width: '100%',
    height: 3,
    borderRadius: radius.full,
    backgroundColor: 'transparent',
  },
  tabUnderlineActive: {
    backgroundColor: d.primary,
  },
  threadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    gap: spacing.md,
  },
  threadAvatar: {
    width: 54,
    height: 54,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  threadContent: {
    flex: 1,
    gap: 4,
  },
  threadTitle: {
    color: d.text,
    fontSize: 17,
    fontWeight: '700',
  },
  threadPreview: {
    color: d.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  threadSender: {
    color: d.textSecondary,
  },
  threadMeta: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  threadTime: {
    color: d.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  threadBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  friendAvatar: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendAvatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  friendContent: {
    flex: 1,
    gap: 4,
  },
  friendName: {
    color: d.text,
    fontSize: 17,
    fontWeight: '700',
  },
  friendStatus: {
    color: d.textSecondary,
    fontSize: 14,
  },
  friendStatusOnline: {
    color: '#34D399',
    fontWeight: '600',
  },
  unfollowButton: {
    minWidth: 92,
    height: 38,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: d.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  unfollowButtonText: {
    color: d.text,
    fontSize: 14,
    fontWeight: '700',
  },
  postCard: {
    backgroundColor: d.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: d.border,
    padding: spacing.md,
    gap: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  postMeta: {
    flex: 1,
  },
  author: {
    color: d.text,
    fontSize: 15,
    fontWeight: '700',
  },
  metaText: {
    color: d.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  moreButton: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButtonText: {
    color: d.textMuted,
    fontSize: 18,
    marginTop: -6,
  },
  postContent: {
    color: d.text,
    fontSize: 16,
    lineHeight: 24,
  },
  galleryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  galleryCard: {
    flex: 1,
    height: 96,
    borderRadius: radius.md,
    backgroundColor: d.surfaceElevated,
    borderWidth: 1,
    borderColor: d.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryText: {
    color: d.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: d.border,
    paddingTop: spacing.sm,
  },
  footerLeft: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  footerMetric: {
    color: d.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  replyButton: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    backgroundColor: d.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyButtonText: {
    color: d.textSecondary,
    fontSize: 15,
  },
});
