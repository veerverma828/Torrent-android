import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { ArrowRight, Search, X } from "lucide-react-native";
import { useSearchContext } from "../../context/AppContext.jsx";
import { useSettingsContext } from "../../context/SettingsContext.jsx";
import { useSearch } from "../../hooks/useSearch.js";
import { theme } from "../../styles/theme.js";

export default function SearchBar() {
  const { query, setQuery } = useSearchContext();
  const { imdbMode, useJackett, autoSearch } = useSettingsContext();
  const { searchContent, searchTorrents } = useSearch();

  const placeholder = imdbMode
    ? "Enter IMDb ID (e.g. tt10872600)"
    : useJackett
      ? "Search torrents..."
      : "Search movies or series...";

  const runSearch = useJackett || imdbMode ? searchTorrents : searchContent;

  const handleSubmit = () => {
    if (!autoSearch) runSearch();
  };

  const hasQuery = query.trim().length > 0;

  return (
    <View style={styles.wrapper}>
      <View style={styles.inputContainer}>
        <Search size={18} color={theme.colors.textMuted} style={styles.searchIcon} />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSubmit}
          style={[styles.input, { paddingRight: hasQuery ? 80 : 44 }]}
        />
        {hasQuery && (
          <TouchableOpacity
            accessibilityLabel="Clear search"
            onPress={() => setQuery("")}
            style={styles.clearButton}
          >
            <X size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          accessibilityLabel="Search"
          onPress={runSearch}
          disabled={!hasQuery}
          style={[styles.searchButton, hasQuery ? styles.searchButtonActive : styles.searchButtonDisabled]}
        >
          <ArrowRight size={18} color={hasQuery ? "#fff" : theme.colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 8,
  },
  inputContainer: {
    position: "relative",
    width: "100%",
    maxWidth: 500,
    justifyContent: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 16,
    zIndex: 1,
  },
  input: {
    height: 46,
    fontSize: 16,
    paddingLeft: 44,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  clearButton: {
    position: "absolute",
    right: 44,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButton: {
    position: "absolute",
    right: 6,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonActive: {
    backgroundColor: theme.colors.accent,
  },
  searchButtonDisabled: {
    backgroundColor: theme.colors.surface,
  },
});
