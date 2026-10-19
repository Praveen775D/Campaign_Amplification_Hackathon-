
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// ============================================================
// AMPLIFY — colourful, mobile-first campaign amplification MVP
// Existing REST API endpoints and simulated payment behaviour
// are preserved. No real payments or advertising are performed.
// ============================================================

const API =
  process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:5000/api";

const CATEGORIES = [
  "All",
  "Environment",
  "Health",
  "Science",
  "Education",
  "Public Policy",
  "Economic Policy",
  "Community",
  "Arts & Culture",
  "Business",
  "Other",
];

const STEPS = [
  "Basics",
  "Story",
  "Campaign & Ad Visuals",
  "Reach",
  "Submit",
];

const C = {
  ink: "#17172F",
  muted: "#77788F",
  bg: "#F6F5FB",
  white: "#FFFFFF",
  purple: "#6D4AFF",
  purpleDark: "#4C32C9",
  lavender: "#EEE9FF",
  navy: "#191638",
  navySoft: "#28244D",
  teal: "#14B8A6",
  tealPale: "#DDF8F2",
  coral: "#FF786E",
  coralPale: "#FFF0ED",
  yellow: "#FFD166",
  yellowPale: "#FFF6D9",
  blue: "#4D91FF",
  bluePale: "#E8F1FF",
  pink: "#E85DA8",
  pinkPale: "#FDE7F2",
  green: "#218B68",
  greenPale: "#E1F6EC",
  line: "#E9E7F1",
  danger: "#C43D55",
  grayPale: "#F0EFF6",
};

const money = (n: number) =>
  "₹" + Math.round(Number(n || 0)).toLocaleString("en-IN");

const number = (n: number) =>
  Number(n || 0).toLocaleString("en-IN");

const estimateReach = (n: number) =>
  number(Math.round(Math.max(0, Number(n) || 0) * 18));

const progressOf = (c: Campaign) =>
  c.fundingGoal > 0
    ? Math.min(100, Math.max(0, (c.raised / c.fundingGoal) * 100))
    : 0;

type Source = { title: string; url: string };
type Section = { heading: string; body: string };

type Campaign = {
  id: string;
  title: string;
  category: string;
  creatorName: string;
  summary: string;
  coverImage: string;
  storyIntro: string;
  storySections: Section[];
  sources: Source[];
  adHeadline: string;
  adDescription: string;
  cta: string;
  audienceLocation: string;
  audienceInterests: string[];
  channels: string[];
  durationDays: number;
  fundingGoal: number;
  raised: number;
  status: string;
  estimatedReach: number;
  adBudget: number;
  adSpend: number;
  impressions: number;
  clicks: number;
  measuredReach: number | null;
  backers: number;
  deadline: string;
};

type Draft = Partial<Campaign> & {
  id?: string;
  rulesAccepted?: boolean;
};

type ActivityItem = {
  id: string;
  title: string;
  body: string;
  type: string;
  createdAt: string;
  campaignId?: string;
};

const DEMO: Campaign[] = [
  {
    id: "camp-clean-rivers",
    title: "Cleaner rivers start with local action",
    category: "Environment",
    creatorName: "River Commons Collective",
    summary:
      "Share river cleanup information and practical ways communities can reduce plastic waste.",
    coverImage:
      "https://images.unsplash.com/photo-1437482078695-73f5ca6c96e2?auto=format&fit=crop&w=1000&q=80",
    storyIntro:
      "Healthy rivers begin with useful information and small actions communities can take together.",
    storySections: [
      {
        heading: "Why this matters",
        body:
          "Plastic waste can travel far beyond the place where it enters a waterway. Local information helps communities understand where action is useful.",
      },
      {
        heading: "What this campaign does",
        body:
          "This message campaign shares practical waste-reduction steps and links to local cleanup resources.",
      },
    ],
    sources: [
      {
        title: "UNEP — Plastic pollution",
        url: "https://www.unep.org/plastic-pollution",
      },
      {
        title: "Our World in Data — Plastic pollution",
        url: "https://ourworldindata.org/plastic-pollution",
      },
    ],
    adHeadline: "Small actions. Cleaner rivers.",
    adDescription: "Discover practical ways to reduce river plastic waste.",
    cta: "Learn more",
    audienceLocation: "Hyderabad, Telangana",
    audienceInterests: ["Environment", "Community action"],
    channels: ["Social feeds", "Display"],
    durationDays: 21,
    fundingGoal: 50000,
    raised: 32750,
    status: "available_for_funding",
    estimatedReach: 900000,
    adBudget: 45000,
    adSpend: 0,
    impressions: 0,
    clicks: 0,
    measuredReach: null,
    backers: 0,
    deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
  },
  {
    id: "camp-rural-science",
    title: "Make science learning accessible",
    category: "Education",
    creatorName: "Open Learning Lab",
    summary:
      "Help free science learning resources reach students and educators.",
    coverImage:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80",
    storyIntro:
      "Curiosity is everywhere, but useful learning resources do not always reach every learner.",
    storySections: [
      {
        heading: "The opportunity",
        body:
          "Accessible science explainers can give students and educators a starting point for experiments, questions and further learning.",
      },
    ],
    sources: [
      {
        title: "UNESCO — Education",
        url: "https://www.unesco.org/en/education",
      },
    ],
    adHeadline: "Science belongs to everyone",
    adDescription: "Discover a free guide for curious learners.",
    cta: "Explore guide",
    audienceLocation: "India",
    audienceInterests: ["Education", "Science"],
    channels: ["Social feeds"],
    durationDays: 30,
    fundingGoal: 35000,
    raised: 16800,
    status: "available_for_funding",
    estimatedReach: 630000,
    adBudget: 31500,
    adSpend: 0,
    impressions: 0,
    clicks: 0,
    measuredReach: null,
    backers: 0,
    deadline: new Date(Date.now() + 20 * 86400000).toISOString(),
  },
  {
    id: "camp-health",
    title: "Clear health information saves time",
    category: "Health",
    creatorName: "Community Health Notes",
    summary:
      "Share a plain-language guide to preparing questions for healthcare appointments.",
    coverImage:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80",
    storyIntro:
      "Useful information can help people prepare for conversations with qualified health professionals.",
    storySections: [
      {
        heading: "A clearer starting point",
        body:
          "This campaign shares a general appointment-preparation checklist and does not replace professional medical advice.",
      },
    ],
    sources: [
      {
        title: "WHO — Health topics",
        url: "https://www.who.int/health-topics",
      },
    ],
    adHeadline: "Prepare for your next health visit",
    adDescription: "A simple checklist for clearer conversations.",
    cta: "Read guide",
    audienceLocation: "India",
    audienceInterests: ["Health education"],
    channels: ["Social feeds", "Display"],
    durationDays: 14,
    fundingGoal: 25000,
    raised: 9200,
    status: "available_for_funding",
    estimatedReach: 450000,
    adBudget: 22500,
    adSpend: 0,
    impressions: 0,
    clicks: 0,
    measuredReach: null,
    backers: 0,
    deadline: new Date(Date.now() + 9 * 86400000).toISOString(),
  },
];

async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({
    error: "The server returned an unreadable response.",
  }));

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }

  return data as T;
}

// ============================================================
// REUSABLE UI COMPONENTS
// ============================================================

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={S.label}>{children}</Text>;
}

function Button({
  title,
  onPress,
  kind = "primary",
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  kind?: "primary" | "secondary" | "outline" | "ghost" | "coral";
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        S.button,
        kind === "primary" && S.btnPrimary,
        kind === "secondary" && S.btnSecondary,
        kind === "outline" && S.btnOutline,
        kind === "ghost" && S.btnGhost,
        kind === "coral" && S.btnCoral,
        disabled && { opacity: 0.45 },
        pressed && { opacity: 0.78, transform: [{ scale: 0.99 }] },
      ]}
    >
      <Text
        style={[
          S.buttonText,
          kind === "primary" && { color: C.white },
          kind === "secondary" && { color: C.purpleDark },
          kind === "outline" && { color: C.ink },
          kind === "ghost" && { color: C.purpleDark },
          kind === "coral" && { color: C.ink },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType,
  maxLength,
}: {
  label: string;
  value: unknown;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "numeric" | "email-address" | "url";
  maxLength?: number;
}) {
  return (
    <View style={S.field}>
      <Label>{label}</Label>
      <TextInput
        value={String(value ?? "")}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A2A0B4"
        multiline={multiline}
        keyboardType={keyboardType}
        maxLength={maxLength}
        textAlignVertical={multiline ? "top" : "center"}
        style={[S.input, multiline && S.inputMultiline]}
      />
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
  color = C.purple,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        S.chip,
        selected && { backgroundColor: color, borderColor: color },
      ]}
    >
      <Text style={[S.chipText, selected && { color: C.white }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function Progress({ value, color = C.teal }: { value: number; color?: string }) {
  return (
    <View style={S.progressTrack}>
      <View
        style={[
          S.progressFill,
          { width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

function Header({
  title,
  subtitle,
  back,
}: {
  title: string;
  subtitle?: string;
  back?: () => void;
}) {
  return (
    <View style={S.header}>
      {back && (
        <Pressable onPress={back} style={S.back}>
          <Text style={S.backText}>‹</Text>
        </Pressable>
      )}
      <View style={{ flex: 1 }}>
        <Text style={S.headerTitle}>{title}</Text>
        {!!subtitle && <Text style={S.headerSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

function CampaignCard({
  campaign,
  onPress,
  onBack,
}: {
  campaign: Campaign;
  onPress: () => void;
  onBack: () => void;
}) {
  const accent =
    campaign.category === "Environment"
      ? C.teal
      : campaign.category === "Health"
      ? C.coral
      : campaign.category === "Education"
      ? C.blue
      : C.purple;

  return (
    <Pressable onPress={onPress} style={S.campaignCard}>
      <View style={S.campaignImageWrap}>
        <Image
          source={{ uri: campaign.coverImage }}
          style={S.campaignImage}
          resizeMode="cover"
        />
        <View style={S.imageShade} />
        <View style={[S.categoryBadge, { backgroundColor: accent }]}>
          <Text style={S.categoryBadgeText}>{campaign.category}</Text>
        </View>
        <View style={S.imageBottomTag}>
          <Text style={S.imageBottomTagText}>COMMUNITY CAMPAIGN</Text>
        </View>
      </View>

      <View style={S.campaignBody}>
        <Text style={S.campaignTitle}>{campaign.title}</Text>
        <Text style={S.byline}>Created by {campaign.creatorName}</Text>
        <Text style={S.campaignSummary} numberOfLines={2}>
          {campaign.summary}
        </Text>

        <View style={S.rowBetween}>
          <View>
            <Text style={S.moneyLarge}>{money(campaign.raised)}</Text>
            <Text style={S.small}>raised so far</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={S.moneySmall}>{Math.round(progressOf(campaign))}%</Text>
            <Text style={S.small}>of goal</Text>
          </View>
        </View>

        <Progress value={progressOf(campaign)} color={accent} />

        <View style={[S.rowBetween, { marginTop: 7 }]}>
          <View style={S.reachMini}>
            <View style={[S.reachDot, { backgroundColor: accent }]} />
            <Text style={S.small}>
              {number(campaign.estimatedReach)} est. reach
            </Text>
          </View>
          <Pressable onPress={onBack} style={S.miniAction}>
            <Text style={S.miniActionText}>Support ↗</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

function StatCard({
  label,
  value,
  tint = C.lavender,
  accent = C.purple,
}: {
  label: string;
  value: string;
  tint?: string;
  accent?: string;
}) {
  return (
    <View style={[S.statCard, { backgroundColor: tint }]}>
      <Text style={[S.statValue, { color: accent }]}>{value}</Text>
      <Text style={S.statLabel}>{label}</Text>
    </View>
  );
}

// ============================================================
// MAIN APP
// ============================================================

function MainApp() {
  const [tab, setTab] = useState("Home");
  const [screen, setScreen] = useState<
    "tabs" | "detail" | "create" | "contribute" | "receipt" | "report" | "info"
  >("tabs");

  const [campaigns, setCampaigns] = useState<Campaign[]>(DEMO);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [selected, setSelected] = useState<Campaign>(DEMO[0]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("recent");

  const [draft, setDraft] = useState<Draft>({});
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [rulesAccepted, setRulesAccepted] = useState(false);

  const [contribution, setContribution] = useState("250");
  const [receipt, setReceipt] = useState<any>(null);
  const [receiptCampaign, setReceiptCampaign] = useState<Campaign | null>(null);
  const [report, setReport] = useState<any>(null);
  const [infoTitle, setInfoTitle] = useState("How it works");

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError("");

    try {
      const [c, a, p] = await Promise.all([
        api<{ campaigns: Campaign[] }>("/campaigns"),
        api<{ activity: ActivityItem[] }>("/activity"),
        api<any>("/profile"),
      ]);

      if (c.campaigns?.length) setCampaigns(c.campaigns);
      setActivity(a.activity || []);
      setProfile(p);
    } catch (e: any) {
      setError(
        e.message || "Couldn't connect to the API. Demo campaigns remain visible."
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const visibleCampaigns = useMemo(() => {
    let rows = [...campaigns];

    if (tab === "Explore" || query || category !== "All") {
      const q = query.trim().toLowerCase();

      rows = rows.filter((c) => {
        const matchesCategory = category === "All" || c.category === category;
        const matchesQuery =
          !q ||
          [c.title, c.summary, c.creatorName, c.category].some((v) =>
            String(v || "").toLowerCase().includes(q)
          );

        return matchesCategory && matchesQuery;
      });
    }

    if (sort === "progress") {
      rows.sort((a, b) => progressOf(b) - progressOf(a));
    }

    if (sort === "ending") {
      rows.sort(
        (a, b) =>
          new Date(a.deadline || 0).getTime() -
          new Date(b.deadline || 0).getTime()
      );
    }

    return rows.filter((c) =>
      ["available_for_funding", "promoting", "completed"].includes(c.status)
    );
  }, [campaigns, tab, query, category, sort]);

  const goTab = (name: string) => {
    setTab(name);
    setScreen("tabs");
    setError("");
  };

  const openCampaign = (campaign: Campaign) => {
    setSelected(campaign);
    setScreen("detail");
  };

  const openCreate = (existing?: Campaign) => {
    setDraft(
      existing
        ? { ...existing }
        : {
            title: "",
            category: "",
            creatorName: "Praveen Kumar",
            summary: "",
            coverImage: "",
            storyIntro: "",
            storySections: [{ heading: "Why this matters", body: "" }],
            sources: [{ title: "", url: "" }],
            adHeadline: "",
            adDescription: "",
            cta: "Learn more",
            audienceLocation: "India",
            audienceInterests: [],
            channels: ["Social feeds"],
            durationDays: 14,
            fundingGoal: 10000,
            adBudget: 9000,
          }
    );
    setStep(0);
    setRulesAccepted(false);
    setAutoSaved(false);
    setScreen("create");
  };

  const patchDraft = (key: string, value: any) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setAutoSaved(false);
  };

  const saveDraft = useCallback(
    async (showMessage = false) => {
      if (!draft.title && !draft.category && !draft.summary) {
        if (showMessage) {
          Alert.alert("Start your draft", "Enter a title or summary first.");
        }
        return;
      }

      setSaving(true);

      try {
        const payload = {
          ...draft,
          title: draft.title || "Untitled campaign",
          category: draft.category || "Other",
          creatorName: draft.creatorName || "Creator",
          fundingGoal: Number(draft.fundingGoal || 10000),
          durationDays: Number(draft.durationDays || 14),
          adBudget: Number(draft.adBudget || 0),
        };

        const result = draft.id
          ? await api<{ campaign: Campaign }>(`/campaigns/${draft.id}`, {
              method: "PUT",
              body: JSON.stringify(payload),
            })
          : await api<{ campaign: Campaign }>("/campaigns", {
              method: "POST",
              body: JSON.stringify(payload),
            });

        setDraft(result.campaign);
        setCampaigns((prev) => [
          result.campaign,
          ...prev.filter((c) => c.id !== result.campaign.id),
        ]);
        setAutoSaved(true);

        if (showMessage) {
          Alert.alert("Draft saved", "Your draft was saved to the server.");
        }
      } catch (e: any) {
        if (showMessage) {
          Alert.alert(
            "Couldn't save to server",
            `${e.message} Keep the screen open and try again.`
          );
        }
      } finally {
        setSaving(false);
      }
    },
    [draft]
  );

  useEffect(() => {
    if (screen !== "create") return;

    const timer = setTimeout(() => {
      if (draft.title || draft.summary || draft.storyIntro) {
        saveDraft(false);
      }
    }, 1600);

    return () => clearTimeout(timer);
  }, [draft, screen, saveDraft]);

  const submitDraft = async () => {
    if (
      !draft.title?.trim() ||
      draft.title.length > 60 ||
      !draft.category ||
      !draft.creatorName?.trim()
    ) {
      Alert.alert("Complete the basics", "Add a title, category and creator name.");
      setStep(0);
      return;
    }

    if ((draft.storyIntro || "").trim().length < 20) {
      Alert.alert("Add your story", "Please write at least 20 characters.");
      setStep(1);
      return;
    }

    if (
      !(draft.sources || []).some(
        (s) => s.title.trim() && /^https?:\/\//i.test(s.url)
      )
    ) {
      Alert.alert("Add a source", "Provide at least one source with an HTTP(S) URL.");
      setStep(1);
      return;
    }

    if (!draft.adHeadline?.trim()) {
      Alert.alert("Add an ad headline", "A short campaign message is required.");
      setStep(2);
      return;
    }

    if (!draft.audienceLocation?.trim()) {
      Alert.alert("Choose an audience", "Enter a target location.");
      setStep(3);
      return;
    }

    if (!rulesAccepted) {
      Alert.alert("Confirmation required", "Confirm the campaign rules.");
      setStep(4);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...draft,
        fundingGoal: Number(draft.fundingGoal || 10000),
        durationDays: Number(draft.durationDays || 14),
        adBudget: Number(draft.adBudget || 0),
      };

      const saved = draft.id
        ? await api<{ campaign: Campaign }>(`/campaigns/${draft.id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
        : await api<{ campaign: Campaign }>("/campaigns", {
            method: "POST",
            body: JSON.stringify(payload),
          });

      const result = await api<{ campaign: Campaign }>(
        `/campaigns/${saved.campaign.id}/submit`,
        {
          method: "POST",
          body: JSON.stringify({ rulesAccepted: true }),
        }
      );

      setCampaigns((prev) => [
        result.campaign,
        ...prev.filter((c) => c.id !== result.campaign.id),
      ]);
      setDraft(result.campaign);
      setScreen("tabs");
      setTab("Activity");
      await refresh();

      Alert.alert(
        "Submitted for review",
        "Your campaign is awaiting review. Submission does not mean approval or automatic advertising."
      );
    } catch (e: any) {
      Alert.alert("Submission failed", e.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const backCampaign = () => {
    setContribution("250");
    setScreen("contribute");
  };

  const doContribution = async () => {
    const amount = Number(contribution);

    if (!Number.isFinite(amount) || amount < 50 || amount > 100000) {
      Alert.alert("Invalid amount", "Choose between ₹50 and ₹1,00,000.");
      return;
    }

    setLoading(true);

    try {
      const result = await api<{ receipt: any; campaign: Campaign }>(
        `/campaigns/${selected.id}/contributions`,
        {
          method: "POST",
          body: JSON.stringify({ amount, simulate: "success" }),
        }
      );

      setReceipt(result.receipt);
      setReceiptCampaign(result.campaign);
      setSelected(result.campaign);
      setCampaigns((prev) =>
        prev.map((c) => (c.id === result.campaign.id ? result.campaign : c))
      );
      setScreen("receipt");
      await refresh();
    } catch (e: any) {
      Alert.alert("Contribution failed", e.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openReport = async (campaign: Campaign) => {
    setSelected(campaign);
    setReport(null);
    setScreen("report");

    try {
      const result = await api<{ report: any }>(
        `/campaigns/${campaign.id}/report`
      );
      setReport(result.report);
    } catch {
      setReport({
        title: campaign.title,
        fundsRaised: campaign.raised,
        fundingGoal: campaign.fundingGoal,
        estimatedReach: campaign.estimatedReach,
        adSpend: campaign.adSpend || 0,
        impressions: campaign.impressions || 0,
        clicks: campaign.clicks || 0,
        measuredReach: campaign.measuredReach,
        metricsNote: "Demo report. No live advertising platform is connected.",
      });
    }
  };

  // ============================================================
  // HOME
  // ============================================================

  const homeScreen = () => (
    <ScrollView
      contentContainerStyle={S.page}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={C.purple} />
      }
    >
      <View style={S.brandBar}>
        <View style={S.brandLockup}>
          <View style={S.brandIcon}>
            <Text style={S.brandIconText}>A</Text>
            <View style={S.brandIconDot} />
          </View>
          <View>
            <Text style={S.brandName}>amplify<Text style={{ color: C.purple }}>.</Text></Text>
            <Text style={S.brandTagline}>IDEAS WORTH SHARING</Text>
          </View>
        </View>
        <Pressable onPress={() => goTab("Profile")} style={S.profileButton}>
          <Text style={S.profileButtonText}>P</Text>
        </Pressable>
      </View>

      <View style={S.hero}>
        <View style={S.heroDecorOne} />
        <View style={S.heroDecorTwo} />
        <View style={S.heroPill}>
          <View style={S.heroPillDot} />
          <Text style={S.heroPillText}>COMMUNITY POWERED</Text>
        </View>

        <Text style={S.heroTitle}>
          Big ideas.{"\n"}
          <Text style={{ color: C.yellow }}>Bigger impact.</Text>
        </Text>

        <Text style={S.heroCopy}>
          Bring people together to help meaningful messages reach audiences beyond their existing networks.
        </Text>

        <View style={S.heroActions}>
          <View style={{ flex: 1 }}>
            <Button title="Explore campaigns ↗" onPress={() => goTab("Explore")} kind="coral" />
          </View>
          <View style={{ flex: 1 }}>
            <Button title="+ Create campaign" onPress={() => openCreate()} kind="secondary" />
          </View>
        </View>

        <View style={S.heroBottom}>
          <View style={S.heroStat}>
            <Text style={S.heroStatNumber}>01</Text>
            <Text style={S.heroStatLabel}>Create</Text>
          </View>
          <View style={S.heroStatLine} />
          <View style={S.heroStat}>
            <Text style={S.heroStatNumber}>02</Text>
            <Text style={S.heroStatLabel}>Review</Text>
          </View>
          <View style={S.heroStatLine} />
          <View style={S.heroStat}>
            <Text style={S.heroStatNumber}>03</Text>
            <Text style={S.heroStatLabel}>Amplify</Text>
          </View>
        </View>
      </View>

      <View style={S.estimateBanner}>
        <View style={S.estimateIcon}>
          <Text style={{ fontSize: 23 }}>✳</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={S.estimateTitle}>Reach, reimagined</Text>
          <Text style={S.estimateCopy}>
            Illustrative model: approximately 18 impressions per ₹1.
          </Text>
        </View>
        <View style={S.estimateNumberWrap}>
          <Text style={S.estimateNumber}>~18</Text>
        </View>
      </View>

      <View style={S.sectionHeader}>
        <View>
          <Text style={S.sectionKicker}>DISCOVER SOMETHING GOOD</Text>
          <Text style={S.sectionTitle}>Campaigns for you</Text>
        </View>
        <Pressable onPress={() => goTab("Explore")} style={S.viewAll}>
          <Text style={S.viewAllText}>View all ↗</Text>
        </Pressable>
      </View>

      {visibleCampaigns.slice(0, 3).map((c) => (
        <CampaignCard
          key={c.id}
          campaign={c}
          onPress={() => openCampaign(c)}
          onBack={() => {
            setSelected(c);
            backCampaign();
          }}
        />
      ))}

      <View style={S.howCard}>
        <View style={S.howCardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={S.sectionKicker}>THE AMPLIFY WAY</Text>
            <Text style={S.howTitle}>From idea to audience.</Text>
          </View>
          <View style={S.howIcon}>
            <Text style={{ color: C.purple, fontSize: 23 }}>✦</Text>
          </View>
        </View>

        {[
          { n: "01", title: "Tell your story", copy: "Create a message and add credible sources.", color: C.purple, tint: C.lavender },
          { n: "02", title: "Get reviewed", copy: "Campaigns are checked before funding eligibility.", color: C.teal, tint: C.tealPale },
          { n: "03", title: "Reach more people", copy: "Community funding can support message distribution.", color: C.coral, tint: C.coralPale },
        ].map((item) => (
          <View key={item.n} style={S.howRow}>
            <View style={[S.howNumberBox, { backgroundColor: item.tint }]}>
              <Text style={[S.howNumber, { color: item.color }]}>{item.n}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={S.howStepTitle}>{item.title}</Text>
              <Text style={S.howStepCopy}>{item.copy}</Text>
            </View>
          </View>
        ))}

        <Text style={S.disclaimer}>
          Contributions fund message distribution, not the cause itself. Reach is estimated and not guaranteed.
        </Text>
      </View>

      {!!error && <Text style={S.errorText}>{error}</Text>}
    </ScrollView>
  );

  // ============================================================
  // EXPLORE
  // ============================================================

  const exploreScreen = () => (
    <ScrollView
      contentContainerStyle={S.page}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={C.purple} />}
    >
      <Header title="Explore" subtitle="Find a message worth amplifying." />

      <View style={S.searchWrap}>
        <Text style={S.searchIcon}>⌕</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search campaigns or topics"
          placeholderTextColor="#A2A0B4"
          style={S.searchInput}
          returnKeyType="search"
        />
        {!!query && (
          <Pressable onPress={() => setQuery("")}>
            <Text style={S.clearSearch}>✕</Text>
          </Pressable>
        )}
      </View>

      <Text style={S.label}>EXPLORE BY CATEGORY</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {CATEGORIES.map((item) => (
          <Chip
            key={item}
            label={item}
            selected={category === item}
            onPress={() => setCategory(item)}
          />
        ))}
      </ScrollView>

      <View style={S.sectionHeader}>
        <View>
          <Text style={S.sectionKicker}>FIND YOUR NEXT CAMPAIGN</Text>
          <Text style={S.sectionTitle}>{visibleCampaigns.length} campaigns</Text>
        </View>
      </View>

      <View style={S.sortRow}>
        {[
          ["recent", "Recent"],
          ["progress", "Most funded"],
          ["ending", "Ending soon"],
        ].map(([value, label]) => (
          <Chip
            key={value}
            label={label}
            selected={sort === value}
            onPress={() => setSort(value)}
          />
        ))}
      </View>

      {visibleCampaigns.map((c) => (
        <CampaignCard
          key={c.id}
          campaign={c}
          onPress={() => openCampaign(c)}
          onBack={() => {
            setSelected(c);
            backCampaign();
          }}
        />
      ))}

      {visibleCampaigns.length === 0 && (
        <View style={S.empty}>
          <View style={S.emptyIcon}>
            <Text style={{ fontSize: 30, color: C.purple }}>⌕</Text>
          </View>
          <Text style={S.sectionTitle}>Nothing found just yet</Text>
          <Text style={S.emptyCopy}>Try another keyword or category.</Text>
          <Button
            title="Clear filters"
            kind="secondary"
            onPress={() => {
              setQuery("");
              setCategory("All");
            }}
          />
        </View>
      )}
    </ScrollView>
  );

  // ============================================================
  // CAMPAIGN DETAILS
  // ============================================================

  const detailScreen = () => (
    <ScrollView contentContainerStyle={S.page}>
      <Header
        title="Campaign details"
        subtitle="Read the story behind the message."
        back={() => setScreen("tabs")}
      />

      <View style={S.detailImageWrap}>
        <Image
          source={{ uri: selected.coverImage }}
          style={S.detailImage}
          resizeMode="cover"
        />
        <View style={S.detailImageShade} />
        <View style={S.detailImageBadge}>
          <Text style={S.detailImageBadgeText}>{selected.category}</Text>
        </View>
      </View>

      <Text style={S.sectionKicker}>A COMMUNITY CAMPAIGN</Text>
      <Text style={S.detailTitle}>{selected.title}</Text>
      <Text style={S.byline}>Created by {selected.creatorName}</Text>
      <Text style={S.storyIntro}>{selected.storyIntro || selected.summary}</Text>

      {(selected.storySections || []).map((section, index) => (
        <View key={index} style={S.storySection}>
          <Text style={S.subheading}>{section.heading}</Text>
          <Text style={S.bodyText}>{section.body}</Text>
        </View>
      ))}

      <View style={S.panel}>
        <Text style={S.panelTitle}>Sources & references</Text>
        {(selected.sources || []).map((source, index) => (
          <Pressable
            key={index}
            onPress={() => Linking.openURL(source.url)}
            style={S.sourceRow}
          >
            <View style={S.sourceIcon}>
              <Text style={{ color: C.purple, fontSize: 17 }}>↗</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={S.sourceTitle}>{source.title}</Text>
              <Text style={S.sourceUrl}>{source.url}</Text>
            </View>
          </Pressable>
        ))}
        {(!selected.sources || selected.sources.length === 0) && (
          <Text style={S.bodyText}>No sources have been added yet.</Text>
        )}
      </View>

      <View style={S.fundingPanel}>
        <View style={S.fundingPanelHeader}>
          <Text style={S.panelTitle}>Funding progress</Text>
          <View style={S.liveBadge}>
            <Text style={S.liveBadgeText}>{Math.round(progressOf(selected))}%</Text>
          </View>
        </View>

        <Text style={S.fundingBig}>{money(selected.raised)}</Text>
        <Text style={S.muted}>raised of {money(selected.fundingGoal)}</Text>
        <Progress value={progressOf(selected)} />
        <View style={S.rowBetween}>
          <Text style={S.small}>Goal: {money(selected.fundingGoal)}</Text>
          <Text style={S.small}>{number(selected.estimatedReach)} estimated reach</Text>
        </View>

        <View style={S.metricDivider} />
        <View style={S.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={S.metricLabel}>CAMPAIGN STATUS</Text>
            <Text style={S.metricText}>{selected.status.replace(/_/g, " ")}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={S.metricLabel}>DURATION</Text>
            <Text style={S.metricText}>{selected.durationDays} days</Text>
          </View>
        </View>
      </View>

      <View style={S.panel}>
        <Text style={S.panelTitle}>Intended audience</Text>
        <Text style={S.bodyText}>Location: {selected.audienceLocation || "Not specified"}</Text>
        <Text style={S.bodyText}>
          Interests: {(selected.audienceInterests || []).join(", ") || "Broad audience"}
        </Text>
        <Text style={S.bodyText}>
          Channels: {(selected.channels || []).join(", ") || "To be determined"}
        </Text>
      </View>

      <View style={S.notice}>
        <Text style={S.noticeTitle}>Where does your contribution go?</Text>
        <Text style={S.noticeCopy}>
          Contributions support distribution of the campaign message, not a direct donation to the cause or creator. This demo does not collect real money or launch advertising.
        </Text>
      </View>

      <Button title="Support this campaign →" onPress={backCampaign} />
      <Button title="View distribution report" kind="secondary" onPress={() => openReport(selected)} />
      <Button
        title="Share campaign"
        kind="outline"
        onPress={() =>
          Alert.alert("Share campaign", `Demo campaign ID: ${selected.id}`)
        }
      />
    </ScrollView>
  );

  // ============================================================
  // CREATE CAMPAIGN — five-step form
  // ============================================================

  const createScreen = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={S.page}
        keyboardShouldPersistTaps="handled"
      >
        <Header
          title="Create a campaign"
          subtitle="Your idea deserves a clear story."
          back={() => setScreen("tabs")}
        />

        <View style={S.stepper}>
          {STEPS.map((name, index) => (
            <Pressable
              key={name}
              style={S.stepItem}
              onPress={() => {
                if (index < step) setStep(index);
              }}
            >
              <View
                style={[
                  S.stepCircle,
                  index === step && S.stepCircleActive,
                  index < step && S.stepCircleDone,
                ]}
              >
                <Text
                  style={[
                    S.stepCircleText,
                    (index === step || index < step) && { color: C.white },
                  ]}
                >
                  {index < step ? "✓" : index + 1}
                </Text>
              </View>
              <Text style={[S.stepLabel, index === step && { color: C.purple }]}>
                {name}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={S.formPanel}>
          <View style={S.formTop}>
            <View style={S.formStepBadge}>
              <Text style={S.formStepBadgeText}>STEP {step + 1} OF 5</Text>
            </View>
            <Text style={S.formTitle}>{STEPS[step]}</Text>
          </View>

          {step === 0 && (
            <>
              <Text style={S.bodyText}>
                Start with the basics. Make the message clear and specific.
              </Text>

              <Field
                label="Campaign title *"
                value={draft.title}
                onChangeText={(v) => patchDraft("title", v)}
                placeholder="What do you want people to know?"
                maxLength={60}
              />
              <Text style={S.small}>{(draft.title || "").length}/60 characters</Text>

              <Label>Choose a category *</Label>
              <View style={S.chipWrap}>
                {CATEGORIES.filter((x) => x !== "All").map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    selected={draft.category === item}
                    onPress={() => patchDraft("category", item)}
                  />
                ))}
              </View>

              <Field
                label="Creator / organization *"
                value={draft.creatorName}
                onChangeText={(v) => patchDraft("creatorName", v)}
                placeholder="Who is behind this message?"
              />
              <Field
                label="Short summary"
                value={draft.summary}
                onChangeText={(v) => patchDraft("summary", v)}
                placeholder="Explain the idea in a few sentences."
                multiline
              />
              <Field
                label="Cover image URL"
                value={draft.coverImage}
                onChangeText={(v) => patchDraft("coverImage", v)}
                placeholder="https://example.com/image.jpg"
                keyboardType="url"
              />
            </>
          )}

          {step === 1 && (
            <>
              <Text style={S.bodyText}>
                Tell the story behind your message. Add at least one credible source.
              </Text>

              <Field
                label="Story introduction *"
                value={draft.storyIntro}
                onChangeText={(v) => patchDraft("storyIntro", v)}
                placeholder="Why does this matter?"
                multiline
              />

              <Field
                label="Section heading"
                value={draft.storySections?.[0]?.heading}
                onChangeText={(v) =>
                  patchDraft("storySections", [
                    {
                      ...(draft.storySections?.[0] || {}),
                      heading: v,
                      body: draft.storySections?.[0]?.body || "",
                    },
                  ])
                }
                placeholder="What people should know"
              />

              <Field
                label="Story section"
                value={draft.storySections?.[0]?.body}
                onChangeText={(v) =>
                  patchDraft("storySections", [
                    {
                      ...(draft.storySections?.[0] || {}),
                      heading: draft.storySections?.[0]?.heading || "What people should know",
                      body: v,
                    },
                  ])
                }
                placeholder="Add useful context and details."
                multiline
              />

              {(draft.sources || []).map((source, index) => (
                <View key={index} style={S.sourceForm}>
                  <View style={S.rowBetween}>
                    <Text style={S.sourceFormTitle}>Source {index + 1}</Text>
                    {index > 0 && (
                      <Pressable
                        onPress={() =>
                          patchDraft(
                            "sources",
                            (draft.sources || []).filter((_, i) => i !== index)
                          )
                        }
                      >
                        <Text style={{ color: C.danger, fontWeight: "800" }}>Remove</Text>
                      </Pressable>
                    )}
                  </View>

                  <Field
                    label="Source title *"
                    value={source.title}
                    onChangeText={(v) =>
                      patchDraft(
                        "sources",
                        (draft.sources || []).map((x, i) =>
                          i === index ? { ...x, title: v } : x
                        )
                      )
                    }
                    placeholder="Publisher or report name"
                  />
                  <Field
                    label="Source URL *"
                    value={source.url}
                    onChangeText={(v) =>
                      patchDraft(
                        "sources",
                        (draft.sources || []).map((x, i) =>
                          i === index ? { ...x, url: v } : x
                        )
                      )
                    }
                    placeholder="https://example.org/source"
                    keyboardType="url"
                  />
                </View>
              ))}

              <Button
                title="+ Add another source"
                kind="secondary"
                onPress={() =>
                  patchDraft("sources", [
                    ...(draft.sources || []),
                    { title: "", url: "" },
                  ])
                }
              />
            </>
          )}

          {step === 2 && (
            <>
              <Text style={S.bodyText}>
                Prepare the message people will see in a promotion placement.
              </Text>

              <Field
                label="Ad headline *"
                value={draft.adHeadline}
                onChangeText={(v) => patchDraft("adHeadline", v)}
                placeholder="Short, memorable headline"
                maxLength={60}
              />
              <Field
                label="Ad description"
                value={draft.adDescription}
                onChangeText={(v) => patchDraft("adDescription", v)}
                placeholder="A sentence that invites people to learn more."
                multiline
                maxLength={180}
              />
              <Field
                label="Call to action"
                value={draft.cta}
                onChangeText={(v) => patchDraft("cta", v)}
                placeholder="Learn more"
              />
              <Field
                label="Advertising image URL"
                value={draft.coverImage}
                onChangeText={(v) => patchDraft("coverImage", v)}
                placeholder="https://example.com/image.jpg"
                keyboardType="url"
              />

              <View style={S.adPreview}>
                <View style={S.adPreviewTop}>
                  <View style={S.adPreviewIcon}>
                    <Text style={{ color: C.purple, fontWeight: "900" }}>A</Text>
                  </View>
                  <View>
                    <Text style={S.adPreviewBrand}>AMPLIFY</Text>
                    <Text style={S.small}>Sponsored message · Preview</Text>
                  </View>
                </View>

                {!!draft.coverImage && (
                  <Image
                    source={{ uri: draft.coverImage }}
                    style={S.adPreviewImage}
                    resizeMode="cover"
                  />
                )}

                <Text style={S.adPreviewHeadline}>
                  {draft.adHeadline || draft.title || "Your campaign headline"}
                </Text>
                <Text style={S.bodyText}>
                  {draft.adDescription || draft.summary || "Your ad description appears here."}
                </Text>
                <View style={S.adPreviewCta}>
                  <Text style={S.adPreviewCtaText}>{draft.cta || "Learn more"} ↗</Text>
                </View>
              </View>
              <Text style={S.disclaimer}>
                Creative preview only. No ad platform is connected.
              </Text>
            </>
          )}

          {step === 3 && (
            <>
              <Text style={S.bodyText}>
                Define who you want to reach. Actual targeting and delivery may vary.
              </Text>

              <Field
                label="Target location *"
                value={draft.audienceLocation}
                onChangeText={(v) => patchDraft("audienceLocation", v)}
                placeholder="e.g. Hyderabad, Telangana"
              />

              <Label>Audience interests</Label>
              <View style={S.chipWrap}>
                {[
                  "Environment",
                  "Education",
                  "Health",
                  "Science",
                  "Community",
                  "Arts",
                  "Business",
                  "Public policy",
                  "Families",
                  "Students",
                ].map((item) => {
                  const active = (draft.audienceInterests || []).includes(item);
                  return (
                    <Chip
                      key={item}
                      label={item}
                      selected={active}
                      color={C.teal}
                      onPress={() =>
                        patchDraft(
                          "audienceInterests",
                          active
                            ? (draft.audienceInterests || []).filter((x) => x !== item)
                            : [...(draft.audienceInterests || []), item]
                        )
                      }
                    />
                  );
                })}
              </View>

              <Label>Distribution channels</Label>
              <View style={S.chipWrap}>
                {["Social feeds", "Display", "Video"].map((item) => {
                  const active = (draft.channels || []).includes(item);
                  return (
                    <Chip
                      key={item}
                      label={item}
                      selected={active}
                      color={C.purple}
                      onPress={() =>
                        patchDraft(
                          "channels",
                          active
                            ? (draft.channels || []).filter((x) => x !== item)
                            : [...(draft.channels || []), item]
                        )
                      }
                    />
                  );
                })}
              </View>

              <Field
                label="Campaign duration (days)"
                value={draft.durationDays ?? 14}
                onChangeText={(v) =>
                  patchDraft("durationDays", Math.max(1, Math.min(90, Number(v) || 1)))
                }
                keyboardType="numeric"
              />
              <Field
                label="Proposed advertising budget (₹)"
                value={draft.adBudget ?? 9000}
                onChangeText={(v) =>
                  patchDraft("adBudget", Math.max(0, Number(v) || 0))
                }
                keyboardType="numeric"
              />

              <View style={S.reachCard}>
                <View style={S.reachCardIcon}>
                  <Text style={{ color: C.teal, fontSize: 22 }}>↗</Text>
                </View>
                <Text style={S.reachCardKicker}>ILLUSTRATIVE REACH ESTIMATE</Text>
                <Text style={S.reachCardNumber}>
                  ~{estimateReach(Number(draft.adBudget || 0))}
                </Text>
                <Text style={S.bodyText}>
                  Estimated impressions using the demo assumption of 18 per ₹1.
                </Text>
              </View>

              <Field
                label="Funding goal (₹)"
                value={draft.fundingGoal ?? 10000}
                onChangeText={(v) =>
                  patchDraft("fundingGoal", Math.max(1, Number(v) || 1))
                }
                keyboardType="numeric"
              />
            </>
          )}

          {step === 4 && (
            <>
              <Text style={S.bodyText}>
                Review the details before submitting your campaign for moderation.
              </Text>

              <View style={S.reviewCard}>
                {!!draft.coverImage && (
                  <Image
                    source={{ uri: draft.coverImage }}
                    style={S.reviewImage}
                    resizeMode="cover"
                  />
                )}

                <View style={S.reviewCategory}>
                  <Text style={S.reviewCategoryText}>{draft.category || "CATEGORY"}</Text>
                </View>
                <Text style={S.reviewTitle}>{draft.title || "Untitled campaign"}</Text>
                <Text style={S.byline}>By {draft.creatorName || "Creator"}</Text>
                <Text style={S.bodyText}>{draft.summary || "No summary added."}</Text>

                <View style={S.metricDivider} />
                <Text style={S.subheading}>Story</Text>
                <Text style={S.bodyText}>{draft.storyIntro || "No story added."}</Text>

                <Text style={S.subheading}>Advertising creative</Text>
                <Text style={S.bodyText}>{draft.adHeadline || "No headline added."}</Text>

                <Text style={S.subheading}>Audience</Text>
                <Text style={S.bodyText}>
                  {draft.audienceLocation || "Not set"} · {(draft.channels || []).join(", ")}
                </Text>

                <View style={S.reviewStats}>
                  <View>
                    <Text style={S.small}>Funding goal</Text>
                    <Text style={S.reviewAmount}>{money(Number(draft.fundingGoal || 10000))}</Text>
                  </View>
                  <View>
                    <Text style={S.small}>Proposed budget</Text>
                    <Text style={S.reviewAmount}>{money(Number(draft.adBudget || 0))}</Text>
                  </View>
                </View>
              </View>

              <Pressable
                onPress={() => setRulesAccepted(!rulesAccepted)}
                style={S.checkRow}
              >
                <View style={[S.checkbox, rulesAccepted && S.checkboxActive]}>
                  {rulesAccepted && <Text style={{ color: C.white, fontWeight: "900" }}>✓</Text>}
                </View>
                <Text style={[S.bodyText, { flex: 1 }]}>
                  I confirm the campaign follows platform rules and includes accurate sources. I understand it may be reviewed before becoming eligible for funding.
                </Text>
              </Pressable>

              <View style={S.notice}>
                <Text style={S.noticeTitle}>One last thing</Text>
                <Text style={S.noticeCopy}>
                  Submission is not approval. Funding does not automatically launch advertising.
                </Text>
              </View>
            </>
          )}

          <View style={S.saveRow}>
            <Button title="Save draft" kind="outline" onPress={() => saveDraft(true)} />
            <Text style={S.small}>
              {saving ? "Saving…" : autoSaved ? "✓ Saved" : "Auto-save enabled"}
            </Text>
          </View>

          <View style={S.formActions}>
            {step > 0 && (
              <View style={{ flex: 1 }}>
                <Button
                  title="← Back"
                  kind="outline"
                  onPress={() => setStep((n) => Math.max(0, n - 1))}
                />
              </View>
            )}
            <View style={{ flex: 1 }}>
              {step < 4 ? (
                <Button
                  title="Continue →"
                  onPress={() => setStep((n) => Math.min(4, n + 1))}
                />
              ) : (
                <Button title="Submit for review ↗" onPress={submitDraft} />
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ============================================================
  // CONTRIBUTION CHECKOUT — simulated only
  // ============================================================

  const contributeScreen = () => {
    const amount = Number(contribution) || 0;
    const platformFee = Math.round(amount * 0.05);
    const transactionFee = Math.round(amount * 0.02);
    const total = amount + platformFee + transactionFee;

    return (
      <ScrollView contentContainerStyle={S.page} keyboardShouldPersistTaps="handled">
        <Header
          title="Back this campaign"
          subtitle="Help a message reach more people."
          back={() => setScreen("detail")}
        />

        <View style={S.checkoutHero}>
          <View style={S.checkoutIcon}>
            <Text style={{ color: C.white, fontSize: 24 }}>✦</Text>
          </View>
          <Text style={S.checkoutTitle}>{selected.title}</Text>
          <Text style={S.checkoutCopy}>{selected.summary}</Text>
          <View style={S.checkoutProgress}>
            <Progress value={progressOf(selected)} color={C.yellow} />
            <View style={S.rowBetween}>
              <Text style={S.checkoutSmall}>{money(selected.raised)} raised</Text>
              <Text style={S.checkoutSmall}>{Math.round(progressOf(selected))}% funded</Text>
            </View>
          </View>
        </View>

        <View style={S.sectionHeader}>
          <Text style={S.sectionTitle}>Choose an amount</Text>
        </View>

        <View style={S.amountGrid}>
          {[100, 250, 500, 1000].map((n) => {
            const active = contribution === String(n);
            return (
              <Pressable
                key={n}
                onPress={() => setContribution(String(n))}
                style={[S.amountOption, active && S.amountOptionActive]}
              >
                <Text style={[S.amountText, active && { color: C.purple }]}>
                  {money(n)}
                </Text>
                {active && <Text style={S.amountSelectedLabel}>SELECTED</Text>}
              </Pressable>
            );
          })}
        </View>

        <Field
          label="Custom amount (₹)"
          value={contribution}
          onChangeText={setContribution}
          placeholder="Enter amount"
          keyboardType="numeric"
        />

        <View style={S.reachCard}>
          <Text style={S.reachCardKicker}>ESTIMATED IMPRESSIONS</Text>
          <Text style={S.reachCardNumber}>~{estimateReach(amount)}</Text>
          <Text style={S.bodyText}>
            An illustrative estimate only. Actual delivery is not guaranteed.
          </Text>
        </View>

        <View style={S.panel}>
          <Text style={S.panelTitle}>Contribution summary</Text>

          {[
            ["Contribution", money(amount)],
            ["Platform fee (5%)", money(platformFee)],
            ["Transaction fee (2%)", money(transactionFee)],
          ].map(([label, value]) => (
            <View key={label} style={S.feeRow}>
              <Text style={S.muted}>{label}</Text>
              <Text style={S.feeValue}>{value}</Text>
            </View>
          ))}

          <View style={S.metricDivider} />
          <View style={S.feeRow}>
            <Text style={S.totalLabel}>Total · simulated</Text>
            <Text style={S.totalAmount}>{money(total)}</Text>
          </View>
        </View>

        <View style={S.notice}>
          <Text style={S.noticeTitle}>Demo checkout</Text>
          <Text style={S.noticeCopy}>
            This action simulates a contribution through the API. No real payment is collected.
          </Text>
        </View>

        <Button
          title={`Simulate contribution · ${money(total)}`}
          onPress={doContribution}
        />
        <Button title="Cancel" kind="ghost" onPress={() => setScreen("detail")} />
      </ScrollView>
    );
  };

  // ============================================================
  // RECEIPT
  // ============================================================

  const receiptScreen = () => (
    <ScrollView contentContainerStyle={S.page}>
      <View style={S.receiptHero}>
        <View style={S.receiptSuccess}>
          <Text style={S.receiptSuccessText}>✓</Text>
        </View>
        <Text style={S.receiptTitle}>Contribution recorded!</Text>
        <Text style={S.receiptCopy}>
          This is a simulated transaction. No real money was collected.
        </Text>
      </View>

      <View style={S.receiptCard}>
        <Text style={S.sectionKicker}>AMPLIFY · DEMO RECEIPT</Text>
        <Text style={S.receiptAmount}>{money(receipt?.total || 0)}</Text>
        <Text style={S.muted}>Simulated total</Text>
        <View style={S.metricDivider} />

        {[
          ["Receipt ID", receipt?.id || "DEMO"],
          ["Contribution", money(receipt?.amount || 0)],
          ["Fees", money((receipt?.platformFee || 0) + (receipt?.transactionFee || 0))],
          ["Campaign", receipt?.campaignTitle || selected.title],
          ["Estimated impressions", number(receipt?.estimatedReach || 0)],
        ].map(([label, value]) => (
          <View key={label} style={S.feeRow}>
            <Text style={S.muted}>{label}</Text>
            <Text style={[S.feeValue, { maxWidth: "58%", textAlign: "right" }]}>{value}</Text>
          </View>
        ))}
      </View>

      {receiptCampaign && (
        <View style={S.panel}>
          <Text style={S.panelTitle}>Campaign progress updated</Text>
          <Text style={S.fundingBig}>{money(receiptCampaign.raised)}</Text>
          <Text style={S.muted}>of {money(receiptCampaign.fundingGoal)}</Text>
          <Progress value={progressOf(receiptCampaign)} />
        </View>
      )}

      <Button
        title="View campaign"
        onPress={() => {
          if (receiptCampaign) setSelected(receiptCampaign);
          setScreen("detail");
        }}
      />
      <Button title="Done" kind="secondary" onPress={() => goTab("Activity")} />
    </ScrollView>
  );

  // ============================================================
  // ACTIVITY
  // ============================================================

  const activityScreen = () => (
    <ScrollView
      contentContainerStyle={S.page}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={C.purple} />}
    >
      <Header title="Activity" subtitle="Your latest campaign updates." />

      <View style={S.activityBanner}>
        <View style={S.activityBannerIcon}>
          <Text style={{ fontSize: 24, color: C.purple }}>◷</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={S.activityBannerTitle}>Stay in the loop</Text>
          <Text style={S.bodyText}>
            Review campaign submissions and activity updates here.
          </Text>
        </View>
      </View>

      {activity.length === 0 ? (
        <View style={S.empty}>
          <View style={S.emptyIcon}>
            <Text style={{ fontSize: 26, color: C.purple }}>✦</Text>
          </View>
          <Text style={S.sectionTitle}>You're all caught up</Text>
          <Text style={S.emptyCopy}>
            Submissions, contribution records and milestones will appear here when available.
          </Text>
        </View>
      ) : (
        activity.map((item, index) => (
          <View key={item.id} style={S.activityCard}>
            <View
              style={[
                S.activityMarker,
                { backgroundColor: [C.purple, C.teal, C.coral, C.blue][index % 4] },
              ]}
            />
            <View style={{ flex: 1 }}>
              <Text style={S.activityTitle}>{item.title}</Text>
              <Text style={S.bodyText}>{item.body}</Text>
              <Text style={S.small}>{new Date(item.createdAt).toLocaleString()}</Text>
              {!!item.campaignId && (
                <Pressable
                  onPress={() => {
                    const c = campaigns.find((x) => x.id === item.campaignId);
                    if (c) openCampaign(c);
                  }}
                >
                  <Text style={S.viewAllText}>View campaign →</Text>
                </Pressable>
              )}
            </View>
          </View>
        ))
      )}

      <Text style={S.disclaimer}>
        These are in-app demo updates. Push notifications and email delivery are not configured.
      </Text>
    </ScrollView>
  );

  // ============================================================
  // PROFILE
  // ============================================================

  const profileScreen = () => {
    const owned = campaigns.filter(
      (c) =>
        ["draft", "submitted_for_review", "changes_requested"].includes(c.status) ||
        c.creatorName === "Praveen Kumar"
    );

    return (
      <ScrollView
        contentContainerStyle={S.page}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={C.purple} />}
      >
        <Header title="Your profile" subtitle="Your campaigns, your impact." />

        <View style={S.profileHero}>
          <View style={S.profileAvatar}>
            <Text style={S.profileAvatarText}>PK</Text>
            <View style={S.avatarOnline} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={S.profileName}>{profile?.user?.name || "Praveen Kumar"}</Text>
            <Text style={S.muted}>
              {profile?.user?.email || "praveen.demo@example.com"}
            </Text>
            <View style={S.demoBadge}>
              <Text style={S.demoBadgeText}>DEMO ACCOUNT</Text>
            </View>
          </View>
        </View>

        <View style={S.statsGrid}>
          <StatCard
            label="Campaigns created"
            value={String(profile?.counts?.created ?? owned.length)}
          />
          <StatCard
            label="Contributions"
            value={String(profile?.counts?.backed ?? 0)}
            tint={C.tealPale}
            accent={C.teal}
          />
        </View>

        <View style={S.sectionHeader}>
          <Text style={S.sectionTitle}>Your campaign work</Text>
          <Text style={S.small}>{owned.length} items</Text>
        </View>

        {owned.length === 0 ? (
          <View style={S.panel}>
            <Text style={S.panelTitle}>Your first idea starts here</Text>
            <Text style={S.bodyText}>Create a campaign and your work will appear here.</Text>
            <Button title="+ Create campaign" onPress={() => openCreate()} />
          </View>
        ) : (
          owned.map((c) => (
            <Pressable
              key={c.id}
              style={S.ownedRow}
              onPress={() =>
                c.status === "draft" || c.status === "changes_requested"
                  ? openCreate(c)
                  : openReport(c)
              }
            >
              <View style={S.ownedIcon}>
                <Text style={{ color: C.purple, fontWeight: "900" }}>A</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={S.ownedTitle}>{c.title}</Text>
                <Text style={S.small}>{c.status.replace(/_/g, " ")}</Text>
              </View>
              <Text style={S.viewAllText}>Open ↗</Text>
            </Pressable>
          ))
        )}

        <Text style={S.sectionTitle}>Help & information</Text>
        {[
          "How it works",
          "FAQs",
          "Community guidelines",
          "Privacy",
          "Terms",
          "Contact support",
        ].map((title, index) => (
          <Pressable
            key={title}
            style={S.infoRow}
            onPress={() => {
              setInfoTitle(title);
              setScreen("info");
            }}
          >
            <View
              style={[
                S.infoIcon,
                {
                  backgroundColor: [C.lavender, C.tealPale, C.coralPale, C.bluePale, C.yellowPale, C.pinkPale][index],
                },
              ]}
            >
              <Text style={S.infoIconText}>{["✦", "?", "✓", "◈", "≡", "↗"][index]}</Text>
            </View>
            <Text style={[S.bodyText, { flex: 1, color: C.ink, fontWeight: "700" }]}>{title}</Text>
            <Text style={S.rowArrow}>›</Text>
          </Pressable>
        ))}

        <Button title="Refresh account data" kind="outline" onPress={refresh} />
      </ScrollView>
    );
  };

  // ============================================================
  // DISTRIBUTION REPORT
  // ============================================================

  const reportScreen = () => {
    const metrics = [
      {
        label: "Funds raised",
        value: money(report?.fundsRaised ?? selected.raised),
        tint: C.lavender,
        accent: C.purple,
      },
      {
        label: "Funding goal",
        value: money(report?.fundingGoal ?? selected.fundingGoal),
        tint: C.tealPale,
        accent: C.teal,
      },
      {
        label: "Ad spend",
        value: money(report?.adSpend ?? 0),
        tint: C.coralPale,
        accent: C.coral,
      },
      {
        label: "Impressions",
        value: number(report?.impressions ?? 0),
        tint: C.bluePale,
        accent: C.blue,
      },
      {
        label: "Clicks",
        value: number(report?.clicks ?? 0),
        tint: C.pinkPale,
        accent: C.pink,
      },
      {
        label: "Estimated reach",
        value: number(report?.estimatedReach ?? selected.estimatedReach),
        tint: C.yellowPale,
        accent: "#986A00",
      },
    ];

    return (
      <ScrollView contentContainerStyle={S.page}>
        <Header
          title="Campaign insights"
          subtitle="Estimated and measured results."
          back={() => setScreen("detail")}
        />

        <View style={S.reportHero}>
          <Text style={S.reportKicker}>DISTRIBUTION REPORT</Text>
          <Text style={S.reportTitle}>{report?.title || selected.title}</Text>
          <Text style={S.reportStatus}>{selected.status.replace(/_/g, " ")}</Text>
        </View>

        <View style={S.reportGrid}>
          {metrics.map((item) => (
            <View key={item.label} style={[S.reportTile, { backgroundColor: item.tint }]}>
              <Text style={[S.reportValue, { color: item.accent }]}>{item.value}</Text>
              <Text style={S.reportLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={S.panel}>
          <Text style={S.panelTitle}>Measured reach</Text>
          <Text style={S.fundingBig}>
            {report?.measuredReach == null
              ? "Not available"
              : number(report.measuredReach)}
          </Text>
          <Text style={S.bodyText}>
            {report?.metricsNote ||
              "No live advertising platform is connected. Estimated and measured results remain separate."}
          </Text>
        </View>

        <View style={S.notice}>
          <Text style={S.noticeTitle}>Know what these numbers mean</Text>
          <Text style={S.noticeCopy}>
            Estimated reach is not guaranteed. Funding completion does not mean advertising has launched.
          </Text>
        </View>
      </ScrollView>
    );
  };

  // ============================================================
  // HELP / INFORMATION
  // ============================================================

  const infoScreen = () => (
    <ScrollView contentContainerStyle={S.page}>
      <Header title={infoTitle} subtitle="Amplify · Help centre" back={() => setScreen("tabs")} />

      <View style={S.infoHero}>
        <View style={S.infoHeroIcon}>
          <Text style={{ color: C.white, fontSize: 26 }}>✦</Text>
        </View>
        <Text style={S.infoHeroTitle}>Good ideas deserve to travel.</Text>
        <Text style={S.infoHeroCopy}>
          Amplify helps communities fund distribution of campaign messages so they can reach audiences beyond existing networks.
        </Text>
      </View>

      <View style={S.panel}>
        <Text style={S.panelTitle}>{infoTitle}</Text>
        <Text style={S.bodyText}>
          Create a campaign, add its story and sources, choose an intended audience, and submit it for review.
        </Text>
        <Text style={S.bodyText}>
          Contributions support message distribution rather than directly funding the cause or creator.
        </Text>
        <Text style={S.bodyText}>
          Reach is estimated, not guaranteed. Review and advertising setup must be complete before promotion begins.
        </Text>
        <Text style={S.bodyText}>
          This prototype uses simulated checkout and demo account information. No real payments or advertising delivery occur.
        </Text>
      </View>

      <Button title="Back to home" onPress={() => goTab("Home")} />
    </ScrollView>
  );

  // ============================================================
  // CREATE LANDING TAB
  // ============================================================

  const createLanding = () => {
    const drafts = campaigns.filter(
      (c) => c.status === "draft" || c.status === "changes_requested"
    );

    return (
      <ScrollView contentContainerStyle={S.page}>
        <Header title="Create" subtitle="Turn your message into a campaign." />

        <View style={S.createLandingHero}>
          <View style={S.createLandingDecor} />
          <View style={S.createLandingIcon}>
            <Text style={{ fontSize: 28, color: C.purple }}>✳</Text>
          </View>
          <Text style={S.createLandingTitle}>Start with an idea.</Text>
          <Text style={S.createLandingCopy}>
            Tell your story, include reliable sources, design your message and choose an intended audience.
          </Text>
          <Button title="Create a campaign →" onPress={() => openCreate()} />
        </View>

        <View style={S.sectionHeader}>
          <Text style={S.sectionTitle}>Your saved drafts</Text>
          <Text style={S.small}>{drafts.length} drafts</Text>
        </View>

        {drafts.length === 0 ? (
          <View style={S.panel}>
            <Text style={S.panelTitle}>Nothing saved yet</Text>
            <Text style={S.bodyText}>
              Start a campaign and save your work to continue later.
            </Text>
          </View>
        ) : (
          drafts.map((campaign) => (
            <Pressable
              key={campaign.id}
              style={S.ownedRow}
              onPress={() => openCreate(campaign)}
            >
              <View style={S.ownedIcon}>
                <Text style={{ color: C.purple, fontWeight: "900" }}>✎</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={S.ownedTitle}>{campaign.title}</Text>
                <Text style={S.small}>{campaign.status.replace(/_/g, " ")}</Text>
              </View>
              <Text style={S.viewAllText}>Resume →</Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    );
  };

  const renderContent = () => {
    if (screen === "detail") return detailScreen();
    if (screen === "create") return createScreen();
    if (screen === "contribute") return contributeScreen();
    if (screen === "receipt") return receiptScreen();
    if (screen === "report") return reportScreen();
    if (screen === "info") return infoScreen();

    if (tab === "Home") return homeScreen();
    if (tab === "Explore") return exploreScreen();
    if (tab === "Create") return createLanding();
    if (tab === "Activity") return activityScreen();
    return profileScreen();
  };

  const tabs = [
    { name: "Home", icon: "⌂" },
    { name: "Explore", icon: "⌕" },
    { name: "Create", icon: "+" },
    { name: "Activity", icon: "◷" },
    { name: "Profile", icon: "○" },
  ];

  return (
    <SafeAreaView style={S.safe} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={{ flex: 1 }}>
        {loading && (
          <View style={S.loadingOverlay}>
            <View style={S.loadingCard}>
              <ActivityIndicator size="large" color={C.purple} />
              <Text style={S.loadingText}>Working on it…</Text>
            </View>
          </View>
        )}

        {renderContent()}
      </View>

      {screen === "tabs" && (
        <View style={S.bottomNav}>
          {tabs.map((item) => {
            const active = tab === item.name;
            return (
              <Pressable
                key={item.name}
                onPress={() => goTab(item.name)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={S.navItem}
              >
                <View style={[S.navIconWrap, active && S.navIconWrapActive]}>
                  <Text style={[S.navIcon, active && S.navIconActive]}>
                    {item.icon}
                  </Text>
                </View>
                <Text style={[S.navLabel, active && S.navLabelActive]}>
                  {item.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

// ============================================================
// VISUAL SYSTEM
// Mobile-first spacing, readable type, colourful accents,
// rounded surfaces and large touch targets.
// ============================================================

const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  page: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 17,
  },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  brandBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  brandLockup: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandIcon: {
    width: 45,
    height: 45,
    borderRadius: 16,
    backgroundColor: C.purple,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.purple,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 5,
  },
  brandIconText: {
    fontSize: 26,
    color: C.white,
    fontWeight: "900",
    fontStyle: "italic",
  },
  brandIconDot: {
    width: 7,
    height: 7,
    backgroundColor: C.yellow,
    borderRadius: 4,
    position: "absolute",
    right: 6,
    top: 6,
  },
  brandName: {
    fontSize: 24,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -1.2,
  },
  brandTagline: {
    fontSize: 9,
    color: C.muted,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginTop: 1,
  },
  profileButton: {
    width: 43,
    height: 43,
    borderRadius: 16,
    backgroundColor: C.lavender,
    borderWidth: 1,
    borderColor: "#DCD2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  profileButtonText: { fontSize: 16, fontWeight: "900", color: C.purple },

  hero: {
    backgroundColor: C.navy,
    borderRadius: 30,
    padding: 22,
    gap: 15,
    overflow: "hidden",
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.19,
    shadowRadius: 15,
    elevation: 5,
  },
  heroDecorOne: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 100,
    backgroundColor: C.purple,
    opacity: 0.24,
    right: -75,
    top: -60,
  },
  heroDecorTwo: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 60,
    backgroundColor: C.teal,
    opacity: 0.14,
    right: 35,
    top: 100,
  },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    paddingHorizontal: 11,
    paddingVertical: 8,
    backgroundColor: C.navySoft,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#4A456C",
  },
  heroPillDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.teal,
  },
  heroPillText: {
    color: "#DAD6FF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: C.white,
    fontSize: 38,
    lineHeight: 43,
    fontWeight: "900",
    letterSpacing: -1.6,
  },
  heroCopy: { color: "#D4D1E7", fontSize: 13, lineHeight: 21, maxWidth: 360 },
  heroActions: { flexDirection: "row", gap: 9, flexWrap: "wrap" },
  heroBottom: {
    borderTopWidth: 1,
    borderColor: "#494461",
    paddingTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroStat: { gap: 4 },
  heroStatNumber: { color: C.yellow, fontSize: 20, fontWeight: "900" },
  heroStatLabel: { color: "#D2CFE2", fontSize: 10, fontWeight: "700" },
  heroStatLine: { width: 1, height: 28, backgroundColor: "#494461" },

  button: {
    minHeight: 49,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: {
    backgroundColor: C.purple,
    shadowColor: C.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 3,
  },
  btnSecondary: {
    backgroundColor: C.lavender,
    borderWidth: 1,
    borderColor: "#DAD0FF",
  },
  btnOutline: { backgroundColor: C.white, borderWidth: 1, borderColor: C.line },
  btnGhost: { backgroundColor: "transparent" },
  btnCoral: { backgroundColor: C.yellow },
  buttonText: { fontSize: 12, fontWeight: "900", letterSpacing: 0.05 },

  estimateBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 21,
    padding: 14,
  },
  estimateIcon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.tealPale,
  },
  estimateTitle: { color: C.ink, fontSize: 13, fontWeight: "900" },
  estimateCopy: { color: C.muted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  estimateNumberWrap: {
    backgroundColor: C.yellowPale,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 13,
  },
  estimateNumber: { color: "#8A6200", fontSize: 20, fontWeight: "900" },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 8,
    marginTop: 3,
  },
  sectionKicker: {
    color: C.purple,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.25,
    marginBottom: 5,
  },
  sectionTitle: {
    color: C.ink,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  viewAll: {
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: C.lavender,
  },
  viewAllText: { color: C.purpleDark, fontSize: 11, fontWeight: "900" },

  campaignCard: {
    backgroundColor: C.white,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.line,
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.055,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 3,
  },
  campaignImageWrap: { height: 185, backgroundColor: C.lavender },
  campaignImage: { width: "100%", height: "100%" },
  imageShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#15132D",
    opacity: 0.12,
  },
  categoryBadge: {
    position: "absolute",
    top: 13,
    left: 13,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 11,
  },
  categoryBadgeText: { color: C.white, fontSize: 10, fontWeight: "900" },
  imageBottomTag: {
    position: "absolute",
    bottom: 12,
    left: 13,
    backgroundColor: "rgba(25,22,56,0.8)",
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  imageBottomTagText: {
    color: C.white,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  campaignBody: { padding: 16, gap: 10 },
  campaignTitle: {
    color: C.ink,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 24,
    letterSpacing: -0.45,
  },
  byline: { color: C.muted, fontSize: 11, lineHeight: 17 },
  campaignSummary: { color: "#55556D", fontSize: 12, lineHeight: 19 },
  moneyLarge: { color: C.ink, fontSize: 20, fontWeight: "900" },
  moneySmall: { color: C.purple, fontSize: 17, fontWeight: "900" },
  small: { color: C.muted, fontSize: 10, lineHeight: 15 },
  progressTrack: {
    width: "100%",
    height: 7,
    borderRadius: 9,
    backgroundColor: "#EBEAF2",
    overflow: "hidden",
    marginTop: 2,
  },
  progressFill: { height: "100%", borderRadius: 9 },
  reachMini: { flexDirection: "row", alignItems: "center", gap: 6 },
  reachDot: { width: 7, height: 7, borderRadius: 4 },
  miniAction: {
    backgroundColor: C.lavender,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  miniActionText: { color: C.purpleDark, fontSize: 11, fontWeight: "900" },

  howCard: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 25,
    padding: 19,
    gap: 16,
  },
  howCardHeader: { flexDirection: "row", alignItems: "center" },
  howTitle: { color: C.ink, fontSize: 22, fontWeight: "900", letterSpacing: -0.8 },
  howIcon: {
    width: 43,
    height: 43,
    backgroundColor: C.lavender,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  howRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  howNumberBox: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  howNumber: { fontSize: 13, fontWeight: "900" },
  howStepTitle: { color: C.ink, fontSize: 13, fontWeight: "900", marginBottom: 3 },
  howStepCopy: { color: C.muted, fontSize: 11, lineHeight: 17 },
  disclaimer: { color: C.muted, fontSize: 10, lineHeight: 16, marginTop: 4 },
  errorText: { color: C.danger, fontSize: 12, lineHeight: 18 },

  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 3 },
  back: {
    width: 43,
    height: 43,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
  },
  backText: { fontSize: 30, lineHeight: 32, color: C.ink, marginTop: -2 },
  headerTitle: { color: C.ink, fontSize: 26, fontWeight: "900", letterSpacing: -0.9 },
  headerSubtitle: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 3 },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 17,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  searchIcon: { fontSize: 24, color: C.purple },
  searchInput: { flex: 1, color: C.ink, fontSize: 13, paddingVertical: 12 },
  clearSearch: { color: C.muted, fontSize: 15, padding: 5 },
  label: { color: C.ink, fontSize: 11, fontWeight: "900", marginBottom: 3 },
  chip: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 24,
    paddingHorizontal: 13,
    paddingVertical: 10,
    backgroundColor: C.white,
    marginRight: 6,
    marginBottom: 5,
  },
  chipText: { fontSize: 10, color: C.muted, fontWeight: "800" },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", marginTop: 3 },
  sortRow: { flexDirection: "row", flexWrap: "wrap" },
  empty: { alignItems: "center", paddingVertical: 35, gap: 12 },
  emptyIcon: {
    width: 65,
    height: 65,
    backgroundColor: C.lavender,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCopy: { color: C.muted, fontSize: 12, lineHeight: 19, textAlign: "center" },

  detailImageWrap: { height: 225, borderRadius: 25, overflow: "hidden", backgroundColor: C.lavender },
  detailImage: { width: "100%", height: "100%" },
  detailImageShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#15132D",
    opacity: 0.12,
  },
  detailImageBadge: {
    position: "absolute",
    bottom: 13,
    left: 13,
    backgroundColor: C.white,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  detailImageBadgeText: { color: C.purpleDark, fontSize: 11, fontWeight: "900" },
  detailTitle: { color: C.ink, fontSize: 30, fontWeight: "900", lineHeight: 36, letterSpacing: -1 },
  storyIntro: { color: "#41415D", fontSize: 15, fontWeight: "600", lineHeight: 24 },
  storySection: { gap: 8, paddingVertical: 5 },
  subheading: { color: C.ink, fontSize: 15, fontWeight: "900" },
  bodyText: { color: "#5F6078", fontSize: 12, lineHeight: 20 },

  panel: {
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 17,
    borderWidth: 1,
    borderColor: C.line,
    gap: 12,
  },
  panelTitle: { color: C.ink, fontSize: 16, fontWeight: "900" },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderTopWidth: 1,
    borderColor: C.line,
    paddingTop: 12,
  },
  sourceIcon: {
    width: 35,
    height: 35,
    backgroundColor: C.lavender,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sourceTitle: { color: C.ink, fontSize: 12, fontWeight: "800" },
  sourceUrl: { color: C.purple, fontSize: 10, lineHeight: 15, marginTop: 3 },

  fundingPanel: {
    backgroundColor: C.navy,
    borderRadius: 24,
    padding: 19,
    gap: 11,
  },
  fundingPanelHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  fundingBig: { color: C.ink, fontSize: 30, fontWeight: "900", letterSpacing: -1 },
  muted: { color: C.muted, fontSize: 11, lineHeight: 17 },
  liveBadge: { backgroundColor: "#DDF8F2", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  liveBadgeText: { color: "#117C6D", fontSize: 11, fontWeight: "900" },
  metricDivider: { height: 1, backgroundColor: C.line, marginVertical: 4 },
  metricLabel: { color: "#AAA4CB", fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  metricText: { color: C.ink, fontSize: 12, fontWeight: "800", marginTop: 5 },

  notice: {
    backgroundColor: C.yellowPale,
    borderWidth: 1,
    borderColor: "#F4E3AA",
    borderRadius: 18,
    padding: 15,
    gap: 6,
  },
  noticeTitle: { color: "#795900", fontSize: 13, fontWeight: "900" },
  noticeCopy: { color: "#78643A", fontSize: 11, lineHeight: 18 },

  field: { gap: 7, marginTop: 7 },
  input: {
    borderWidth: 1,
    borderColor: "#E4E1EF",
    borderRadius: 15,
    backgroundColor: "#FBFAFE",
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: C.ink,
    fontSize: 13,
    minHeight: 49,
  },
  inputMultiline: { minHeight: 105, paddingTop: 13 },
  stepper: { flexDirection: "row", justifyContent: "space-between", gap: 4, marginVertical: 4 },
  stepItem: { flex: 1, alignItems: "center", gap: 6 },
  stepCircle: {
    width: 29,
    height: 29,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#DCD9E8",
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: { backgroundColor: C.purple, borderColor: C.purple },
  stepCircleDone: { backgroundColor: C.teal, borderColor: C.teal },
  stepCircleText: { color: C.muted, fontSize: 11, fontWeight: "900" },
  stepLabel: { color: C.muted, fontSize: 9, textAlign: "center", lineHeight: 13 },
  formPanel: {
    backgroundColor: C.white,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: C.line,
    padding: 16,
    gap: 14,
  },
  formTop: { gap: 9, marginBottom: 2 },
  formStepBadge: {
    alignSelf: "flex-start",
    backgroundColor: C.lavender,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  formStepBadgeText: { color: C.purpleDark, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  formTitle: { color: C.ink, fontSize: 23, fontWeight: "900", letterSpacing: -0.6 },
  sourceForm: {
    padding: 12,
    backgroundColor: C.bg,
    borderRadius: 16,
    gap: 8,
  },
  sourceFormTitle: { color: C.ink, fontSize: 12, fontWeight: "900" },
  adPreview: {
    backgroundColor: C.bg,
    borderRadius: 19,
    padding: 14,
    borderWidth: 1,
    borderColor: C.line,
    gap: 10,
  },
  adPreviewTop: { flexDirection: "row", alignItems: "center", gap: 9 },
  adPreviewIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.lavender,
    alignItems: "center",
    justifyContent: "center",
  },
  adPreviewBrand: { color: C.ink, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  adPreviewImage: { width: "100%", height: 140, borderRadius: 13 },
  adPreviewHeadline: { color: C.ink, fontSize: 17, fontWeight: "900" },
  adPreviewCta: {
    alignSelf: "flex-start",
    backgroundColor: C.purple,
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  adPreviewCtaText: { color: C.white, fontSize: 11, fontWeight: "900" },
  reachCard: {
    backgroundColor: C.tealPale,
    borderRadius: 19,
    padding: 16,
    gap: 7,
  },
  reachCardIcon: {
    width: 38,
    height: 38,
    backgroundColor: C.white,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  reachCardKicker: { color: "#168778", fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  reachCardNumber: { color: "#126F62", fontSize: 30, fontWeight: "900", letterSpacing: -1 },
  reviewCard: {
    backgroundColor: C.bg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    padding: 13,
    gap: 11,
  },
  reviewImage: { width: "100%", height: 140, borderRadius: 13 },
  reviewCategory: { alignSelf: "flex-start", backgroundColor: C.lavender, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9 },
  reviewCategoryText: { color: C.purpleDark, fontSize: 10, fontWeight: "900" },
  reviewTitle: { color: C.ink, fontSize: 22, fontWeight: "900", lineHeight: 28 },
  reviewStats: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  reviewAmount: { color: C.ink, fontSize: 16, fontWeight: "900", marginTop: 4 },
  checkRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  checkbox: { width: 23, height: 23, borderWidth: 1, borderColor: "#C5C1D6", borderRadius: 7, alignItems: "center", justifyContent: "center" },
  checkboxActive: { backgroundColor: C.purple, borderColor: C.purple },
  saveRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 9 },
  formActions: { flexDirection: "row", gap: 9 },

  checkoutHero: { backgroundColor: C.navy, borderRadius: 25, padding: 19, gap: 12 },
  checkoutIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: C.purple, alignItems: "center", justifyContent: "center" },
  checkoutTitle: { color: C.white, fontSize: 23, fontWeight: "900", lineHeight: 29 },
  checkoutCopy: { color: "#D2CEE4", fontSize: 12, lineHeight: 19 },
  checkoutProgress: { gap: 9, marginTop: 3 },
  checkoutSmall: { color: "#D6D2E9", fontSize: 10 },
  amountGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  amountOption: {
    flexGrow: 1,
    minWidth: "45%",
    minHeight: 65,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  amountOptionActive: { backgroundColor: C.lavender, borderColor: C.purple, borderWidth: 2 },
  amountText: { color: C.ink, fontSize: 16, fontWeight: "900" },
  amountSelectedLabel: { color: C.purple, fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  feeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10, paddingVertical: 6 },
  feeValue: { color: C.ink, fontSize: 12, fontWeight: "800" },
  totalLabel: { color: C.ink, fontSize: 13, fontWeight: "900" },
  totalAmount: { color: C.purple, fontSize: 21, fontWeight: "900" },

  receiptHero: { alignItems: "center", gap: 10, paddingVertical: 18 },
  receiptSuccess: { width: 75, height: 75, borderRadius: 26, backgroundColor: C.tealPale, alignItems: "center", justifyContent: "center" },
  receiptSuccessText: { color: "#0D8D78", fontSize: 35, fontWeight: "900" },
  receiptTitle: { color: C.ink, fontSize: 25, fontWeight: "900", textAlign: "center" },
  receiptCopy: { color: C.muted, fontSize: 12, lineHeight: 19, textAlign: "center" },
  receiptCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.line, borderRadius: 24, padding: 19, gap: 13 },
  receiptAmount: { color: C.purple, fontSize: 38, fontWeight: "900", letterSpacing: -1.2 },

  activityBanner: { backgroundColor: C.lavender, borderRadius: 21, padding: 16, flexDirection: "row", gap: 12, alignItems: "center" },
  activityBannerIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: C.white, alignItems: "center", justifyContent: "center" },
  activityBannerTitle: { color: C.ink, fontSize: 14, fontWeight: "900", marginBottom: 4 },
  activityCard: { flexDirection: "row", gap: 12, backgroundColor: C.white, borderRadius: 17, borderWidth: 1, borderColor: C.line, padding: 14 },
  activityMarker: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  activityTitle: { color: C.ink, fontSize: 13, fontWeight: "900", marginBottom: 4 },

  profileHero: { flexDirection: "row", alignItems: "center", gap: 13, padding: 17, borderRadius: 23, backgroundColor: C.white, borderWidth: 1, borderColor: C.line },
  profileAvatar: { width: 59, height: 59, borderRadius: 21, backgroundColor: C.purple, alignItems: "center", justifyContent: "center" },
  profileAvatarText: { color: C.white, fontSize: 18, fontWeight: "900" },
  avatarOnline: { width: 11, height: 11, backgroundColor: C.teal, borderRadius: 6, borderWidth: 2, borderColor: C.white, position: "absolute", right: -1, bottom: 0 },
  profileName: { color: C.ink, fontSize: 17, fontWeight: "900" },
  demoBadge: { alignSelf: "flex-start", marginTop: 6, backgroundColor: C.yellowPale, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 4 },
  demoBadgeText: { color: "#886300", fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
  statsGrid: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, borderRadius: 19, padding: 15, gap: 6 },
  statValue: { fontSize: 25, fontWeight: "900" },
  statLabel: { color: C.muted, fontSize: 10, lineHeight: 15 },
  ownedRow: { flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: C.white, borderRadius: 17, padding: 13, borderWidth: 1, borderColor: C.line },
  ownedIcon: { width: 39, height: 39, backgroundColor: C.lavender, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  ownedTitle: { color: C.ink, fontSize: 12, fontWeight: "900", lineHeight: 18 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: C.white, padding: 12, borderRadius: 15, borderWidth: 1, borderColor: C.line },
  infoIcon: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  infoIconText: { color: C.ink, fontSize: 16, fontWeight: "900" },
  rowArrow: { color: C.muted, fontSize: 23 },

  reportHero: { backgroundColor: C.navy, borderRadius: 23, padding: 20, gap: 10 },
  reportKicker: { color: C.yellow, fontSize: 9, fontWeight: "900", letterSpacing: 1.2 },
  reportTitle: { color: C.white, fontSize: 23, fontWeight: "900", lineHeight: 29 },
  reportStatus: { color: "#D6D2E9", fontSize: 10, fontWeight: "700" },
  reportGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  reportTile: { width: "48%", flexGrow: 1, minHeight: 100, borderRadius: 18, padding: 13, justifyContent: "center", gap: 7 },
  reportValue: { fontSize: 19, fontWeight: "900" },
  reportLabel: { color: C.muted, fontSize: 10, fontWeight: "700" },

  createLandingHero: { backgroundColor: C.lavender, borderRadius: 27, padding: 21, gap: 14, overflow: "hidden" },
  createLandingDecor: { position: "absolute", width: 130, height: 130, borderRadius: 70, backgroundColor: "#DCD1FF", right: -35, top: -35 },
  createLandingIcon: { width: 55, height: 55, backgroundColor: C.white, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  createLandingTitle: { color: C.ink, fontSize: 27, fontWeight: "900", letterSpacing: -0.9 },
  createLandingCopy: { color: "#5C587B", fontSize: 13, lineHeight: 21 },

  infoHero: { backgroundColor: C.navy, borderRadius: 25, padding: 22, gap: 13 },
  infoHeroIcon: { width: 49, height: 49, borderRadius: 16, backgroundColor: C.purple, alignItems: "center", justifyContent: "center" },
  infoHeroTitle: { color: C.white, fontSize: 25, fontWeight: "900", lineHeight: 31 },
  infoHeroCopy: { color: "#D5D1E8", fontSize: 12, lineHeight: 20 },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    backgroundColor: "rgba(246,245,251,0.76)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingCard: { backgroundColor: C.white, padding: 22, borderRadius: 20, gap: 12, alignItems: "center" },
  loadingText: { color: C.ink, fontSize: 12, fontWeight: "800" },

  bottomNav: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderColor: C.line,
    paddingTop: 8,
    paddingBottom: Platform.OS === "android" ? 7 : 5,
    paddingHorizontal: 4,
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.045,
    shadowRadius: 10,
    elevation: 8,
  },
  navItem: { flex: 1, minHeight: 49, alignItems: "center", justifyContent: "center", gap: 3 },
  navIconWrap: { minWidth: 40, minHeight: 27, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  navIconWrapActive: { backgroundColor: C.lavender },
  navIcon: { fontSize: 21, lineHeight: 25, color: "#9795AC", fontWeight: "700" },
  navIconActive: { color: C.purple, fontWeight: "900" },
  navLabel: { color: "#89879D", fontSize: 9, fontWeight: "700" },
  navLabelActive: { color: C.purpleDark, fontWeight: "900" },
});
