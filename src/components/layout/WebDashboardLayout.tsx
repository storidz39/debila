import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Platform, useWindowDimensions, Pressable } from "react-native";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { colors, spacing } from "../../theme";

interface Props {
  children: React.ReactNode;
}

export function WebDashboardLayout({ children }: Props) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // On mobile native, we might just return the children
  if (Platform.OS !== "web" && Platform.OS !== "windows" && Platform.OS !== "macos") {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      {isMobile && sidebarOpen && (
        <Pressable style={styles.mobileOverlay} onPress={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar Container */}
      <View style={isMobile ? [styles.mobileSidebarContainer, !sidebarOpen && { display: 'none' }] : styles.desktopSidebarContainer}>
        <Sidebar />
      </View>

      {/* Main Content Area - Header + Body (Left) */}
      <View style={styles.mainWrapper}>
        <Header 
          title={children ? (children as any).props?.title || "" : ""} 
          onMenuPress={isMobile ? () => setSidebarOpen(!sidebarOpen) : undefined}
        />
        <ScrollView 
          style={styles.scrollArea} 
          contentContainerStyle={[
            styles.content,
            Platform.OS === 'web' && { paddingHorizontal: width < 768 ? 10 : spacing.xl }
          ]}
          showsVerticalScrollIndicator={true}
        >
          {children}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row", // In a dir="rtl" document, "row" works correctly (Sidebar on right)
    backgroundColor: colors.background,
  },
  mainWrapper: {
    flex: 1,
    height: "100%",
    backgroundColor: colors.background,
  },
  scrollArea: {
    flex: 1,
  },
  content: {
    paddingVertical: spacing.xl,
    minHeight: "100%",
  },
  desktopSidebarContainer: {
    height: "100%",
  },
  mobileSidebarContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 9999,
    width: 280,
    backgroundColor: '#fff',
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  mobileOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 9998,
  },
});
