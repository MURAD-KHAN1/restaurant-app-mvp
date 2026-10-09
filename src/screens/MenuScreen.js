import { useApi } from '../hooks/useApi';
import { normalizeMenu } from '../api/menu';
// ==================================================
// FILE: MenuScreen.js
// PURPOSE: Shows food with search, categories and sorting
// VIVA: Edit search, debounce, favourites and list here; food buttons are in MenuItemCard.js
// ==================================================

// ===== IMPORTS =====
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryChip from '../components/CategoryChip';
import EmptyState from '../components/EmptyState';
import MenuItemCard from '../components/MenuItemCard';
import { FadeSlideView, ScalePressable } from '../components/Motion';
import { BRAND_NAME } from '../constants/brand';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useRestaurant } from '../context/RestaurantContext';
import { useTheme } from '../context/ThemeContext';
import { CATEGORY_ICONS, MENU_CATEGORIES } from '../constants/menu';
import { useDebounce } from '../hooks/useDebounce';
import { formatCurrency } from '../theme/colors';

const SORT_OPTIONS = ['Featured', 'Price Low to High', 'Price High to Low', 'Name A to Z', 'Favourites'];

export default function MenuScreen({ navigation }) {
  // ===== GET SHARED DATA =====
  const { colors } = useTheme();
  const { user } = useAuth();
  const { menuItems: sharedMenuItems, setMenuItems } = useRestaurant();
  const { data, loading, error, refetch } = useApi('/menu', { transform: normalizeMenu, onData: setMenuItems });
  const isLoading = loading && data === null;
  const { addItem, itemCount } = useCart();
  // ===== MENU REFERENCES =====
  const searchInputRef = useRef(null);
  const listRef = useRef(null);
  const renderCount = useRef(0);
  const previousQueryRef = useRef('');
  // Changing a ref does not cause a re-render, while changing state does.
  useEffect(() => {
    renderCount.current += 1;
  });

  // ===== LOCAL STATE =====
  const [search, setSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('Featured');
  const [favourites, setFavourites] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  // ===== DEBOUNCE: WAIT BEFORE SEARCH =====
  const debouncedSearch = useDebounce(search.trim(), 400);

  useEffect(() => {
    if (debouncedSearch.length < 2) return;
    if (previousQueryRef.current.toLowerCase() === debouncedSearch.toLowerCase()) return;
    previousQueryRef.current = debouncedSearch;
    setRecentSearches((current) => [
      debouncedSearch,
      ...current.filter((item) => item.toLowerCase() !== debouncedSearch.toLowerCase()),
    ].slice(0, 5));
  }, [debouncedSearch]);


  // Filtered and sorted menu items are derived data, so useMemo is preferable to separate state.
  // ===== SEARCH FUNCTION / CATEGORY FILTER / SORT =====
  const visibleItems = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    const result = sharedMenuItems.filter((item) => {
      const matchesCategory = category === 'All' || item.category === category;
      const matchesSearch = !query || item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
    if (sort === 'Favourites') return result.filter((item) => favourites.includes(item.id));
    if (sort === 'Price Low to High') return [...result].sort((a, b) => a.price - b.price);
    if (sort === 'Price High to Low') return [...result].sort((a, b) => b.price - a.price);
    if (sort === 'Name A to Z') return [...result].sort((a, b) => a.name.localeCompare(b.name));
    return [...result].sort((a, b) => Number(b.isSpecial) - Number(a.isSpecial));
  }, [category, debouncedSearch, favourites, sharedMenuItems, sort]);

  useLayoutEffect(() => {
    const title = 'Menu (' + visibleItems.length + ')';
    navigation.setOptions({ title, tabBarLabel: title });
  }, [navigation, visibleItems.length]);

  const specials = useMemo(() => sharedMenuItems.filter((item) => item.isSpecial && item.isAvailable), [sharedMenuItems]);
  const firstName = user?.name?.split(' ')[0] || 'Guest';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // ===== FAVOURITE FUNCTION =====
  const toggleFavourite = useCallback((id) => {
    setFavourites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }, []);
  // ===== ADD TO CART FUNCTION =====
  const handleAdd = useCallback((item) => addItem(item), [addItem]);
  // ===== FOOD CARD: MenuItemCard.js =====
  const renderMenuItem = useCallback(({ item, index }) => (
    <MenuItemCard item={item} index={index} onAdd={handleAdd} onToggleFavourite={toggleFavourite} isFavourite={favourites.includes(item.id)} />
  ), [favourites, handleAdd, toggleFavourite]);
  const selectSpecial = (item) => {
    setCategory('All');
    setSearch(item.name);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };
  const clearSearch = () => {
    setSearch('');
    searchInputRef.current?.focus();
  };
  // ===== REFRESH MENU =====
  const refresh = async () => {
    setRefreshing(true);
    try { await refetch(); } catch { /* useApi displays the request error. */ }
    finally { setRefreshing(false); }
  };
  const retryLoad = () => refetch().catch(() => {});

  // ===== MENU LOADING =====
  if (isLoading) {
    // ===== MAIN DISPLAY =====
    return (
      <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.loadingState}>
          <View style={[styles.loadingIcon, { backgroundColor: colors.surfaceMuted }]}>
            <Ionicons name='restaurant' size={34} color={colors.primary} />
          </View>
          <ActivityIndicator size='large' color={colors.primary} />
          <Text style={[styles.loadingTitle, { color: colors.text }]}>Loading our menu…</Text>
          <Text style={[styles.loadingMessage, { color: colors.secondaryText }]}>Fresh dishes are being prepared for you.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ===== MENU ERROR =====
  if (error) {
    // ===== MAIN DISPLAY =====
    return (
      <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <EmptyState
          icon='alert-circle-outline'
          title='Unable to load menu'
          message={error}
          actionLabel='Retry'
          onAction={retryLoad}
        />
      </SafeAreaView>
    );
  }

  const header = (
    <FadeSlideView>
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <View pointerEvents='none' style={[styles.heroGlow, { backgroundColor: colors.accent }]} />
        <View style={styles.heroTop}>
          <View style={styles.brandRow}>
            <View style={styles.restaurantMark}><Ionicons name='restaurant' size={22} color={colors.primary} /></View>
            <View>
              <Text style={styles.greeting}>{greeting}, {firstName}</Text>
              <Text style={styles.eyebrow}>{BRAND_NAME.toUpperCase()}</Text>
            </View>
          </View>
          <ScalePressable accessibilityLabel='Open cart' onPress={() => navigation.navigate('Cart')} style={styles.cartShortcut}>
            <Ionicons name='cart-outline' size={24} color='#FFFFFF' />
            {itemCount ? <View style={styles.cartBadge}><Text style={[styles.cartBadgeText, { color: colors.primary }]}>{itemCount > 99 ? '99+' : itemCount}</Text></View> : null}
          </ScalePressable>
        </View>
        <Text style={styles.heroTitle}>What are you craving today?</Text>
        <Text style={styles.heroText}>Thoughtful flavours and cafe favourites, prepared fresh for you.</Text>
        {/* ===== SEARCH BAR ===== */}
        <View style={[styles.searchShell, { backgroundColor: colors.surface }]}>
          <Pressable accessibilityLabel='Focus menu search' onPress={() => searchInputRef.current?.focus()} hitSlop={8}>
            <Ionicons name='search' size={21} color={colors.primary} />
          </Pressable>
          <TextInput
            ref={searchInputRef}
            value={search}
            onChangeText={setSearch}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder='Search dishes or ingredients'
            placeholderTextColor={colors.secondaryText}
            returnKeyType='search'
            style={[styles.searchInput, { color: colors.text }]}
          />
          {search ? <Pressable onPress={clearSearch} hitSlop={8}><Ionicons name='close-circle' size={21} color={colors.secondaryText} /></Pressable> : null}
        </View>
      </View>

      {specials.length ? (
        <View style={styles.specialsSection}>
          <View style={styles.specialsHeading}>
            <View style={styles.specialsTitleRow}><Ionicons name='star' size={18} color={colors.warning} /><Text style={[styles.specialsTitle, { color: colors.text }]}>Today’s specials</Text></View>
            <Text style={[styles.specialsHint, { color: colors.secondaryText }]}>Chef’s picks</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.specialsRow}>
            {specials.map((item) => <SpecialTile key={item.id} item={item} colors={colors} onPress={() => selectSpecial(item)} />)}
          </ScrollView>
        </View>
      ) : null}

      {isSearchFocused && !search && recentSearches.length ? (
        <View style={styles.recents}>
          <Text style={[styles.metaLabel, { color: colors.secondaryText }]}>RECENT</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentSearches.map((item) => (
              <Pressable key={item} onPress={() => setSearch(item)} style={[styles.recentChip, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <Ionicons name='time-outline' size={13} color={colors.secondaryText} />
                <Text style={[styles.recentText, { color: colors.text }]}>{item}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* ===== CATEGORY FILTER ===== */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {MENU_CATEGORIES.map((item) => <CategoryChip key={item} label={item} icon={CATEGORY_ICONS[item]} selected={category === item} onPress={() => setCategory(item)} />)}
      </ScrollView>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Our menu</Text>
          <Text style={[styles.resultText, { color: colors.secondaryText }]}>{visibleItems.length} dishes ready to explore</Text>
        </View>
        <Pressable accessibilityLabel='Refresh menu' disabled={loading} onPress={refresh}><Ionicons name='refresh-outline' size={22} color={colors.primary} /></Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
        {SORT_OPTIONS.map((item) => {
          const selected = sort === item;
          // ===== MAIN DISPLAY =====
          return (
            <Pressable key={item} onPress={() => setSort(item)} style={[styles.sortChip, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.surfaceMuted : colors.surface }]}>
              <Text style={{ color: selected ? colors.primary : colors.secondaryText, fontWeight: '700', fontSize: 12 }}>{item}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </FadeSlideView>
  );

  // ===== MAIN DISPLAY =====
  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* ===== FOOD ITEM LIST ===== */}
      <FlatList
        ref={listRef}
        data={visibleItems}
        keyExtractor={(item) => item.id}
        renderItem={renderMenuItem}
        ListHeaderComponent={header}
        ListEmptyComponent={<EmptyState icon='search-outline' title='No dishes found' message='Try a different search, category, or show all favourites.' actionLabel='Clear filters' onAction={() => { setSearch(''); setCategory('All'); setSort('Featured'); }} />}
        contentContainerStyle={visibleItems.length ? styles.listContent : styles.emptyContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} colors={[colors.primary]} />}
        onScroll={(event) => setShowBackToTop(event.nativeEvent.contentOffset.y > 300)}
        scrollEventThrottle={100}
        keyboardShouldPersistTaps='handled'
        initialNumToRender={4}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        windowSize={7}
      />
      {showBackToTop ? (
        <ScalePressable accessibilityLabel='Back to top' onPress={() => listRef.current?.scrollToOffset({ offset: 0 })} style={[styles.topButton, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}>
          <Ionicons name='arrow-up' size={22} color='#FFFFFF' />
        </ScalePressable>
      ) : null}
    </SafeAreaView>
  );
}

function SpecialTile({ item, colors, onPress }) {
  // ===== LOCAL STATE =====
  const [imageFailed, setImageFailed] = useState(false);
  // ===== MAIN DISPLAY =====
  return (
    <ScalePressable onPress={onPress} style={[styles.specialCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
      <View style={[styles.specialImageWrap, { backgroundColor: colors.surfaceMuted }]}>
        {item.image && !imageFailed ? (
          <Image source={item.image} style={styles.specialImage} resizeMode='cover' resizeMethod='resize' fadeDuration={120} onError={() => setImageFailed(true)} />
        ) : (
          <Ionicons name={item.icon || 'restaurant'} size={34} color={colors.primary} />
        )}
        <View style={styles.specialStar}><Ionicons name='star' size={12} color='#FFFFFF' /></View>
      </View>
      <View style={styles.specialBody}>
        <View style={styles.specialCopy}>
          <Text numberOfLines={1} style={[styles.specialName, { color: colors.text }]}>{item.name}</Text>
          {/* ===== FOOD PRICE: SPECIAL TILE ===== */}
          <Text style={[styles.specialPrice, { color: colors.primary }]}>{formatCurrency(item.price)}</Text>
        </View>
        <Ionicons name='chevron-forward' size={18} color={colors.secondaryText} />
      </View>
    </ScalePressable>
  );
}

// ===== SCREEN DESIGN / STYLES =====
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  loadingIcon: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  loadingTitle: { fontSize: 19, fontWeight: '900', marginTop: 14 },
  loadingMessage: { fontSize: 13, textAlign: 'center', marginTop: 5 },
  listContent: { paddingBottom: 24 },
  emptyContent: { flexGrow: 1 },
  hero: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  heroGlow: { position: 'absolute', width: 180, height: 180, borderRadius: 90, top: -104, right: -48, opacity: 0.18 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  restaurantMark: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  greeting: { color: '#FFE9DF', fontSize: 12, fontWeight: '700' },
  eyebrow: { color: '#FFFFFF', fontSize: 9, fontWeight: '900', letterSpacing: 1.05, marginTop: 2 },
  cartShortcut: { width: 45, height: 45, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.17)' },
  cartBadge: { position: 'absolute', top: -5, right: -5, minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  cartBadgeText: { fontSize: 9, fontWeight: '900' },
  heroTitle: { color: '#FFFFFF', fontSize: 27, fontWeight: '900', marginTop: 20, letterSpacing: -0.6 },
  heroText: { color: '#FFE9DF', fontSize: 13, marginTop: 4, marginBottom: 17 },
  searchShell: { minHeight: 50, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 9, elevation: 3 },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 12 },
  specialsSection: { paddingTop: 19 },
  specialsHeading: { paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  specialsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  specialsTitle: { fontSize: 18, fontWeight: '900' },
  specialsHint: { fontSize: 11, fontWeight: '700' },
  specialsRow: { paddingHorizontal: 16, paddingTop: 11, paddingBottom: 2 },
  specialCard: { width: 226, borderWidth: 1, borderRadius: 18, overflow: 'hidden', marginRight: 11, elevation: 3, shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  specialImageWrap: { height: 106, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  specialImage: { width: '100%', height: 106 },
  specialStar: { position: 'absolute', top: 8, left: 8, width: 27, height: 27, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(228,87,46,0.92)' },
  specialBody: { padding: 11, flexDirection: 'row', alignItems: 'center' },
  specialCopy: { flex: 1 },
  specialName: { fontSize: 13, fontWeight: '900' },
  specialPrice: { fontSize: 12, fontWeight: '900', marginTop: 3 },
  recents: { paddingHorizontal: 16, paddingTop: 15 },
  metaLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 7 },
  recentChip: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7, marginRight: 8, flexDirection: 'row', alignItems: 'center', gap: 5 },
  recentText: { fontSize: 12, fontWeight: '600' },
  chipRow: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 17, paddingTop: 9 },
  sectionTitle: { fontSize: 22, fontWeight: '900' },
  resultText: { fontSize: 12, marginTop: 2 },
  sortRow: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14 },
  sortChip: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 },
  topButton: { position: 'absolute', right: 18, bottom: 18, width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowOpacity: 0.22, shadowRadius: 7, shadowOffset: { width: 0, height: 3 } },
});
