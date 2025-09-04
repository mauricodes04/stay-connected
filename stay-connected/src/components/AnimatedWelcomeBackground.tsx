/*
If missing, add dependencies:
- pnpm add moti react-native-reanimated expo-image expo-linear-gradient
*/

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Platform, AccessibilityInfo, Image as RNImage, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming, runOnJS } from 'react-native-reanimated';

// Types
export type ParallaxMultipliers = {
  sky: number;
  mid: number;
  fg: number;
};

export type SpriteSheetMeta = {
  /** total number of frames in the sheet */
  frameCount: number;
  /** width of a single frame in px */
  frameWidth: number;
  /** height of a single frame in px */
  frameHeight: number;
  /** optional columns if sheet is a grid (not used in simple row-based) */
  columns?: number;
};

export type AnimatedWelcomeAssets = {
  sky?: any; // ImageSourcePropType
  mid?: any;
  fg?: any;
  character?: any; // sprite sheet or single frame
  characterSpriteMeta?: SpriteSheetMeta; // optional
};

export interface AnimatedWelcomeBackgroundProps {
  /** Total loop length for one complete parallax cycle. Default 8000ms. */
  durationMs?: number; // 6000..10000
  /** Multipliers relative to camera pan distance. Default { sky:0.2, mid:0.6, fg:1.0 } */
  parallax?: ParallaxMultipliers;
  /** Horizontal world speed for character advance (px/s). Default 60. */
  characterSpeed?: number; // 30..120
  /** Asset bundle. If missing, sky falls back to gradient. */
  assets?: AnimatedWelcomeAssets;
  /** Disables animations when true, or when OS prefers-reduced-motion if undefined and detected. */
  reducedMotion?: boolean;
}

/**
 * AnimatedWelcomeBackground
 * Scenic, loopable parallax hero background with walking character.
 * - Uses dual-sprite wrapping per layer to avoid seams
 * - Seamless loop using a shared 0→1 progress value over durationMs
 * - Reduced-motion shows static first frame
 */
const AnimatedWelcomeBackground: React.FC<AnimatedWelcomeBackgroundProps> = ({
  durationMs = 8000,
  parallax = { sky: 0.2, mid: 0.6, fg: 1.0 },
  characterSpeed = 60,
  assets,
  reducedMotion,
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Detect prefers-reduced-motion (fallback for web + native)
  const [osReducedMotion, setOsReducedMotion] = useState<boolean | null>(null);
  useEffect(() => {
    let mounted = true;
    if (reducedMotion === undefined) {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'matchMedia' in window) {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handler = () => mounted && setOsReducedMotion(mq.matches);
        handler();
        mq.addEventListener?.('change', handler);
        return () => mq.removeEventListener?.('change', handler);
      } else {
        AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
          if (mounted) setOsReducedMotion(enabled);
        });
        const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (enabled: boolean) => {
          if (mounted) setOsReducedMotion(enabled);
        });
        return () => {
          // @ts-expect-error RN versions differ
          sub?.remove?.();
        };
      }
    }
    return () => {
      mounted = false;
    };
  }, [reducedMotion]);

  const isReduced = reducedMotion ?? (osReducedMotion ?? false);

  // Shared progress 0→1 over durationMs, loops hard
  const progress = useSharedValue(0);
  useEffect(() => {
    if (isReduced) {
      progress.value = 0; // freeze
      return;
    }
    // restart loop when duration changes
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, { duration: durationMs, easing: Easing.linear }),
      -1,
      false
    );
  }, [durationMs, isReduced]);

  // Prefetch assets (URIs) to avoid flicker; begin loop after load (best-effort)
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const uris: string[] = [];
    const pushIfUri = (src?: any) => {
      if (!src) return;
      if (typeof src === 'string') uris.push(src);
      else if (src?.uri) uris.push(src.uri);
    };
    pushIfUri(assets?.sky);
    pushIfUri(assets?.mid);
    pushIfUri(assets?.fg);
    pushIfUri(assets?.character);
    if (uris.length === 0) {
      setReady(true);
      return;
    }
    Promise.all(
      uris.map((u) => (typeof u === 'string' ? RNImage.prefetch(u) : Promise.resolve(true)))
    )
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [assets]);

  // Container + tiling metrics
  const overscan = { sky: 40, mid: 60, fg: 80 };

  const tileWidth = useMemo(() => ({
    sky: Math.ceil(windowWidth + overscan.sky),
    mid: Math.ceil(windowWidth + overscan.mid),
    fg: Math.ceil(windowWidth + overscan.fg),
  }), [windowWidth]);

  const layerDistance = useMemo(() => ({
    // distance each layer travels over one loop
    sky: windowWidth * (parallax.sky ?? 0.2),
    mid: windowWidth * (parallax.mid ?? 0.6),
    fg: windowWidth * (parallax.fg ?? 1.0),
  }), [windowWidth, parallax]);

  // Helper to compute animated X position for a wrapping layer
  const makeWrapStyle = (id: 'sky' | 'mid' | 'fg', offset: number) => {
    const widthPx = tileWidth[id];
    const distance = layerDistance[id];
    return useAnimatedStyle(() => {
      // translate ranges from 0 to -distance, then we place two tiles offset by widthPx
      const xRaw = -progress.value * distance;
      // wrap into [-(widthPx), 0] space. Using modulo-like behavior by adding big multiple
      const base = ((xRaw % widthPx) + widthPx) % widthPx; // 0..widthPx
      const x = Math.round(base) - widthPx + offset; // shift into negative space and add offset
      return { transform: [{ translateX: x }] };
    }, [widthPx, distance, offset]);
  };

  // Character bobbing and slight rightward translate synced with progress
  const characterStyle = useAnimatedStyle(() => {
    if (isReduced) return { transform: [{ translateY: 0 }, { translateX: 0 }] };
    // vertical bob: gentle sine-ish via progress
    const twoPi = Math.PI * 2;
    const y = Math.round(Math.sin(progress.value * twoPi) * 4); // ±4px
    // rightward drift synced to progress but small since camera follows
    const x = Math.round(progress.value * (windowWidth * 0.02)); // up to 2% width
    return { transform: [{ translateY: y }, { translateX: x }] };
  }, [windowWidth, isReduced]);

  // Accessibility
  const a11y = {
    accessible: true,
    accessibilityRole: 'image' as const,
    accessibilityLabel: 'Scenic animated background',
    accessibilityHint: 'Looped parallax landscape with a walking figure',
    importantForAccessibility: 'no-hide-descendants' as const,
  };

  // Render helpers
  const renderSky = () => {
    if (assets?.sky) {
      const a = makeWrapStyle('sky', 0);
      const b = makeWrapStyle('sky', tileWidth.sky);
      return (
        <>
          <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, width: tileWidth.sky }, a]}>
            <Image
              testID="layer-sky"
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              source={assets.sky}
              cachePolicy="memory-disk"
              accessible={false}
            />
          </Animated.View>
          <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, width: tileWidth.sky }, b]}>
            <Image
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              source={assets.sky}
              cachePolicy="memory-disk"
              accessible={false}
            />
          </Animated.View>
        </>
      );
    }
    // Fallback gradient sky
    return (
      <LinearGradient
        testID="layer-sky"
        colors={['#a9cbe3', '#eef6fb']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
      />
    );
  };

  const renderMid = () => {
    if (!assets?.mid) return null;
    const a = makeWrapStyle('mid', 0);
    const b = makeWrapStyle('mid', tileWidth.mid);
    return (
      <>
        <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, width: tileWidth.mid }, a]}>
          <Image
            testID="layer-mid"
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            source={assets.mid}
            cachePolicy="memory-disk"
            accessible={false}
          />
        </Animated.View>
        <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, width: tileWidth.mid }, b]}>
          <Image
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            source={assets.mid}
            cachePolicy="memory-disk"
            accessible={false}
          />
        </Animated.View>
      </>
    );
  };

  const renderFg = () => {
    if (!assets?.fg) return null;
    const a = makeWrapStyle('fg', 0);
    const b = makeWrapStyle('fg', tileWidth.fg);
    return (
      <>
        <Animated.View style={[{ position: 'absolute', bottom: 0, height: Math.ceil(windowHeight * 0.35), width: tileWidth.fg }, a]}>
          <Image
            testID="layer-fg"
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            source={assets.fg}
            cachePolicy="memory-disk"
            accessible={false}
          />
        </Animated.View>
        <Animated.View style={[{ position: 'absolute', bottom: 0, height: Math.ceil(windowHeight * 0.35), width: tileWidth.fg }, b]}>
          <Image
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            source={assets.fg}
            cachePolicy="memory-disk"
            accessible={false}
          />
        </Animated.View>
      </>
    );
  };

  const renderCharacter = () => {
    if (!assets?.character) return null;
    // For now: single frame with bob. Sprite sheet metadata could be used to animate frames in the future.
    return (
      <Animated.View
        testID="layer-character"
        style={[{
          position: 'absolute',
          bottom: 0,
          left: windowWidth * 0.5 - 40, // roughly center; width assumed ~80
          width: 80,
          height: 120,
        }, characterStyle]}
      >
        <Image
          style={{ width: '100%', height: '100%' }}
          contentFit="contain"
          source={assets.character}
          cachePolicy="memory-disk"
          accessible={false}
        />
        {/* subtle shadow */}
        <View
          style={{
            position: 'absolute',
            bottom: 6,
            left: '20%',
            right: '20%',
            height: 10,
            borderRadius: 999,
            backgroundColor: 'black',
            opacity: 0.15,
          }}
          pointerEvents="none"
        />
      </Animated.View>
    );
  };

  // Container classes per spec: absolute inset-0 overflow-hidden bg-[#a9cbe3]
  return (
    <View
      className="absolute inset-0 overflow-hidden bg-[#a9cbe3]"
      style={{ zIndex: 0 }}
      {...a11y}
    >
      {/* Sky (zIndex 0) */}
      <View style={{ position: 'absolute', inset: 0 as any, zIndex: 0 }}>{renderSky()}</View>
      {/* Mid (zIndex 1) */}
      <View style={{ position: 'absolute', inset: 0 as any, zIndex: 1 }}>{renderMid()}</View>
      {/* Foreground (zIndex 2) */}
      <View style={{ position: 'absolute', inset: 0 as any, zIndex: 2 }}>{renderFg()}</View>
      {/* Character (zIndex 3) */}
      <View style={{ position: 'absolute', inset: 0 as any, zIndex: 3 }}>{renderCharacter()}</View>
    </View>
  );
};

export default AnimatedWelcomeBackground;

/*
Playbook
- How to swap assets:
  Pass the `assets` prop with { sky, mid, fg, character }. Use seamless horizontal textures. Example:
  <AnimatedWelcomeBackground assets={{ sky: require('../assets/sky.png'), mid: { uri: 'https://...' }, fg: ..., character: ... }} />

- How to change loop duration & parallax:
  Control `durationMs` (e.g., 9000) and `parallax` multipliers (e.g., { sky: 0.15, mid: 0.55, fg: 0.95 }).

- How to enable reduced motion:
  Set `reducedMotion` to true, or rely on OS setting (prefers-reduced-motion). The component freezes layers at X=0 and shows the first character frame only.
*/
