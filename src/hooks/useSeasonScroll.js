import { useRef, useState, useCallback } from "react";

export function useSeasonScroll() {
  const seasonBarRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const contentWidthRef = useRef(0);
  const containerWidthRef = useRef(0);
  const scrollXRef = useRef(0);

  const recomputeArrows = useCallback(() => {
    const scrollX = scrollXRef.current;
    const containerWidth = containerWidthRef.current;
    const contentWidth = contentWidthRef.current;
    setCanScrollLeft(scrollX > 0);
    setCanScrollRight(Math.round(scrollX + containerWidth) < contentWidth - 1);
  }, []);

  const handleScroll = useCallback(
    (e) => {
      scrollXRef.current = e.nativeEvent.contentOffset.x;
      recomputeArrows();
    },
    [recomputeArrows]
  );

  const handleContentSizeChange = useCallback(
    (contentWidth) => {
      contentWidthRef.current = contentWidth;
      recomputeArrows();
    },
    [recomputeArrows]
  );

  const handleLayout = useCallback(
    (e) => {
      containerWidthRef.current = e.nativeEvent.layout.width;
      recomputeArrows();
    },
    [recomputeArrows]
  );

  // checkScroll kept for API-compatibility with previous callers; RN drives
  // the arrow-visibility state reactively via onScroll/onContentSizeChange
  // above instead of an imperative re-measure.
  const checkScroll = recomputeArrows;

  const scrollSeasons = useCallback((direction) => {
    if (seasonBarRef.current) {
      const scrollAmount = 300;
      const nextX = Math.max(0, scrollXRef.current + (direction === "left" ? -scrollAmount : scrollAmount));
      seasonBarRef.current.scrollTo({ x: nextX, animated: true });
    }
  }, []);

  return {
    seasonBarRef,
    canScrollLeft,
    canScrollRight,
    checkScroll,
    scrollSeasons,
    handleScroll,
    handleContentSizeChange,
    handleLayout,
  };
}
