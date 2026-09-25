import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryChip from '../components/CategoryChip';
import EmptyState from '../components/EmptyState';
import MenuItemCard from '../components/MenuItemCard';
import { useCart } from '../context/CartContext';
import { useRestaurant } from '../context/RestaurantContext';
import { useTheme } from '../context/ThemeContext';
import { MENU_CATEGORIES } from '../data/menu';
import { useDebounce } from '../hooks/useDebounce';

const SORT_OPTIONS = ['Featured', 'Price: Low', 'Price: High', 'Favourites'];

export default function MenuScreen() {
  const { colors } = useTheme();
  const { menuItems } = useRestaurant();
  const { addItem } = useCart();
  const searchInputRef = useRef(null);
  const listRef = useRef(null);
  const renderCount = useRef(0);
  const refreshTimerRef = useRef(null);
  renderCount.current += 1;

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('Featured');
  const [favourites, setFavourites] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const debouncedSearch = useDebounce(search.trim(), 350);

  useEffect(() => {
    if (debouncedSearch.length < 2) return;
    setRecentSearches((current) => [
      debouncedSearch,
      ...current.filter((item) => item.toLowerCase() !== debouncedSearch.toLowerCase()),
    ].slice(0, 5));
  }, [debouncedSearch]);

  useEffect(() => () => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
  }, []);

  const visibleItems = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    const result = menuItems.filter((item) => {
      const matchesCategory = category === 'All' || item.category === category;
      const matchesSearch = !query || item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
    if (sort === 'Favourites') return result.filter((item) => favourites.includes(item.id));
    if (sort === 'Price: Low') return [...result].sort((a, b) => a.price - b.price);
    if (sort === 'Price: High') return [...result].sort((a, b) => b.price - a.price);
    return [...result].sort((a, b) => Number(b.isSpecial) - Number(a.isSpecial));
  }, [category, debouncedSearch, favourites, menuItems, sort]);

  const toggleFavourite = useCallback((id) => {
    setFavourites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }, []);
  const handleAdd = useCallback((item) => addItem(item), [addItem]);
  const clearSearch = () => {
    setSearch('');
    searchInputRef.current?.focus();
  };
  const refresh = () => {
    setRefreshing(true);
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => setRefreshing(false), 700);
  };

  const header = (
    <View>
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <Text style={styles.eyebrow}>SAFFRON TABLE</Text>
        <Text style={styles.heroTitle}>What are you craving?</Text>
        <Text style={styles.heroText}>Freshly prepared favourites, ready for your table.</Text>
        <View style={[styles.searchShell, { backgroundColor: colors.surface }]}>
          <Ionicons name='search' size={21} color={colors.secondaryText} />
          <TextInput
            ref={searchInputRef}
            value={search}
            onChangeText={setSearch}
            placeholder='Search dishes or ingredients'
            placeholderTextColor={colors.secondaryText}
            returnKeyType='search'
            style={[styles.searchInput, { color: colors.text }]}
          />
          {search ? <Pressable onPress={clearSearch} hitSlop={8}><Ionicons name='close-circle' size={21} color={colors.secondaryText} /></Pressable> : null}
        </View>
        <Pressable onPress={() => searchInputRef.current?.focus()} style={styles.focusLink}>
          <Ionicons name='locate-outline' size={15} color='#FFFFFF' />
          <Text style={styles.focusText}>Focus search</Text>
        </Pressable>
      </View>

      {recentSearches.length ? (
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

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {MENU_CATEGORIES.map((item) => <CategoryChip key={item} label={item} selected={category === item} onPress={() => setCategory(item)} />)}
      </ScrollView>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Our menu</Text>
          <Text style={[styles.resultText, { color: colors.secondaryText }]}>{visibleItems.length} dishes · render {renderCount.current}</Text>
        </View>
        <Ionicons name='options-outline' size={22} color={colors.primary} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
        {SORT_OPTIONS.map((item) => {
          const selected = sort === item;
          return (
            <Pressable key={item} onPress={() => setSort(item)} style={[styles.sortChip, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.surfaceMuted : colors.surface }]}>
              <Text style={{ color: selected ? colors.primary : colors.secondaryText, fontWeight: '700', fontSize: 12 }}>{item}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <FlatList
        ref={listRef}
        data={visibleItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MenuItemCard item={item} onAdd={handleAdd} onToggleFavourite={toggleFavourite} isFavourite={favourites.includes(item.id)} />}
        ListHeaderComponent={header}
        ListEmptyComponent={<EmptyState icon='search-outline' title='No dishes found' message='Try a different search, category, or show all favourites.' actionLabel='Clear filters' onAction={() => { setSearch(''); setCategory('All'); setSort('Featured'); }} />}
        contentContainerStyle={visibleItems.length ? styles.listContent : styles.emptyContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} colors={[colors.primary]} />}
        onScroll={(event) => setShowBackToTop(event.nativeEvent.contentOffset.y > 520)}
        scrollEventThrottle={100}
        keyboardShouldPersistTaps='handled'
      />
      {showBackToTop ? (
        <Pressable accessibilityLabel='Back to top' onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })} style={[styles.topButton, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}>
          <Ionicons name='arrow-up' size={22} color='#FFFFFF' />
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  listContent: { paddingBottom: 24 },
  emptyContent: { flexGrow: 1 },
  hero: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 16, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  eyebrow: { color: '#FFE9DF', fontSize: 11, fontWeight: '900', letterSpacing: 1.8 },
  heroTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', marginTop: 5, letterSpacing: -0.6 },
  heroText: { color: '#FFE9DF', fontSize: 13, marginTop: 4, marginBottom: 17 },
  searchShell: { minHeight: 50, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 9, elevation: 3 },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 12 },
  focusLink: { alignSelf: 'flex-end', flexDirection: 'row', gap: 5, alignItems: 'center', paddingTop: 10, paddingHorizontal: 3 },
  focusText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
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
