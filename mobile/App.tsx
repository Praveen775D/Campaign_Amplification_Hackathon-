// App.tsx - React Native mobile app for Amplify demo
// OVERVIEW: This is the main UI file. It contains the screens, user interactions,
// API calls, sample campaign data, and styles for the Campaign Amplification MVP.
// React hooks help the screen remember values (useState), run side effects (useEffect),
// and reuse functions/calculated values efficiently (useCallback/useMemo).
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator, Alert, Image, KeyboardAvoidingView, Linking, Platform,
  Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, Text,
  TextInput, View
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// Backend base URL. Set EXPO_PUBLIC_API_URL in the mobile .env file for your setup.
// 10.0.2.2 is commonly used by Android emulators to reach the host computer.
const API = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:5000/api";
// Options shown when users search or create campaigns.
const CATEGORIES = ["All","Environment","Health","Science","Education","Public Policy","Economic Policy","Community","Arts & Culture","Business","Other"];
const STEPS = ["Basics","Story","Campaign & Ad Visuals","Reach","Submit"];
// Helper: format a number as Indian rupees.
const money = (n:number) => "₹" + Math.round(Number(n || 0)).toLocaleString("en-IN");
// Demo estimate only: assumes about 18 impressions per rupee. It is not live ad data.
const estimateReach = (n:number) => Math.round(n * 18).toLocaleString("en-IN");
// TypeScript types describe the shape of data used by the app.
type Source = { title:string; url:string };
type Section = { heading:string; body:string };
type Campaign = {
  id:string; title:string; category:string; creatorName:string; summary:string; coverImage:string;
  storyIntro:string; storySections:Section[]; sources:Source[]; adHeadline:string; adDescription:string; cta:string;
  audienceLocation:string; audienceInterests:string[]; channels:string[]; durationDays:number;
  fundingGoal:number; raised:number; status:string; estimatedReach:number; adBudget:number; adSpend:number;
  impressions:number; clicks:number; measuredReach:number|null; backers:number; deadline:string;
};
type Draft = Partial<Campaign> & { id?:string; rulesAccepted?:boolean };
type Activity = {id:string; title:string; body:string; type:string; createdAt:string; campaignId?:string};
// Example campaigns let the UI display content even when the backend is unavailable.
// These are sample records, not proof of real campaigns or real advertising results.
const DEMO: Campaign[] = [
 {id:"camp-clean-rivers",title:"Cleaner rivers start with local action",category:"Environment",creatorName:"River Commons Collective",summary:"A practical community campaign sharing river cleanup data and ways residents can help reduce plastic waste.",coverImage:"https://images.unsplash.com/photo-1437482078695-73f5ca6c96e2?auto=format&fit=crop&w=1200&q=80",storyIntro:"Healthy rivers begin with visible information and small actions that communities can take together.",storySections:[{heading:"Why this matters",body:"Plastic waste can travel far beyond the place where it enters a waterway. Local monitoring and clear public information help communities understand where action is most useful."},{heading:"What this campaign will do",body:"This message campaign will promote a public explainer, share practical waste-reduction steps, and direct interested residents to local cleanup resources."}],sources:[{title:"UNEP — Plastic pollution",url:"https://www.unep.org/plastic-pollution"},{title:"Our World in Data — Plastic pollution",url:"https://ourworldindata.org/plastic-pollution"}],adHeadline:"Small actions. Cleaner rivers.",adDescription:"Explore practical steps for reducing river plastic waste.",cta:"Learn more",audienceLocation:"Hyderabad, Telangana",audienceInterests:["Environment","Community action"],channels:["Social feeds","Display"],durationDays:21,fundingGoal:50000,raised:32750,status:"available_for_funding",estimatedReach:900000,adBudget:45000,adSpend:0,impressions:0,clicks:0,measuredReach:null,backers:0,deadline:new Date(Date.now()+14*86400000).toISOString()},
 {id:"camp-rural-science",title:"Make science learning accessible everywhere",category:"Education",creatorName:"Open Learning Lab",summary:"Help a free science learning guide reach students and educators beyond existing school networks.",coverImage:"https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",storyIntro:"Curiosity is everywhere, but useful learning resources do not always reach every learner.",storySections:[{heading:"The opportunity",body:"Short, accessible science explainers can give students and educators a starting point for experiments, questions, and further learning."}],sources:[{title:"UNESCO — Education",url:"https://www.unesco.org/en/education"}],adHeadline:"Science belongs to everyone",adDescription:"Discover a free guide for curious learners.",cta:"Explore guide",audienceLocation:"India",audienceInterests:["Education","Science"],channels:["Social feeds"],durationDays:30,fundingGoal:35000,raised:16800,status:"available_for_funding",estimatedReach:630000,adBudget:31500,adSpend:0,impressions:0,clicks:0,measuredReach:null,backers:0,deadline:new Date(Date.now()+20*86400000).toISOString()},
 {id:"camp-public-health",title:"Clear health information saves time",category:"Health",creatorName:"Community Health Notes",summary:"Promote a plain-language guide that helps people prepare better questions for healthcare appointments.",coverImage:"https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",storyIntro:"Good information can help people have more confident conversations with qualified health professionals.",storySections:[{heading:"A clearer starting point",body:"This campaign shares a general appointment-preparation checklist and does not replace professional diagnosis or treatment."}],sources:[{title:"WHO — Health topics",url:"https://www.who.int/health-topics"}],adHeadline:"Prepare for your next health visit",adDescription:"A simple checklist for clearer conversations.",cta:"Read guide",audienceLocation:"India",audienceInterests:["Health education"],channels:["Social feeds","Display"],durationDays:14,fundingGoal:25000,raised:9200,status:"available_for_funding",estimatedReach:450000,adBudget:22500,adSpend:0,impressions:0,clicks:0,measuredReach:null,backers:0,deadline:new Date(Date.now()+9*86400000).toISOString()}
];

// One shared API helper for GET/POST/PUT requests. It parses JSON and throws
// an error for unsuccessful HTTP responses so each screen can show a message.
async function api<T>(path:string, options:RequestInit = {}):Promise<T> {
  const response = await fetch(`${API}${path}`, { ...options, headers:{ "Content-Type":"application/json", ...(options.headers || {}) } });
  const data = await response.json().catch(()=>({error:"The server returned an unreadable response."}));
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data as T;
}

// Central color palette used by the UI to keep screens visually consistent.
const colors = { bg:"#F5F7F4", ink:"#17251D", muted:"#68756C", green:"#674adf", pale:"#E6F3EB", line:"#DFE7E0", white:"#FFFFFF", orange:"#D97736", red:"#B84242" };

// Reusable button component so the same button styling can be used across screens.
function Button({title,onPress,kind="primary",disabled=false}: {title:string;onPress:()=>void;kind?:"primary"|"secondary"|"ghost";disabled?:boolean}) {
 return <Pressable onPress={onPress} disabled={disabled} style={({pressed})=>[styles.button,kind==="primary"?styles.buttonPrimary:kind==="secondary"?styles.buttonSecondary:styles.buttonGhost,disabled&&{opacity:.45},pressed&&{opacity:.8}]}>
   <Text style={[styles.buttonText,kind==="primary"?{color:"white"}:kind==="secondary"?{color:colors.green}:{color:colors.ink}]}>{title}</Text>
 </Pressable>;
}
// Reusable labeled text input. Supports normal text and multi-line fields.
function Field({label,value,onChangeText,placeholder,multiline=false,keyboardType,maxLength}:any) {
 return <View style={styles.fieldWrap}><Text style={styles.label}>{label}</Text><TextInput value={String(value ?? "")} onChangeText={onChangeText} placeholder={placeholder || ""} placeholderTextColor="#9AA39B" multiline={multiline} keyboardType={keyboardType} maxLength={maxLength} style={[styles.input,multiline&&styles.multiline]} textAlignVertical={multiline?"top":"center"}/></View>;
}
// Small selectable pill used for categories, interests, and sorting filters.
function Chip({label,selected,onPress}:any) {
 return <Pressable onPress={onPress} style={[styles.chip,selected&&styles.chipSelected]}><Text style={[styles.chipText,selected&&styles.chipTextSelected]}>{label}</Text></Pressable>;
}
// Visual progress bar; clamps the displayed width between 0% and 100%.
function Progress({value}: {value:number}) {
 return <View style={styles.progressTrack}><View style={[styles.progressFill,{width:`${Math.min(100,Math.max(0,value))}%`}]} /></View>;
}
// Reusable campaign preview card with image, summary, funding progress, and action.
function CampaignCard({campaign,onPress,onBack}: {campaign:Campaign;onPress:()=>void;onBack:()=>void}) {
 const progress = campaign.fundingGoal ? campaign.raised/campaign.fundingGoal*100 : 0;
 return <Pressable onPress={onPress} style={styles.campaignCard}>
  <Image source={{uri:campaign.coverImage}} style={styles.campaignImage} />
  <View style={styles.cardBody}>
   <View style={styles.rowBetween}><Text style={styles.eyebrow}>{campaign.category.toUpperCase()}</Text><Text style={styles.status}>{campaign.status.replaceAll("_"," ")}</Text></View>
   <Text style={styles.cardTitle}>{campaign.title}</Text>
   <Text style={styles.mutedText}>By {campaign.creatorName}</Text>
   <Text style={styles.summary} numberOfLines={2}>{campaign.summary}</Text>
   <View style={styles.rowBetween}><Text style={styles.amount}>{money(campaign.raised)} <Text style={styles.mutedText}>raised</Text></Text><Text style={styles.mutedText}>{Math.round(progress)}% of {money(campaign.fundingGoal)}</Text></View>
   <Progress value={progress}/>
   <View style={[styles.rowBetween,{marginTop:13}]}><View><Text style={styles.metricValue}>{Number(campaign.estimatedReach||0).toLocaleString("en-IN")}</Text><Text style={styles.tiny}>estimated reach at goal</Text></View><Pressable style={styles.miniButton} onPress={onBack}><Text style={styles.miniButtonText}>Back campaign ↗</Text></Pressable></View>
  </View>
 </Pressable>;
}

// Main application logic. State variables control the current tab, screen, campaign,
// form draft, contribution flow, activity, profile, and loading/error messages.
function MainApp() {
 const [tab,setTab] = useState("Home");
 const [campaigns,setCampaigns] = useState<Campaign[]>(DEMO);
 const [activity,setActivity] = useState<Activity[]>([]);
 const [screen,setScreen] = useState<"tabs"|"detail"|"create"|"contribute"|"receipt"|"report"|"info">("tabs");
 const [selected,setSelected] = useState<Campaign>(DEMO[0]);
 const [loading,setLoading] = useState(false);
 const [error,setError] = useState("");
 const [query,setQuery] = useState("");
 const [category,setCategory] = useState("All");
 const [sort,setSort] = useState("recent");
 const [draft,setDraft] = useState<Draft>({});
 const [step,setStep] = useState(0);
 const [autoSaved,setAutoSaved] = useState(false);
 const [saving,setSaving] = useState(false);
 const [rulesAccepted,setRulesAccepted] = useState(false);
 const [contribution,setContribution] = useState("250");
 const [receipt,setReceipt] = useState<any>(null);
 const [receiptCampaign,setReceiptCampaign] = useState<Campaign|null>(null);
 const [report,setReport] = useState<any>(null);
 const [profile,setProfile] = useState<any>(null);
 const [refreshing,setRefreshing] = useState(false);
 const [infoTitle,setInfoTitle] = useState("How it works");

 // Load campaigns, activity, and profile from the backend. If the request fails,
 // the sample DEMO campaigns remain visible and an error message is stored.
 const refresh = useCallback(async () => {
  setRefreshing(true); setError("");
  try {
   const [c,a,p] = await Promise.all([api<{campaigns:Campaign[]}>("/campaigns"),api<{activity:Activity[]}>("/activity"),api<any>("/profile")]);
   if(c.campaigns?.length) setCampaigns(c.campaigns);
   setActivity(a.activity || []); setProfile(p);
  } catch(e:any) { setError(e.message || "Couldn't connect to the API. Showing demo data."); }
  finally { setRefreshing(false); }
 },[]);
 useEffect(()=>{refresh();},[refresh]);

 // Search/filter/sort campaigns for the current screen. useMemo recalculates only
 // when one of its dependencies changes.
 const visibleCampaigns = useMemo(()=>{
  let rows=[...campaigns];
  if(tab==="Explore" || query) {
   const q=query.toLowerCase();
   rows=rows.filter(c=>(category==="All"||c.category===category) && (!q||[c.title,c.summary,c.creatorName,c.category].some(v=>String(v||"").toLowerCase().includes(q))));
   if(sort==="progress") rows.sort((a,b)=>b.raised/b.fundingGoal-a.raised/a.fundingGoal);
   if(sort==="ending") rows.sort((a,b)=>new Date(a.deadline||0).getTime()-new Date(b.deadline||0).getTime());
  }
  return rows.filter(c=>c.status==="available_for_funding"||c.status==="promoting"||c.status==="completed");
 },[campaigns,tab,query,category,sort]);

 // Navigation helpers: switch tabs, open a campaign, or start a new/editing draft.
 const goTab=(next:string)=>{setTab(next);setScreen("tabs");setError("");};
 const openCampaign=(c:Campaign)=>{setSelected(c);setScreen("detail");};
 const openCreate=(existing?:Campaign)=>{
  setDraft(existing?{...existing}:{title:"",category:"",creatorName:"Praveen Kumar",summary:"",coverImage:"",storyIntro:"",storySections:[{heading:"Why this matters",body:""}],sources:[{title:"",url:""}],adHeadline:"",adDescription:"",cta:"Learn more",audienceLocation:"India",audienceInterests:[],channels:["Social feeds"],durationDays:14,fundingGoal:10000,adBudget:9000});
  setStep(0);setRulesAccepted(false);setAutoSaved(false);setScreen("create");
 };
 const patchDraft=(key:string,value:any)=>setDraft(prev=>({...prev,[key]:value}));
 // Save a draft through the API. If the API is offline, keep the form usable and
 // tell the user the draft was not confirmed by the server.
 const saveDraft=useCallback(async (showMessage=false)=>{
  if(!draft.title && !draft.category && !draft.summary) { if(showMessage) Alert.alert("Add a little detail","Enter a title or summary before saving your draft."); return; }
  setSaving(true);
  try {
   let result:any;
   if(draft.id) result=await api<{campaign:Campaign}>(`/campaigns/${draft.id}`,{method:"PUT",body:JSON.stringify(draft)});
   else result=await api<{campaign:Campaign}>("/campaigns",{method:"POST",body:JSON.stringify({...draft,title:draft.title||"Untitled campaign",category:draft.category||"Other",creatorName:draft.creatorName||"Creator",fundingGoal:Number(draft.fundingGoal||10000),durationDays:Number(draft.durationDays||14),adBudget:Number(draft.adBudget||0)})});
   if(!draft.id) setDraft(result.campaign);setCampaigns(prev=>[result.campaign,...prev.filter(c=>c.id!==result.campaign.id)]);setAutoSaved(true);
   if(showMessage) Alert.alert("Draft saved","Your campaign draft is saved and can be resumed from Create or Profile.");
  } catch(e:any) {
   // Local editing remains usable when API is temporarily unavailable; user sees a clear message.
   setAutoSaved(true);
   if(showMessage) Alert.alert("Saved on this screen",`${e.message} Keep the app open and retry when the API is available.`);
  } finally {setSaving(false);}
 },[draft]);

 // Auto-save while creating/editing: wait 1.4 seconds after the last draft change.
 // Cleanup cancels the previous timer when the draft changes or screen is left.
 useEffect(()=>{
  if(screen!=="create") return;
  const timer=setTimeout(()=>{if(draft.title||draft.summary||draft.storyIntro) saveDraft(false);},1400);
  return ()=>clearTimeout(timer);
 },[draft,screen,saveDraft]);

 // Validate required fields before submitting a campaign for moderation/review.
 // Submission is not the same as approval or a live advertising launch.
 const submitDraft=async()=>{
  if(!draft.title?.trim()||draft.title.length>60||!draft.category||!draft.creatorName?.trim()) {Alert.alert("Complete Basics","Add a title (up to 60 characters), category and creator name.");setStep(0);return;}
  if((draft.storyIntro||"").trim().length<20) {Alert.alert("Add your story","Please write at least a short introductory story (20 characters or more).");setStep(1);return;}
  if(!(draft.sources||[]).some(s=>s.title.trim()&&/^https?:\/\//i.test(s.url))) {Alert.alert("Add a source","Add at least one source with a valid http(s) URL.");setStep(1);return;}
  if(!draft.adHeadline?.trim()) {Alert.alert("Add an ad headline","This helps people understand the message in placements.");setStep(2);return;}
  if(!draft.audienceLocation?.trim()) {Alert.alert("Choose an audience","Add the target location.");setStep(3);return;}
  if(!rulesAccepted) {Alert.alert("Confirmation required","Confirm the campaign rules before submitting.");setStep(4);return;}
  try {
   let current:any=draft;
   if(!draft.id) {const made=await api<{campaign:Campaign}>("/campaigns",{method:"POST",body:JSON.stringify({...draft,title:draft.title,category:draft.category,creatorName:draft.creatorName,fundingGoal:Number(draft.fundingGoal||10000),durationDays:Number(draft.durationDays||14),adBudget:Number(draft.adBudget||0)})});current=made.campaign;}
   else {const updated=await api<{campaign:Campaign}>(`/campaigns/${draft.id}`,{method:"PUT",body:JSON.stringify({...draft,fundingGoal:Number(draft.fundingGoal||10000),durationDays:Number(draft.durationDays||14),adBudget:Number(draft.adBudget||0)})});current=updated.campaign;}
   const result=await api<{campaign:Campaign}>(`/campaigns/${current.id}/submit`,{method:"POST",body:JSON.stringify({rulesAccepted:true})});
   setCampaigns(prev=>[result.campaign,...prev.filter(c=>c.id!==result.campaign.id)]);setDraft(result.campaign);setScreen("tabs");setTab("Activity");await refresh();
   Alert.alert("Submitted for review","Your campaign is now in review. Approval is required before it can receive contributions, and funding does not automatically start advertising.");
  } catch(e:any) {Alert.alert("Couldn't submit",e.message || "Please check your connection and try again.");}
 };

 // Open the contribution screen for the currently selected campaign.
 const backCampaign=async()=>{
  setContribution("250");setScreen("contribute");
 };
 // Process a simulated contribution through the backend. No real payment provider
 // is connected in this demo.
 const doContribution=async()=>{
  const amount=Number(contribution);
  if(!Number.isFinite(amount)||amount<50||amount>100000){Alert.alert("Check amount","Choose an amount between ₹50 and ₹1,00,000.");return;}
  try {
   const result=await api<{receipt:any;campaign:Campaign}>(`/campaigns/${selected.id}/contributions`,{method:"POST",body:JSON.stringify({amount,simulate:"success"})});
   setReceipt(result.receipt);setReceiptCampaign(result.campaign);setSelected(result.campaign);setCampaigns(prev=>prev.map(c=>c.id===result.campaign.id?result.campaign:c));setScreen("receipt");await refresh();
  } catch(e:any) {Alert.alert("Payment not completed",e.message || "The simulated payment could not be completed.");}
 };
 // Fetch a campaign report; if unavailable, show a clearly labeled demo report.
 const openReport=async(c:Campaign)=>{
  setSelected(c);setScreen("report");
  try {const r=await api<{report:any}>(`/campaigns/${c.id}/report`);setReport(r.report);} catch {setReport({title:c.title,fundsRaised:c.raised,fundingGoal:c.fundingGoal,estimatedReach:c.estimatedReach,adSpend:c.adSpend||0,impressions:c.impressions||0,clicks:c.clicks||0,measuredReach:c.measuredReach,metricsNote:"Demo report: no live advertising platform is connected."});}
 };

 // Shared screen header with optional back button.
 const header=(title:string,subtitle?:string,back?:()=>void)=><View style={styles.screenHeader}>{back&&<Pressable onPress={back} style={styles.backButton}><Text style={styles.backText}>‹</Text></Pressable>}<View style={{flex:1}}><Text style={styles.screenTitle}>{title}</Text>{subtitle&&<Text style={styles.screenSubtitle}>{subtitle}</Text>}</View></View>;
 // Home-page hero section with primary actions and an illustrative reach estimate.
 const hero=()=> <View style={styles.hero}>
  <View style={styles.heroPill}><View style={styles.liveDot}/><Text style={styles.heroPillText}>COMMUNITY-POWERED REACH</Text></View>
  <Text style={styles.heroTitle}>Good messages{'\n'}deserve to travel.</Text>
  <Text style={styles.heroCopy}>Bring people together to help important ideas reach audiences beyond their existing networks.</Text>
  <View style={styles.heroActions}><View style={{flex:1}}><Button title="Explore campaigns" onPress={()=>goTab("Explore")}/></View><View style={{flex:1}}><Button title="Start a campaign" kind="secondary" onPress={()=>openCreate()}/></View></View>
  <View style={styles.heroEstimate}><Text style={styles.heroEstimateNumber}>~18</Text><View style={{flex:1}}><Text style={styles.heroEstimateTitle}>estimated impressions per ₹1</Text><Text style={styles.heroEstimateSub}>Illustrative model only — actual delivery varies.</Text></View></View>
 </View>;

 // HOME: introduces Amplify and highlights a few campaigns.
 const homeScreen=()=> <ScrollView contentContainerStyle={styles.page} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh}/>}>
  <View style={styles.brandBar}>
   <View style={styles.brandLockup}>
    <View style={styles.brandMark}><Text style={styles.brandMarkText}>A</Text></View>
    <View><Text style={styles.brandName}>amplify</Text><Text style={styles.brandTagline}>Ideas worth sharing</Text></View>
   </View>
   <Pressable accessibilityRole="button" accessibilityLabel="Open profile" onPress={()=>goTab("Profile")} style={styles.brandProfile}>
    <Text style={styles.brandProfileText}>P</Text>
   </Pressable>
  </View>
  {hero()}
  <View style={styles.sectionHeading}><Text style={styles.h2}>Campaigns to explore</Text><Pressable onPress={()=>goTab("Explore")}><Text style={styles.link}>View all →</Text></Pressable></View>
  {visibleCampaigns.slice(0,3).map(c=><CampaignCard key={c.id} campaign={c} onPress={()=>openCampaign(c)} onBack={()=>{setSelected(c);backCampaign();}}/>)}
  <View style={styles.howCard}><Text style={styles.eyebrow}>SIMPLE BY DESIGN</Text><Text style={styles.h2}>Create. Review. Amplify.</Text><View style={styles.howRow}>{[{n:"01",t:"Create",d:"Tell the story and add sources."},{n:"02",t:"Review",d:"Check content, assets and targeting."},{n:"03",t:"Amplify",d:"Community funding supports distribution."}].map(x=><View key={x.n} style={styles.howStep}><Text style={styles.howNum}>{x.n}</Text><Text style={styles.howTitle}>{x.t}</Text><Text style={styles.tiny}>{x.d}</Text></View>)}</View><Text style={styles.disclaimer}>Contributions pay for message distribution, not direct support for the cause.</Text></View>
  {error!==""&&<Text style={styles.errorText}>{error}</Text>}
 </ScrollView>;

 // EXPLORE: search campaigns, filter by category, and sort results.
 const exploreScreen=()=> <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh}/>}>
  {header("Explore","Find a message worth amplifying")}
  <TextInput value={query} onChangeText={setQuery} placeholder="Search campaigns, topics or creators" placeholderTextColor="#9AA39B" style={styles.searchInput}/>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:14}}>{CATEGORIES.map(c=><Chip key={c} label={c} selected={category===c} onPress={()=>setCategory(c)}/>)}</ScrollView>
  <View style={styles.rowBetween}><Text style={styles.h2}>{visibleCampaigns.length} campaigns</Text><View style={{flexDirection:"row",gap:6}}><Chip label="Recent" selected={sort==="recent"} onPress={()=>setSort("recent")}/><Chip label="Progress" selected={sort==="progress"} onPress={()=>setSort("progress")}/><Chip label="Ending" selected={sort==="ending"} onPress={()=>setSort("ending")}/></View></View>
  {visibleCampaigns.map(c=><CampaignCard key={c.id} campaign={c} onPress={()=>openCampaign(c)} onBack={()=>{setSelected(c);backCampaign();}}/>)}
  {visibleCampaigns.length===0&&<View style={styles.empty}><Text style={styles.emptyIcon}>⌕</Text><Text style={styles.h2}>No campaigns found</Text><Text style={styles.mutedText}>Try a different search or category.</Text><Button title="Clear filters" kind="secondary" onPress={()=>{setQuery("");setCategory("All");}}/></View>}
 </ScrollView>;

 // CAMPAIGN DETAILS: story, sources, audience, funding status, and available actions.
 const detailScreen=()=> <ScrollView contentContainerStyle={styles.page} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh}/>}>
  {header("Campaign story","Read the message and its sources",()=>setScreen("tabs"))}
  <Image source={{uri:selected.coverImage}} style={styles.detailImage}/>
  <Text style={styles.eyebrow}>{selected.category.toUpperCase()} · CAMPAIGN</Text>
  <Text style={styles.detailTitle}>{selected.title}</Text>
  <Text style={styles.mutedText}>By {selected.creatorName} · Demo campaign</Text>
  <Text style={styles.storyIntro}>{selected.storyIntro||selected.summary}</Text>
  {(selected.storySections||[]).map((s,i)=><View key={i} style={styles.storySection}><Text style={styles.h2}>{s.heading}</Text><Text style={styles.bodyText}>{s.body}</Text></View>)}
  <View style={styles.card}><Text style={styles.h2}>Supporting sources</Text>{(selected.sources||[]).map((s,i)=><Pressable key={i} onPress={()=>Linking.openURL(s.url)} style={styles.sourceRow}><Text style={styles.sourceIcon}>↗</Text><View style={{flex:1}}><Text style={styles.sourceTitle}>{s.title}</Text><Text style={styles.linkSmall}>{s.url}</Text></View></Pressable>)}{(!selected.sources||!selected.sources.length)&&<Text style={styles.mutedText}>No sources have been added yet.</Text>}</View>
  <View style={styles.card}><Text style={styles.h2}>Funding & reach</Text><View style={styles.rowBetween}><View><Text style={styles.metricValue}>{money(selected.raised)}</Text><Text style={styles.tiny}>raised so far</Text></View><View style={{alignItems:"flex-end"}}><Text style={styles.metricValue}>{money(selected.fundingGoal)}</Text><Text style={styles.tiny}>funding goal</Text></View></View><Progress value={selected.raised/selected.fundingGoal*100}/><View style={styles.rowBetween}><Text style={styles.mutedText}>{Math.round(selected.raised/selected.fundingGoal*100)}% funded</Text><Text style={styles.mutedText}>{Number(selected.estimatedReach||0).toLocaleString("en-IN")} estimated reach at goal</Text></View><Text style={styles.disclaimer}>Estimates are not guarantees. Funding completion does not automatically launch advertising.</Text></View>
  <View style={styles.card}><Text style={styles.h2}>Intended audience</Text><Text style={styles.bodyText}>Location: {selected.audienceLocation||"Not specified"}</Text><Text style={styles.bodyText}>Interests: {(selected.audienceInterests||[]).join(", ")||"Broad audience"}</Text><Text style={styles.bodyText}>Channels: {(selected.channels||[]).join(", ")||"To be determined in review"}</Text><Text style={styles.bodyText}>Duration: {selected.durationDays} days</Text></View>
  <View style={styles.card}><Text style={styles.h2}>Where your contribution goes</Text><Text style={styles.bodyText}>Your contribution supports the cost of distributing this campaign message to a wider audience. It is not a direct donation to the cause or creator.</Text><Text style={styles.bodyText}>Demo fee model: 5% platform fee + 2% transaction fee. Unspent-fund and refund handling would be finalized under campaign policies before a real launch.</Text></View>
  <View style={styles.actionStack}><Button title="Back this campaign" onPress={backCampaign}/><Button title="View distribution report" kind="secondary" onPress={()=>openReport(selected)}/><Button title="Share campaign" kind="ghost" onPress={()=>Alert.alert("Share campaign",`Campaign link: amplify.demo/campaign/${selected.id}`)}/></View>
 </ScrollView>;

 // CREATE CAMPAIGN: five-step form for basics, story/sources, ad creative, audience,
 // and final review. Validation happens in submitDraft().
 const createScreen=()=> <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==="ios"?"padding":undefined}>
  <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
   {header("Create a campaign","Your draft saves as you work",()=>setScreen("tabs"))}
   <View style={styles.stepper}>{STEPS.map((s,i)=><Pressable key={s} onPress={()=>{if(i<step)setStep(i);}} style={styles.stepperItem}><View style={[styles.stepCircle,i===step&&styles.stepCircleActive,i<step&&styles.stepCircleDone]}><Text style={[styles.stepCircleText,(i===step||i<step)&&{color:"white"}]}>{i<step?"✓":i+1}</Text></View><Text style={[styles.stepLabel,i===step&&{color:colors.green,fontWeight:"800"}]}>{s}</Text></Pressable>)}</View>
   <View style={styles.stepCard}><Text style={styles.eyebrow}>STEP {step+1} OF 5</Text><Text style={styles.h2}>{STEPS[step]}</Text>
   {step===0&&<>
    <Text style={styles.bodyText}>Describe the message you want more people to see. The start of your title may be used as an ad headline.</Text>
    <Field label="Campaign title *" value={draft.title} onChangeText={(v:string)=>patchDraft("title",v)} placeholder="A clear, specific headline" maxLength={60}/><Text style={styles.tiny}>{(draft.title||"").length}/60 characters</Text>
    <Text style={styles.label}>Category *</Text><View style={styles.chipWrap}>{CATEGORIES.filter(c=>c!=="All").map(c=><Chip key={c} label={c} selected={draft.category===c} onPress={()=>patchDraft("category",c)}/>)}</View>
    <Field label="Creator / organization name *" value={draft.creatorName} onChangeText={(v:string)=>patchDraft("creatorName",v)} placeholder="Who is behind this message?"/>
    <Field label="Short summary" value={draft.summary} onChangeText={(v:string)=>patchDraft("summary",v)} placeholder="What should people understand?" multiline/>
    <Field label="Cover image URL (optional)" value={draft.coverImage} onChangeText={(v:string)=>patchDraft("coverImage",v)} placeholder="https://…"/>
   </>}
   {step===1&&<>
    <Text style={styles.bodyText}>Write like a clear article. Keep sources visible to the audience. At least one credible source is required to submit.</Text>
    <Field label="Story introduction *" value={draft.storyIntro} onChangeText={(v:string)=>patchDraft("storyIntro",v)} placeholder="Introduce the message and why it matters…" multiline/>
    <Field label="Section heading" value={draft.storySections?.[0]?.heading||""} onChangeText={(v:string)=>patchDraft("storySections",[{...(draft.storySections?.[0]||{}),heading:v,body:draft.storySections?.[0]?.body||""}])} placeholder="What people should know"/>
    <Field label="Story section" value={draft.storySections?.[0]?.body||""} onChangeText={(v:string)=>patchDraft("storySections",[{...(draft.storySections?.[0]||{}),heading:draft.storySections?.[0]?.heading||"What people should know",body:v}])} placeholder="Add context and useful details…" multiline/>
    <Field label="Source title *" value={draft.sources?.[0]?.title||""} onChangeText={(v:string)=>patchDraft("sources",[{...(draft.sources?.[0]||{}),title:v,url:draft.sources?.[0]?.url||""}])} placeholder="Publisher or report name"/>
    <Field label="Source URL *" value={draft.sources?.[0]?.url||""} onChangeText={(v:string)=>patchDraft("sources",[{...(draft.sources?.[0]||{}),title:draft.sources?.[0]?.title||"",url:v}])} placeholder="https://example.org/source"/>
    <Button title="＋ Add another source" kind="secondary" onPress={()=>patchDraft("sources",[...(draft.sources||[]),{title:"",url:""}])}/>
    {(draft.sources||[]).slice(1).map((s,i)=><View key={i} style={styles.nestedCard}><Field label={`Source ${i+2} title`} value={s.title} onChangeText={(v:string)=>patchDraft("sources",(draft.sources||[]).map((x,j)=>j===i+1?{...x,title:v}:x))} placeholder="Source title"/><Field label="Source URL" value={s.url} onChangeText={(v:string)=>patchDraft("sources",(draft.sources||[]).map((x,j)=>j===i+1?{...x,url:v}:x))} placeholder="https://…"/></View>)}
   </>}
   {step===2&&<>
    <Text style={styles.bodyText}>Your editorial story and advertising creative serve different purposes. These are demo creative settings; no ad network is connected.</Text>
    <Field label="Ad headline *" value={draft.adHeadline} onChangeText={(v:string)=>patchDraft("adHeadline",v)} placeholder="Short message for an ad" maxLength={60}/>
    <Field label="Ad description" value={draft.adDescription} onChangeText={(v:string)=>patchDraft("adDescription",v)} placeholder="One line that invites people to learn more" multiline maxLength={180}/>
    <Field label="Call to action" value={draft.cta} onChangeText={(v:string)=>patchDraft("cta",v)} placeholder="Learn more"/>
    <Field label="Advertising image URL (optional)" value={draft.coverImage} onChangeText={(v:string)=>patchDraft("coverImage",v)} placeholder="Reuse cover or paste image URL"/>
    <View style={styles.adPreview}><Text style={styles.eyebrow}>PLACEMENT PREVIEW · DEMO</Text><Text style={styles.adPreviewTitle}>{draft.adHeadline||draft.title||"Your ad headline"}</Text><Text style={styles.bodyText}>{draft.adDescription||draft.summary||"Your short ad description appears here."}</Text><Text style={styles.miniButtonText}>{draft.cta||"Learn more"} ↗</Text></View>
   </>}
   {step===3&&<>
    <Text style={styles.bodyText}>Choose an intended audience. Final settings may change during review. Estimated reach is not guaranteed.</Text>
    <Field label="Target location *" value={draft.audienceLocation} onChangeText={(v:string)=>patchDraft("audienceLocation",v)} placeholder="e.g. Hyderabad, Telangana"/>
    <Text style={styles.label}>Audience interests</Text><View style={styles.chipWrap}>{["Environment","Education","Health","Science","Community","Arts","Business","Public policy","Families","Students"].map(c=><Chip key={c} label={c} selected={(draft.audienceInterests||[]).includes(c)} onPress={()=>patchDraft("audienceInterests",(draft.audienceInterests||[]).includes(c)?(draft.audienceInterests||[]).filter(x=>x!==c):[...(draft.audienceInterests||[]),c])}/>)}</View>
    <Text style={styles.label}>Distribution channels</Text><View style={styles.chipWrap}>{["Social feeds","Display","Video"].map(c=><Chip key={c} label={c} selected={(draft.channels||[]).includes(c)} onPress={()=>patchDraft("channels",(draft.channels||[]).includes(c)?(draft.channels||[]).filter(x=>x!==c):[...(draft.channels||[]),c])}/>)}</View>
    <Field label="Campaign duration (days)" value={String(draft.durationDays??14)} onChangeText={(v:string)=>patchDraft("durationDays",Math.max(1,Math.min(90,Number(v)||1)))} keyboardType="numeric"/>
    <Field label="Proposed advertising budget (₹)" value={String(draft.adBudget??9000)} onChangeText={(v:string)=>patchDraft("adBudget",Math.max(0,Number(v)||0))} keyboardType="numeric"/>
    <View style={styles.reachBox}><Text style={styles.metricValue}>~{estimateReach(Number(draft.adBudget||0))}</Text><Text style={styles.tiny}>estimated impressions based on a demo assumption of 18 per ₹1; not guaranteed reach</Text></View>
   </>}
   {step===4&&<>
    <Text style={styles.bodyText}>Review your campaign details before sending it for moderation. Your funding goal is set here by you; it is never automatically overwritten.</Text>
    <View style={styles.previewCard}>{draft.coverImage?<Image source={{uri:draft.coverImage}} style={styles.previewImage}/>:null}<Text style={styles.eyebrow}>{draft.category||"CATEGORY"}</Text><Text style={styles.detailTitle}>{draft.title||"Untitled campaign"}</Text><Text style={styles.mutedText}>By {draft.creatorName||"Creator"}</Text><Text style={styles.bodyText}>{draft.summary||draft.storyIntro||"Campaign summary preview."}</Text><Text style={styles.h2}>Story</Text><Text style={styles.bodyText}>{draft.storyIntro||"No story added yet."}</Text><Text style={styles.h2}>Sources ({(draft.sources||[]).filter(s=>s.title&&s.url).length})</Text>{(draft.sources||[]).filter(s=>s.title&&s.url).map((s,i)=><Text key={i} style={styles.linkSmall}>{s.title} · {s.url}</Text>)}<Text style={styles.h2}>Ad creative</Text><Text style={styles.bodyText}>{draft.adHeadline||"No headline added"}</Text><Text style={styles.h2}>Audience</Text><Text style={styles.bodyText}>{draft.audienceLocation||"Not set"} · {(draft.channels||[]).join(", ")}</Text><Text style={styles.h2}>Funding goal</Text><Text style={styles.metricValue}>{money(Number(draft.fundingGoal||10000))}</Text><Text style={styles.tiny}>Proposed ad budget: {money(Number(draft.adBudget||0))} · ~{estimateReach(Number(draft.adBudget||0))} estimated impressions</Text></View>
    <Pressable onPress={()=>setRulesAccepted(!rulesAccepted)} style={styles.checkRow}><View style={[styles.checkbox,rulesAccepted&&styles.checkboxChecked]}>{rulesAccepted&&<Text style={{color:"white"}}>✓</Text>}</View><Text style={styles.bodyText}>I confirm this campaign follows the platform rules, includes accurate sources, and may be reviewed before it is eligible for funding.</Text></Pressable>
    <Text style={styles.disclaimer}>Submission is not approval. Contributions support message distribution, not the cause directly. Funding completion does not automatically launch ads.</Text>
   </>}
   <View style={styles.rowBetween}><Button title="Save draft" kind="secondary" onPress={()=>saveDraft(true)}/><Text style={styles.tiny}>{saving?"Saving…":autoSaved?"✓ Auto-saved":"Auto-save on"}</Text></View>
   <View style={styles.rowBetween}>{step>0&&<View style={{flex:1}}><Button title="← Back" kind="ghost" onPress={()=>setStep(s=>Math.max(0,s-1))}/></View>}<View style={{flex:1}}>{step<4?<Button title="Continue →" onPress={()=>setStep(s=>Math.min(4,s+1))}/>:<Button title="Submit for review" onPress={submitDraft}/>}</View></View>
   {step===4&&<Button title="Preview campaign page" kind="ghost" onPress={()=>Alert.alert(draft.title||"Campaign preview",`${draft.summary||draft.storyIntro||""}\n\nFunding goal: ${money(Number(draft.fundingGoal||10000))}\n\nThis preview is a draft; it has not been published.`)}/>}
   </View>
  </ScrollView>
 </KeyboardAvoidingView>;

 // CONTRIBUTION CHECKOUT: calculate demo fees and show a simulated payment action.
 const contributeScreen=()=> {
  const amount=Number(contribution)||0, platformFee=Math.round(amount*.05),transactionFee=Math.round(amount*.02),total=amount+platformFee+transactionFee;
  return <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
   {header("Back this campaign","Support message distribution",()=>setScreen("detail"))}
   <View style={styles.card}><Text style={styles.eyebrow}>{selected.category.toUpperCase()}</Text><Text style={styles.h2}>{selected.title}</Text><Text style={styles.mutedText}>By {selected.creatorName}</Text><Text style={styles.bodyText}>{selected.summary}</Text><Progress value={selected.raised/selected.fundingGoal*100}/><Text style={styles.mutedText}>{money(selected.raised)} raised of {money(selected.fundingGoal)}</Text></View>
   <Text style={styles.h2}>Choose a contribution</Text><Text style={styles.mutedText}>Your contribution helps pay for promotion so more people can see this message.</Text>
   <View style={styles.amountGrid}>{[100,250,500,1000].map(n=><Pressable key={n} onPress={()=>setContribution(String(n))} style={[styles.amountOption,String(n)===contribution&&styles.amountOptionSelected]}><Text style={[styles.amountOptionText,String(n)===contribution&&{color:colors.green}]}>{money(n)}</Text></Pressable>)}</View>
   <Field label="Custom amount (₹)" value={contribution} onChangeText={setContribution} keyboardType="numeric" placeholder="Enter amount"/>
   <View style={styles.reachBox}><Text style={styles.metricValue}>~{estimateReach(Math.max(0,amount))}</Text><Text style={styles.tiny}>estimated impressions associated with this amount, using the demo model</Text></View>
   <View style={styles.card}><Text style={styles.h2}>Review contribution</Text><View style={styles.feeRow}><Text style={styles.mutedText}>Contribution to distribution</Text><Text style={styles.bodyText}>{money(amount)}</Text></View><View style={styles.feeRow}><Text style={styles.mutedText}>Platform fee (5%)</Text><Text style={styles.bodyText}>{money(platformFee)}</Text></View><View style={styles.feeRow}><Text style={styles.mutedText}>Transaction fee (2%)</Text><Text style={styles.bodyText}>{money(transactionFee)}</Text></View><View style={[styles.feeRow,{borderTopWidth:1,borderColor:colors.line,paddingTop:12}]}><Text style={styles.h2}>Total (simulated)</Text><Text style={styles.h2}>{money(total)}</Text></View><Text style={styles.disclaimer}>No real payment is taken. Backer name is private by default. Actual reach varies and is not guaranteed.</Text></View>
   <Button title={`Simulate successful payment · ${money(total)}`} onPress={doContribution}/>
   <Button title="Cancel" kind="ghost" onPress={()=>setScreen("detail")}/>
  </ScrollView>;
 };

 // RECEIPT: shows the result returned by the simulated contribution flow.
 const receiptScreen=()=> <ScrollView contentContainerStyle={styles.page}>
  <View style={styles.successIcon}><Text style={{fontSize:34,color:colors.green}}>✓</Text></View><Text style={[styles.screenTitle,{textAlign:"center"}]}>Contribution confirmed</Text><Text style={[styles.mutedText,{textAlign:"center"}]}>This is a simulated payment. No real money was collected.</Text>
  <View style={styles.receiptCard}><Text style={styles.eyebrow}>RECEIPT · {receipt?.id||"DEMO"}</Text><Text style={styles.receiptAmount}>{money(receipt?.total||0)}</Text><Text style={styles.mutedText}>Total simulated payment</Text><View style={styles.feeRow}><Text style={styles.mutedText}>Contribution</Text><Text style={styles.bodyText}>{money(receipt?.amount||0)}</Text></View><View style={styles.feeRow}><Text style={styles.mutedText}>Fees</Text><Text style={styles.bodyText}>{money((receipt?.platformFee||0)+(receipt?.transactionFee||0))}</Text></View><View style={styles.feeRow}><Text style={styles.mutedText}>Campaign</Text><Text style={[styles.bodyText,{flex:1,textAlign:"right"}]}>{receipt?.campaignTitle}</Text></View><View style={styles.feeRow}><Text style={styles.mutedText}>Estimated impressions</Text><Text style={styles.bodyText}>{Number(receipt?.estimatedReach||0).toLocaleString("en-IN")}</Text></View></View>
  {receiptCampaign&&<View style={styles.card}><Text style={styles.h2}>Campaign progress updated</Text><Text style={styles.bodyText}>{money(receiptCampaign.raised)} raised of {money(receiptCampaign.fundingGoal)}.</Text><Progress value={receiptCampaign.raised/receiptCampaign.fundingGoal*100}/></View>}
  <Button title="View campaign" onPress={()=>{if(receiptCampaign)setSelected(receiptCampaign);setScreen("detail");}}/><Button title="Done" kind="secondary" onPress={()=>goTab("Activity")}/>
 </ScrollView>;

 // ACTIVITY: displays in-app demo updates and links back to related campaigns.
 const activityScreen=()=> <ScrollView contentContainerStyle={styles.page} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh}/>}>
  {header("Activity","Updates from campaigns you care about")}
  {activity.length===0?<View style={styles.empty}><Text style={styles.h2}>You're all caught up</Text><Text style={styles.mutedText}>Campaign submissions, contribution receipts and milestones will appear here.</Text></View>:activity.map(a=><View key={a.id} style={styles.activityItem}><View style={styles.activityDot}/><View style={{flex:1}}><Text style={styles.activityTitle}>{a.title}</Text><Text style={styles.bodyText}>{a.body}</Text><Text style={styles.tiny}>{new Date(a.createdAt).toLocaleString()}</Text>{a.campaignId&&<Pressable onPress={()=>{const c=campaigns.find(x=>x.id===a.campaignId);if(c)openCampaign(c);}}><Text style={styles.linkSmall}>View campaign →</Text></Pressable>}</View></View>)}
  <Text style={styles.disclaimer}>Notifications are in-app demo events. Push and email delivery are not configured.</Text>
 </ScrollView>;

 // PROFILE: displays demo account details, campaign work, and help/information links.
 const profileScreen=()=> <ScrollView contentContainerStyle={styles.page} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh}/>}>
  {header("Profile","Your campaigns and contributions")}
  <View style={styles.profileHero}><View style={styles.avatar}><Text style={styles.avatarText}>PK</Text></View><View style={{flex:1}}><Text style={styles.h2}>{profile?.user?.name||"Praveen Kumar"}</Text><Text style={styles.mutedText}>{profile?.user?.email||"praveen.demo@example.com"}</Text><Text style={styles.tiny}>Demo account · backer names private by default</Text></View></View>
  <View style={styles.statsRow}><View style={styles.statCard}><Text style={styles.metricValue}>{profile?.counts?.created??campaigns.filter(c=>c.status==="draft"||c.status==="submitted_for_review").length}</Text><Text style={styles.tiny}>Campaigns</Text></View><View style={styles.statCard}><Text style={styles.metricValue}>{profile?.counts?.backed??0}</Text><Text style={styles.tiny}>Contributions</Text></View></View>
  <Text style={styles.h2}>Your campaign work</Text>
  {campaigns.filter(c=>c.status==="draft"||c.status==="submitted_for_review"||c.status==="changes_requested"||c.creatorName==="Praveen Kumar").map(c=><Pressable key={c.id} style={styles.listRow} onPress={()=>c.status==="draft"||c.status==="changes_requested"?openCreate(c):openReport(c)}><View style={{flex:1}}><Text style={styles.cardTitle}>{c.title}</Text><Text style={styles.tiny}>{c.status.replaceAll("_"," ")} · {money(c.raised)} raised</Text></View><Text style={styles.link}>›</Text></Pressable>)}
  <Text style={styles.h2}>Help & information</Text>
  {["How it works","FAQs","Community guidelines","Privacy","Terms","Contact support"].map(t=><Pressable key={t} style={styles.listRow} onPress={()=>{setInfoTitle(t);setScreen("info");}}><Text style={styles.bodyText}>{t}</Text><Text style={styles.link}>↗</Text></Pressable>)}
  <Button title="Refresh account data" kind="secondary" onPress={refresh}/>
 </ScrollView>;

 // REPORT: separates estimated figures from measured results. Live ad analytics
 // are unavailable because no advertising platform is connected.
 const reportScreen=()=> <ScrollView contentContainerStyle={styles.page}>
  {header("Distribution report","Estimated and measured results",()=>setScreen("detail"))}
  <View style={styles.card}><Text style={styles.eyebrow}>CAMPAIGN</Text><Text style={styles.h2}>{report?.title||selected.title}</Text><Text style={styles.status}>{(report?.status||selected.status).replaceAll("_"," ")}</Text></View>
  <View style={styles.reportGrid}>{[{label:"Funds raised",value:money(report?.fundsRaised??selected.raised)},{label:"Funding goal",value:money(report?.fundingGoal??selected.fundingGoal)},{label:"Ad spend",value:money(report?.adSpend??0)},{label:"Impressions",value:Number(report?.impressions??0).toLocaleString("en-IN")},{label:"Clicks",value:Number(report?.clicks??0).toLocaleString("en-IN")},{label:"Estimated reach",value:Number(report?.estimatedReach??selected.estimatedReach).toLocaleString("en-IN")}].map(x=><View key={x.label} style={styles.reportTile}><Text style={styles.tiny}>{x.label}</Text><Text style={styles.reportValue}>{x.value}</Text></View>)}</View>
  <View style={styles.card}><Text style={styles.h2}>Measured reach</Text><Text style={styles.metricValue}>{report?.measuredReach==null?"Not available":Number(report.measuredReach).toLocaleString("en-IN")}</Text><Text style={styles.bodyText}>{report?.metricsNote||"No live advertising platform is connected. Estimated and measured values are kept separate."}</Text></View>
  <Text style={styles.disclaimer}>Funding completion does not imply advertising has launched. Distribution begins only after approval, budget and advertising setup requirements are met.</Text>
 </ScrollView>;

 // INFORMATION: simple explanatory content for help, FAQs, privacy, terms, etc.
 const infoScreen=()=> <ScrollView contentContainerStyle={styles.page}>{header(infoTitle,"Amplify",()=>setScreen("tabs"))}<View style={styles.card}><Text style={styles.h2}>{infoTitle}</Text><Text style={styles.bodyText}>Amplify helps people fund the distribution of messages so they can reach audiences beyond existing networks.</Text><Text style={styles.bodyText}>Create a campaign, submit it for review, and—if approved—make it available for community funding. Contributions pay for message amplification, not direct support for the cause or creator.</Text><Text style={styles.bodyText}>Reach is an estimate, not a guarantee. Review and advertising setup must be complete before promotion begins.</Text><Text style={styles.bodyText}>For this prototype, checkout and account details are simulated. No real payments or advertising delivery occur.</Text></View></ScrollView>;

 // Choose which screen component to display based on the current screen and tab.
 const renderContent=()=>{
  if(screen==="detail") return detailScreen();
  if(screen==="create") return createScreen();
  if(screen==="contribute") return contributeScreen();
  if(screen==="receipt") return receiptScreen();
  if(screen==="report") return reportScreen();
  if(screen==="info") return infoScreen();
  if(tab==="Home") return homeScreen();
  if(tab==="Explore") return exploreScreen();
  if(tab==="Create") return <ScrollView contentContainerStyle={styles.page}>{header("Create","Turn your message into a campaign")}<View style={styles.createHero}><Text style={styles.createHeroIcon}>✳</Text><Text style={styles.h2}>Every great campaign starts with a clear message.</Text><Text style={styles.bodyText}>Build a story, add supporting sources, preview ad creative and choose who you want to reach.</Text><Button title="Create manually →" onPress={()=>openCreate()}/><Button title="Create with your voice (demo)" kind="secondary" onPress={()=>Alert.alert("Voice creation demo","Voice capture is not connected in this build. You can enter the same idea manually; all fields remain editable.",[{text:"Continue manually",onPress:()=>openCreate()}])}/></View><Text style={styles.h2}>Resume a draft</Text>{campaigns.filter(c=>c.status==="draft"||c.status==="changes_requested").map(c=><Pressable key={c.id} style={styles.listRow} onPress={()=>openCreate(c)}><View style={{flex:1}}><Text style={styles.cardTitle}>{c.title}</Text><Text style={styles.tiny}>{c.status.replaceAll("_"," ")}</Text></View><Text style={styles.link}>Resume →</Text></Pressable>)}{campaigns.filter(c=>c.status==="draft"||c.status==="changes_requested").length===0&&<Text style={styles.mutedText}>No saved drafts yet. Your work will appear here.</Text>}</ScrollView>;
  if(tab==="Activity") return activityScreen();
  return profileScreen();
 };

 return <SafeAreaView style={styles.safe} edges={["top","left","right"]}>
  <StatusBar barStyle="dark-content" backgroundColor={colors.bg}/>
  {loading?<View style={styles.center}><ActivityIndicator size="large" color={colors.green}/></View>:renderContent()}
  {screen==="tabs"&&<View style={styles.bottomNav}>{[{name:"Home",icon:"⌂"},{name:"Explore",icon:"⌕"},{name:"Create",icon:"＋"},{name:"Activity",icon:"◷"},{name:"Profile",icon:"○"}].map(t=><Pressable key={t.name} onPress={()=>goTab(t.name)} style={styles.navItem}><Text style={[styles.navIcon,tab===t.name&&styles.navActive]}>{t.icon}</Text><Text style={[styles.navLabel,tab===t.name&&styles.navLabelActive]}>{t.name}</Text>{tab===t.name&&<View style={styles.navIndicator}/>}</Pressable>)}</View>}
 </SafeAreaView>;
}

// SafeAreaProvider supplies safe-area measurements to SafeAreaView, including on web.
export default function App() {
 return (
  <SafeAreaProvider>
   <MainApp />
  </SafeAreaProvider>
 );
}

// Styles for all visual elements. Most names match the UI component they style.
// For example, hero* styles control the home banner; nav* styles control bottom tabs.
const styles=StyleSheet.create({
 safe:{flex:1,backgroundColor:colors.bg},page:{width:"100%",maxWidth:820,alignSelf:"center",paddingHorizontal:20,paddingTop:12,paddingBottom:34,gap:17},
 screenHeader:{flexDirection:"row",alignItems:"center",gap:12,marginBottom:5},backButton:{width:42,height:42,borderRadius:14,backgroundColor:colors.white,alignItems:"center",justifyContent:"center",borderWidth:1,borderColor:colors.line},backText:{fontSize:30,color:colors.ink,marginTop:-4},screenTitle:{fontSize:28,fontWeight:"800",color:colors.ink,letterSpacing:-.8},screenSubtitle:{fontSize:13,color:colors.muted,marginTop:4,lineHeight:19},
 brandBar:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingHorizontal:2,paddingTop:2,paddingBottom:3},brandLockup:{flexDirection:"row",alignItems:"center",gap:10},brandMark:{width:42,height:42,borderRadius:15,backgroundColor:"#176B4B",alignItems:"center",justifyContent:"center",shadowColor:"#176B4B",shadowOffset:{width:0,height:4},shadowOpacity:0.16,shadowRadius:8,elevation:3},brandMarkText:{fontSize:24,fontWeight:"900",color:"#FFFFFF",letterSpacing:-1},brandName:{fontSize:22,fontWeight:"900",color:colors.ink,letterSpacing:-.8},brandTagline:{fontSize:10,color:colors.muted,marginTop:1,letterSpacing:.2},brandProfile:{width:42,height:42,borderRadius:15,backgroundColor:"#E5EEE6",alignItems:"center",justifyContent:"center",borderWidth:1,borderColor:"#D5E3D7"},brandProfileText:{fontSize:15,fontWeight:"900",color:colors.green},
 hero:{backgroundColor:"#173D2D",borderRadius:28,padding:23,gap:15,overflow:"hidden",shadowColor:"#123A29",shadowOffset:{width:0,height:8},shadowOpacity:0.13,shadowRadius:16,elevation:4},heroPill:{flexDirection:"row",alignItems:"center",alignSelf:"flex-start",gap:7,borderRadius:30,backgroundColor:"#315643",paddingHorizontal:10,paddingVertical:7},liveDot:{width:6,height:6,borderRadius:3,backgroundColor:"#A7D8A7"},heroPillText:{color:"#D7E8D9",fontSize:9,fontWeight:"800",letterSpacing:1.1},heroTitle:{fontSize:39,lineHeight:43,fontWeight:"900",letterSpacing:-1.5,color:"white"},heroCopy:{fontSize:14,lineHeight:21,color:"#D6E3D8"},heroActions:{flexDirection:"row",gap:8},heroEstimate:{borderTopWidth:1,borderTopColor:"#466653",paddingTop:14,flexDirection:"row",alignItems:"center",gap:13},heroEstimateNumber:{fontSize:34,fontWeight:"800",color:"#D3E8C9"},heroEstimateTitle:{fontSize:12,fontWeight:"700",color:"white"},heroEstimateSub:{fontSize:10,color:"#C0D0C2",marginTop:3},
 sectionHeading:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginTop:8},h2:{fontSize:19,fontWeight:"800",color:colors.ink,letterSpacing:-.45},link:{fontSize:12,fontWeight:"800",color:colors.green},linkSmall:{fontSize:11,color:colors.green,marginTop:4},
 campaignCard:{backgroundColor:colors.white,borderRadius:23,overflow:"hidden",borderWidth:1,borderColor:"#E5EBE5",marginBottom:5,shadowColor:"#1D3325",shadowOffset:{width:0,height:4},shadowOpacity:0.055,shadowRadius:12,elevation:2},campaignImage:{width:"100%",height:190,backgroundColor:"#DDE6DC"},cardBody:{padding:17,gap:9},rowBetween:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:8},eyebrow:{fontSize:10,fontWeight:"800",letterSpacing:1.1,color:colors.green},status:{fontSize:9,fontWeight:"700",textTransform:"capitalize",color:colors.muted,backgroundColor:"#F0F2EC",paddingHorizontal:8,paddingVertical:5,borderRadius:20,overflow:"hidden"},cardTitle:{fontSize:18,fontWeight:"800",color:colors.ink,lineHeight:24,letterSpacing:-.25},mutedText:{fontSize:12,color:colors.muted,lineHeight:18},summary:{fontSize:13,lineHeight:19,color:"#515B54"},amount:{fontSize:14,fontWeight:"800",color:colors.ink},tiny:{fontSize:10,color:colors.muted,lineHeight:15},progressTrack:{height:6,backgroundColor:"#E8ECE6",borderRadius:9,overflow:"hidden",marginTop:4},progressFill:{height:"100%",backgroundColor:colors.green,borderRadius:9},metricValue:{fontSize:20,fontWeight:"800",color:colors.ink,letterSpacing:-.4},miniButton:{backgroundColor:colors.pale,borderRadius:12,paddingHorizontal:11,paddingVertical:10},miniButtonText:{fontSize:11,fontWeight:"800",color:colors.green},
 button:{minHeight:48,borderRadius:15,paddingHorizontal:16,paddingVertical:13,alignItems:"center",justifyContent:"center"},buttonPrimary:{backgroundColor:colors.green,shadowColor:"#176B4B",shadowOffset:{width:0,height:3},shadowOpacity:0.16,shadowRadius:6,elevation:2},buttonSecondary:{backgroundColor:colors.pale,borderWidth:1,borderColor:"#CFE3D4"},buttonGhost:{backgroundColor:"transparent"},buttonText:{fontSize:13,fontWeight:"800",letterSpacing:.1},howCard:{backgroundColor:"#EAF2E8",borderWidth:1,borderColor:"#DCE8DA",borderRadius:24,padding:19,gap:14},howRow:{flexDirection:"row",gap:11},howStep:{flex:1,gap:5},howNum:{fontSize:11,fontWeight:"800",color:colors.green},howTitle:{fontSize:14,fontWeight:"800",color:colors.ink},disclaimer:{fontSize:11,lineHeight:17,color:colors.muted,marginTop:5},
 searchInput:{backgroundColor:colors.white,borderWidth:1,borderColor:colors.line,borderRadius:16,paddingHorizontal:16,paddingVertical:14,fontSize:14,color:colors.ink,shadowColor:"#1D3325",shadowOffset:{width:0,height:2},shadowOpacity:0.025,shadowRadius:5,elevation:1},chip:{borderWidth:1,borderColor:colors.line,borderRadius:24,paddingHorizontal:13,paddingVertical:9,backgroundColor:colors.white,marginRight:6,marginBottom:4},chipSelected:{backgroundColor:colors.green,borderColor:colors.green},chipText:{fontSize:11,fontWeight:"700",color:colors.muted},chipTextSelected:{color:"white"},chipWrap:{flexDirection:"row",flexWrap:"wrap",marginTop:5},empty:{alignItems:"center",justifyContent:"center",paddingVertical:45,gap:12},emptyIcon:{fontSize:40,color:colors.green},
 detailImage:{width:"100%",height:245,borderRadius:24,backgroundColor:"#DDE6DC"},detailTitle:{fontSize:29,lineHeight:34,fontWeight:"800",letterSpacing:-.7,color:colors.ink},storyIntro:{fontSize:17,lineHeight:26,color:"#46534A",fontWeight:"500",marginTop:4},storySection:{gap:7,marginTop:6},bodyText:{fontSize:13,lineHeight:21,color:"#4D5951"},card:{backgroundColor:colors.white,borderWidth:1,borderColor:"#E5EBE5",borderRadius:22,padding:18,gap:12,shadowColor:"#1D3325",shadowOffset:{width:0,height:3},shadowOpacity:0.035,shadowRadius:8,elevation:1},sourceRow:{flexDirection:"row",gap:10,borderTopWidth:1,borderColor:"#F0F2EE",paddingTop:11},sourceIcon:{color:colors.green,fontSize:18},sourceTitle:{fontSize:13,fontWeight:"800",color:colors.ink},actionStack:{gap:8},fieldWrap:{gap:7,marginTop:9},label:{fontSize:12,fontWeight:"800",color:colors.ink},input:{borderWidth:1,borderColor:"#DCE5DD",borderRadius:14,backgroundColor:"#FBFCFA",paddingHorizontal:14,paddingVertical:13,fontSize:14,color:colors.ink,minHeight:49},multiline:{minHeight:105,paddingTop:12},stepper:{flexDirection:"row",justifyContent:"space-between",gap:2,marginVertical:4},stepperItem:{flex:1,alignItems:"center",gap:6},stepCircle:{width:27,height:27,borderRadius:14,borderWidth:1,borderColor:"#D5DDD3",alignItems:"center",justifyContent:"center",backgroundColor:colors.white},stepCircleActive:{backgroundColor:colors.green,borderColor:colors.green},stepCircleDone:{backgroundColor:"#6D9477",borderColor:"#6D9477"},stepCircleText:{fontSize:11,fontWeight:"800",color:colors.muted},stepLabel:{fontSize:9,color:colors.muted,textAlign:"center",lineHeight:12},stepCard:{backgroundColor:colors.white,borderWidth:1,borderColor:"#E5EBE5",borderRadius:24,padding:18,gap:14,shadowColor:"#1D3325",shadowOffset:{width:0,height:3},shadowOpacity:0.035,shadowRadius:8,elevation:1},nestedCard:{backgroundColor:"#F8F9F5",padding:12,borderRadius:14},adPreview:{borderRadius:16,borderWidth:1,borderColor:colors.line,padding:14,backgroundColor:"#F7F8F4",gap:8},adPreviewTitle:{fontSize:18,fontWeight:"800",color:colors.ink},reachBox:{borderRadius:16,backgroundColor:"#EDF4EA",padding:16,gap:5},previewCard:{borderWidth:1,borderColor:colors.line,borderRadius:16,padding:13,gap:10},previewImage:{width:"100%",height:130,borderRadius:12},checkRow:{flexDirection:"row",alignItems:"flex-start",gap:10},checkbox:{width:22,height:22,borderRadius:6,borderWidth:1,borderColor:"#AAB7AA",alignItems:"center",justifyContent:"center"},checkboxChecked:{backgroundColor:colors.green,borderColor:colors.green},
 amountGrid:{flexDirection:"row",flexWrap:"wrap",gap:8},amountOption:{flexGrow:1,borderWidth:1,borderColor:colors.line,backgroundColor:colors.white,borderRadius:13,paddingVertical:15,paddingHorizontal:12,alignItems:"center",minWidth:"22%"},amountOptionSelected:{borderColor:colors.green,backgroundColor:colors.pale},amountOptionText:{fontSize:13,fontWeight:"800",color:colors.ink},feeRow:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",gap:8,paddingVertical:6},successIcon:{width:74,height:74,borderRadius:40,backgroundColor:colors.pale,alignSelf:"center",alignItems:"center",justifyContent:"center",marginTop:30},receiptCard:{backgroundColor:colors.white,borderWidth:1,borderColor:colors.line,borderRadius:22,padding:18,gap:13,marginVertical:20},receiptAmount:{fontSize:38,fontWeight:"800",color:colors.green,letterSpacing:-1},activityItem:{flexDirection:"row",gap:12,paddingVertical:15,borderBottomWidth:1,borderColor:colors.line},activityDot:{width:10,height:10,borderRadius:5,backgroundColor:"#70A47D",marginTop:5},activityTitle:{fontSize:14,fontWeight:"800",color:colors.ink,marginBottom:4},profileHero:{backgroundColor:colors.white,borderRadius:20,borderWidth:1,borderColor:colors.line,padding:16,flexDirection:"row",gap:13,alignItems:"center"},avatar:{width:52,height:52,borderRadius:18,backgroundColor:colors.pale,alignItems:"center",justifyContent:"center"},avatarText:{fontSize:16,fontWeight:"800",color:colors.green},statsRow:{flexDirection:"row",gap:10},statCard:{flex:1,padding:15,borderRadius:17,backgroundColor:colors.white,borderWidth:1,borderColor:colors.line,gap:5},listRow:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingVertical:13,borderBottomWidth:1,borderColor:colors.line},createHero:{backgroundColor:"#EAF1E7",padding:20,borderRadius:22,gap:13},createHeroIcon:{fontSize:29,color:colors.green},reportGrid:{flexDirection:"row",flexWrap:"wrap",gap:9},reportTile:{width:"48%",backgroundColor:colors.white,borderWidth:1,borderColor:colors.line,borderRadius:17,padding:14,gap:8},reportValue:{fontSize:20,fontWeight:"800",color:colors.ink},errorText:{color:colors.red,fontSize:12},center:{flex:1,alignItems:"center",justifyContent:"center"},bottomNav:{width:"100%",maxWidth:820,alignSelf:"center",flexDirection:"row",paddingTop:10,paddingBottom:10,borderTopWidth:1,borderColor:"#E0E8E1",backgroundColor:"#FFFFFF",shadowColor:"#1D3325",shadowOffset:{width:0,height:-3},shadowOpacity:0.035,shadowRadius:8,elevation:5},navItem:{flex:1,minHeight:42,alignItems:"center",justifyContent:"center",gap:4},navIcon:{fontSize:21,color:"#879188"},navActive:{color:colors.green,fontWeight:"900"},navLabel:{fontSize:9,color:"#879188",fontWeight:"600"},navLabelActive:{color:colors.green,fontWeight:"800"},navIndicator:{width:4,height:4,borderRadius:2,backgroundColor:colors.green,marginTop:1}
});
