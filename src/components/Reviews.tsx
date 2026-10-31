import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, Easing, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useI18n } from "../i18n";
import { ApiError, type Review } from "../lib/api";
import { pick, useLayout } from "../lib/layout";
import { useReviews } from "../lib/reviews";
import { colors, fonts, radius, shadow } from "../theme";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { Button, SectionHeader, Stars, T } from "./ui";

const NATIVE = Platform.OS !== "web";
const AVATARS: readonly [string, string][] = [
  ["#0FA3A3", "#0B5C8A"],
  ["#2BB6A3", "#1E7F9A"],
  ["#4B8BD8", "#2C5EA8"],
  ["#17A58B", "#0E7C6B"],
  ["#5C7CFA", "#3B5BDB"],
];

function relativeTime(iso: string, s: ReturnType<typeof useI18n>["s"], fmt: ReturnType<typeof useI18n>["fmt"], lang: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return s.time.now;
  if (min < 60) return fmt(s.time.minutes, { n: min });
  const h = Math.floor(min / 60);
  if (h < 24) return h === 1 ? s.time.hourOne : fmt(s.time.hours, { n: h });
  const d = Math.floor(h / 24);
  if (d < 30) return d === 1 ? s.time.dayOne : fmt(s.time.days, { n: d });
  return new Date(iso).toLocaleDateString(lang === "sq" ? "sq-AL" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function Reviews() {
  const { s, fmt } = useI18n();
  const { isWide, bp, contentWidth } = useLayout();
  const { reviews, stats, status, reload, canRetry } = useReviews();
  const [expanded, setExpanded] = useState(false);
  const limit = isWide ? 6 : 3;
  const shown = expanded ? reviews : reviews.slice(0, limit);
  const leftW = isWide ? Math.min(430, contentWidth * 0.4) : contentWidth;

  const distribution = useMemo(() => {
    const d = [0, 0, 0, 0, 0];
    reviews.forEach((r) => (d[r.rating - 1] += 1));
    return d;
  }, [reviews]);

  return (
    <Section id="reviews" bg={colors.bg}>
      <Reveal>
        <SectionHeader eyebrow={s.reviews.eyebrow} title={s.reviews.title} subtitle={s.reviews.subtitle} />
      </Reveal>

      <View style={{ flexDirection: isWide ? "row" : "column", gap: pick(bp, { phone: 20, tablet: 28, desktop: 36 }), marginTop: 34, alignItems: "flex-start" }}>
        <View style={{ width: leftW, gap: 20 }}>
          <Reveal>
            <Summary average={stats.average} count={stats.count} distribution={distribution} loading={status === "loading"} />
          </Reveal>
          <Reveal delay={80}>
            <ReviewForm />
          </Reveal>
        </View>

        <View style={{ flex: isWide ? 1 : undefined, width: isWide ? undefined : "100%", gap: 14 }}>
          {status === "offline" ? (
            <Reveal>
              <View style={styles.offline} testID="reviews-offline">
                <Ionicons name="cloud-offline" size={22} color="#9A5B00" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.offlineTitle}>{s.reviews.offlineTitle}</Text>
                  <Text style={styles.offlineText}>{s.reviews.offlineText}</Text>
                </View>
                <Pressable onPress={() => void reload()} style={styles.retry} accessibilityRole="button">
                  <Ionicons name="refresh" size={15} color="#9A5B00" />
                  <Text style={styles.retryText}>{s.reviews.retry}</Text>
                </Pressable>
              </View>
            </Reveal>
          ) : null}

          {status === "local" ? (
            <Reveal>
              <View style={styles.localNote} testID="reviews-local">
                <Ionicons name="information-circle" size={22} color={colors.tealDark} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.localTitle}>{s.reviews.localTitle}</Text>
                  <Text style={styles.localText}>{s.reviews.localText}</Text>
                </View>
                {canRetry ? (
                  <Pressable onPress={() => void reload()} style={styles.localRetry} accessibilityRole="button">
                    <Ionicons name="refresh" size={15} color={colors.tealDark} />
                    <Text style={styles.localRetryText}>{s.reviews.retry}</Text>
                  </Pressable>
                ) : null}
              </View>
            </Reveal>
          ) : null}

          {status === "loading" ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.tealDark} />
              <T variant="small">{s.reviews.loading}</T>
            </View>
          ) : null}

          {status !== "loading" && reviews.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={34} color={colors.teal} />
              <T align="center">{s.reviews.empty}</T>
            </View>
          ) : null}

          <View testID="review-list" style={{ gap: 14 }}>
            {shown.map((r, i) => (
              <Reveal key={r.id} delay={Math.min(i, 4) * 70}>
                <ReviewCard review={r} />
              </Reveal>
            ))}
          </View>

          {reviews.length > limit ? (
            <Button label={expanded ? s.reviews.showLess : s.reviews.showMore} variant="outline" onPress={() => setExpanded((v) => !v)} />
          ) : null}
        </View>
      </View>
    </Section>
  );
}

function Summary({ average, count, distribution, loading }: { average: number; count: number; distribution: number[]; loading: boolean }) {
  const { s, fmt } = useI18n();
  const total = distribution.reduce((a, b) => a + b, 0) || 1;
  return (
    <View style={styles.summary}>
      <View style={{ alignItems: "center", gap: 6, minWidth: 96 }}>
        <Text style={styles.avg} testID="avg-rating">
          {loading || count === 0 ? "–" : average.toFixed(1)}
        </Text>
        <Stars value={average} size={16} />
        <Text style={styles.avgSub} testID="review-count">
          {count === 1 ? s.reviews.countOne : fmt(s.reviews.count, { n: count })}
        </Text>
      </View>
      <View style={{ flex: 1, gap: 6 }}>
        {[5, 4, 3, 2, 1].map((star) => (
          <View key={star} style={styles.barRow}>
            <Text style={styles.barLabel}>{star}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${(distribution[star - 1] / total) * 100}%` }]} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function ReviewCard({ review }: { review: Review }) {
  const { s, fmt, lang } = useI18n();
  const colorsPair = AVATARS[(review.name.charCodeAt(0) + review.name.length) % AVATARS.length];
  return (
    <View style={styles.card} testID="review-card">
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <LinearGradient colors={colorsPair} style={styles.avatar}>
          <Text style={styles.avatarText}>{review.name.trim().charAt(0).toUpperCase()}</Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Text style={styles.name}>{review.name}</Text>
            {review.demo ? (
              <View style={styles.demo}>
                <Text style={styles.demoText}>{s.reviews.demo}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.when}>{relativeTime(review.createdAt, s, fmt, lang)}</Text>
        </View>
        <Stars value={review.rating} size={15} />
      </View>
      <Text style={styles.comment} selectable>
        {review.comment}
      </Text>
    </View>
  );
}

function ReviewForm() {
  const { s } = useI18n();
  const { submit: submitToStore } = useReviews();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; rating?: string; comment?: string; form?: string }>({});
  const [done, setDone] = useState(false);
  const doneAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!done) return;
    Animated.spring(doneAnim, { toValue: 1, useNativeDriver: NATIVE, speed: 9, bounciness: 10 }).start();
    const t = setTimeout(() => {
      Animated.timing(doneAnim, { toValue: 0, duration: 300, useNativeDriver: NATIVE }).start(() => setDone(false));
    }, 4500);
    return () => clearTimeout(t);
  }, [done, doneAnim]);

  const messageFor = (code?: string) => {
    switch (code) {
      case "no_links":
        return s.reviews.errLinks;
      case "repeated_chars":
        return s.reviews.errRepeated;
      default:
        return s.reviews.errComment;
    }
  };

  const submit = async () => {
    if (busy) return;
    const next: typeof errors = {};
    const n = name.trim();
    const c = comment.trim();
    if (n.length < 2 || n.length > 60) next.name = s.reviews.errName;
    if (rating < 1) next.rating = s.reviews.errRating;
    if (c.length < 5 || c.length > 600) next.comment = s.reviews.errComment;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    try {
      await submitToStore({ name: n, rating, comment: c });
      setName("");
      setRating(0);
      setComment("");
      setDone(true);
    } catch (e) {
      const err = e instanceof ApiError ? e : null;
      if (err?.kind === "validation") {
        setErrors({
          name: err.fields?.name ? s.reviews.errName : undefined,
          rating: err.fields?.rating ? s.reviews.errRating : undefined,
          comment: err.fields?.comment ? messageFor(err.fields.comment) : undefined,
        });
      } else if (err?.kind === "duplicate") setErrors({ form: s.reviews.errDuplicate });
      else if (err?.kind === "rate") setErrors({ form: s.reviews.errRate });
      else if (err?.kind === "network") setErrors({ form: s.reviews.errNetwork });
      else setErrors({ form: s.reviews.errGeneric });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.form} testID="review-form">
      <View style={{ gap: 4 }}>
        <Text style={styles.formTitle}>{s.reviews.formTitle}</Text>
        <T variant="small">{s.reviews.formHint}</T>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{s.reviews.name}</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={s.reviews.namePlaceholder}
          placeholderTextColor={colors.muted}
          maxLength={60}
          style={[styles.input, errors.name ? styles.inputError : null]}
          testID="review-name"
          accessibilityLabel={s.reviews.name}
          autoComplete="name"
          returnKeyType="next"
        />
        {errors.name ? <Text style={styles.error}>{errors.name}</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{s.reviews.rating}</Text>
        <StarPicker value={rating} onChange={setRating} />
        {errors.rating ? <Text style={styles.error}>{errors.rating}</Text> : null}
      </View>

      <View style={styles.field}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.label}>{s.reviews.comment}</Text>
          <Text style={[styles.counter, comment.length > 560 && { color: colors.red }]}>{comment.length}/600</Text>
        </View>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder={s.reviews.commentPlaceholder}
          placeholderTextColor={colors.muted}
          multiline
          maxLength={600}
          style={[styles.input, styles.textarea, errors.comment ? styles.inputError : null]}
          testID="review-comment"
          accessibilityLabel={s.reviews.comment}
          textAlignVertical="top"
        />
        {errors.comment ? <Text style={styles.error}>{errors.comment}</Text> : null}
      </View>

      {errors.form ? (
        <View style={styles.formError}>
          <Ionicons name="alert-circle" size={18} color={colors.red} />
          <Text style={[styles.error, { flex: 1 }]}>{errors.form}</Text>
        </View>
      ) : null}

      <Button label={busy ? s.reviews.sending : s.reviews.submit} icon={busy ? undefined : "send"} onPress={submit} disabled={busy} full size="lg" />

      {done ? (
        <Animated.View
          testID="review-success"
          style={[styles.success, { opacity: doneAnim, transform: [{ scale: doneAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] }]}
        >
          <Ionicons name="checkmark-circle" size={22} color={colors.green} />
          <Text style={styles.successText}>{s.reviews.success}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const { s } = useI18n();
  const scales = useRef([1, 2, 3, 4, 5].map(() => new Animated.Value(1))).current;
  const pop = (i: number) => {
    scales[i].setValue(0.6);
    Animated.spring(scales[i], { toValue: 1, useNativeDriver: NATIVE, speed: 14, bounciness: 16 }).start();
  };
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }} testID="star-picker">
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          onPress={() => {
            onChange(n);
            for (let i = 0; i < n; i++) setTimeout(() => pop(i), i * 45);
          }}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel={`${n} / 5`}
          testID={`star-${n}`}
          style={Platform.OS === "web" ? ({ cursor: "pointer" } as object) : undefined}
        >
          <Animated.View style={{ transform: [{ scale: scales[n - 1] }] }}>
            <Ionicons name={value >= n ? "star" : "star-outline"} size={34} color={value >= n ? colors.gold : "#B9CBD3"} />
          </Animated.View>
        </Pressable>
      ))}
      {value > 0 ? <Text style={styles.ratingWord}>{s.reviews.ratingLabels[value - 1]}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: "row", alignItems: "center", gap: 20, backgroundColor: colors.white, borderRadius: radius.lg, padding: 20, borderWidth: 1, borderColor: colors.line, ...shadow.card },
  avg: { fontFamily: fonts.display, fontSize: 54, lineHeight: 58, color: colors.ink },
  avgSub: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  barRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  barLabel: { width: 10, fontFamily: fonts.bold, fontSize: 12, color: colors.muted },
  barTrack: { flex: 1, height: 7, borderRadius: 4, backgroundColor: colors.bg, overflow: "hidden" },
  barFill: { height: 7, borderRadius: 4, backgroundColor: colors.gold },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 18, gap: 12, borderWidth: 1, borderColor: colors.line, ...shadow.card },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: fonts.bold, fontSize: 18, color: colors.white },
  name: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  when: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.muted, marginTop: 1 },
  comment: { fontFamily: fonts.body, fontSize: 15.5, lineHeight: 24, color: colors.inkSoft },
  demo: { backgroundColor: "#EEF3F5", borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  demoText: { fontFamily: fonts.bold, fontSize: 10.5, letterSpacing: 0.5, textTransform: "uppercase", color: colors.muted },
  offline: { flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap", backgroundColor: "#FFF4DD", borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: "#F6DDA6" },
  offlineTitle: { fontFamily: fonts.bold, fontSize: 14.5, color: "#7A4A00" },
  offlineText: { fontFamily: fonts.medium, fontSize: 13.5, color: "#8A5B10", marginTop: 1 },
  retry: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: "#FFE7B0" },
  retryText: { fontFamily: fonts.bold, fontSize: 13, color: "#7A4A00" },
  localNote: { flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap", backgroundColor: colors.tealSoft, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: "#BFE6E2" },
  localTitle: { fontFamily: fonts.bold, fontSize: 14.5, color: colors.tealDark },
  localText: { fontFamily: fonts.medium, fontSize: 13.5, color: colors.inkSoft, marginTop: 1 },
  localRetry: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.white },
  localRetryText: { fontFamily: fonts.bold, fontSize: 13, color: colors.tealDark },
  loading: { flexDirection: "row", alignItems: "center", gap: 10, padding: 20, justifyContent: "center" },
  empty: { alignItems: "center", gap: 10, padding: 28, borderRadius: radius.lg, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  form: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 20, gap: 16, borderWidth: 1, borderColor: colors.line, ...shadow.lift },
  formTitle: { fontFamily: fonts.display, fontSize: 24, lineHeight: 29, color: colors.ink },
  field: { gap: 7 },
  label: { fontFamily: fonts.bold, fontSize: 13, letterSpacing: 0.3, color: colors.ink },
  counter: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted },
  input: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: "transparent",
    paddingHorizontal: 16,
    paddingVertical: 13,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : null),
  },
  textarea: { minHeight: 112 },
  inputError: { borderColor: colors.red, backgroundColor: "#FFF7F7" },
  error: { fontFamily: fonts.semibold, fontSize: 13, color: colors.red },
  formError: { flexDirection: "row", gap: 8, alignItems: "center", backgroundColor: colors.redSoft, borderRadius: radius.md, padding: 12 },
  ratingWord: { fontFamily: fonts.bold, fontSize: 14, color: colors.tealDark, marginLeft: 8 },
  success: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.greenSoft, borderRadius: radius.md, padding: 14 },
  successText: { flex: 1, fontFamily: fonts.bold, fontSize: 14.5, color: "#0E6B46" },
});
