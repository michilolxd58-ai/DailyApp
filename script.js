"use strict";

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

const STORAGE_KEY="dailyapp-midnight-v1";
const SETTINGS_KEY="dailyapp-appearance-v1";

const DEFAULT_CATEGORIES=[
{id:"daily",name:"Daily",xp:10},
{id:"school",name:"School",xp:20},
{id:"training",name:"Training",xp:30},
{id:"challenge",name:"Challenge",xp:50}
];

const DAILY_GOALS=[60,70,80,90,100,110,120,140];


const TASK_POOL = [
  // Morning routine
  "Make your bed",
  "Drink a glass of water",
  "Open the curtains",
  "Wash your face",
  "Brush your teeth",
  "Get dressed for the day",
  "Prepare your school bag",
  "Eat breakfast",
  "Check today's schedule",
  "Tidy your room for 5 minutes",

  // School & learning
  "Review your notes for 10 minutes",
  "Finish one homework task",
  "Study one difficult topic",
  "Read 5 pages of a book",
  "Learn 5 new English words",
  "Practice maths for 10 minutes",
  "Organize your school documents",
  "Prepare for the next school day",
  "Review mistakes from a test",
  "Spend 15 minutes learning something new",
  "Complete an assignment you postponed",
  "Clean up your digital school folders",
  "Write down your top 3 priorities",
  "Practice a skill for 15 minutes",

  // Fitness & wellbeing
  "Take a short walk",
  "Stretch for 5 minutes",
  "Do a short workout",
  "Practice push-ups with good form",
  "Practice pull-ups if available",
  "Go outside for fresh air",
  "Take a screen break",
  "Drink water during the day",
  "Take a few calm breaths",
  "Get ready for bed on time",
  "Take a proper break after studying",
  "Spend 10 minutes relaxing without your phone",

  // Discipline & productivity
  "Put your phone away for 20 minutes",
  "Complete your most important task",
  "Start a task you've been avoiding",
  "Work on one task without distractions",
  "Clean your desk",
  "Organize your files",
  "Plan tomorrow's first task",
  "Finish what you started",
  "Spend 10 minutes on a personal project",
  "Remove one unnecessary distraction",
  "Write down one thing you learned today",
  "Review your progress for the day",
  "Prepare everything for tomorrow",
  "Complete a 15-minute focus session",

  // Coding & creativity
  "Write a small Python program",
  "Learn one new coding concept",
  "Fix a bug in a project",
  "Improve one part of your app",
  "Write a few lines of code",
  "Sketch a new project idea",
  "Work on a DIY project for 15 minutes",
  "Learn something about electronics",
  "Document your latest project progress",
  "Test one feature of your app",
  "Organize your project files",
  "Write down an idea for a future project",

  // Evening routine
  "Tidy up before bed",
  "Brush your teeth before sleeping",
  "Prepare clothes for tomorrow",
  "Check tomorrow's schedule",
  "Write down one thing that went well",
  "Reflect on today's progress",
  "Put your phone away before bedtime",
  "Make sure your school bag is ready",
  "Set your alarm",
  "Get enough sleep"
];


const BONUS_POOL=[
"Clear your desk for five minutes","Read or learn something for ten minutes",
"Take a short fresh-air break","Prepare one thing for tomorrow",
"Finish a tiny task you've been avoiding","Stretch and reset for five minutes",
"Write down your top three priorities","Put away distractions for one focus block"
];

const ACCENTS={
mint:{color:"#b6ff00",rgb:"182,255,0"},
blue:{color:"#50a9ff",rgb:"80,169,255"},
purple:{color:"#b18aff",rgb:"177,138,255"},
pink:{color:"#ff7fba",rgb:"255,127,186"},
orange:{color:"#ffad42",rgb:"255,173,66"},
red:{color:"#ff626c",rgb:"255,98,108"}
};

const ACHIEVEMENTS=[
{id:"first",icon:"🌱",name:"First Step",desc:"Complete your first task.",test:s=>s.tasks.some(t=>t.done)},
{id:"five",icon:"⚡",name:"Getting Momentum",desc:"Complete 5 tasks.",test:s=>completed(s).length>=5},
{id:"twentyfive",icon:"🧩",name:"Consistent Builder",desc:"Complete 25 tasks.",test:s=>completed(s).length>=25},
{id:"hundred",icon:"💯",name:"Century Club",desc:"Complete 100 tasks.",test:s=>completed(s).length>=100},
{id:"xp100",icon:"✨",name:"XP Collector",desc:"Earn 100 XP.",test:s=>totalXP(s)>=100},
{id:"xp1000",icon:"🏅",name:"XP Machine",desc:"Earn 1,000 XP.",test:s=>totalXP(s)>=1000},
{id:"streak3",icon:"🔥",name:"Three-Day Spark",desc:"Reach a 3-day streak.",test:s=>streakInfo(s).current>=3||streakInfo(s).best>=3},
{id:"streak7",icon:"🗓️",name:"One-Week Rhythm",desc:"Reach a 7-day streak.",test:s=>streakInfo(s).current>=7||streakInfo(s).best>=7},
{id:"bonus",icon:"🎯",name:"Side Quest",desc:"Complete a bonus quest.",test:s=>(s.bonusCompleted||0)>=1},
{id:"focus",icon:"⏱️",name:"Focus Starter",desc:"Complete a focus session.",test:s=>(s.focusSessions||0)>=1},
{id:"category",icon:"🛠️",name:"Make It Yours",desc:"Create a custom category.",test:s=>s.categories.some(c=>!DEFAULT_CATEGORIES.some(d=>d.id===c.id))}
];

function loadAppearance(){
  const defaults={theme:"auto",accent:"mint"};
  try{
    const saved=JSON.parse(localStorage.getItem(SETTINGS_KEY)||"null");
    if(!saved||typeof saved!=="object")return defaults;
    return {
      theme:["auto","dark","light"].includes(saved.theme)?saved.theme:"auto",
      accent:Object.hasOwn(ACCENTS,saved.accent)?saved.accent:"mint"
    };
  }catch{return defaults;}
}

let appearance=loadAppearance();

function systemPrefersDark(){
  return window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function currentTheme(){
  if(appearance.theme==="auto")return systemPrefersDark()?"dark":"light";
  return appearance.theme;
}

function applyAppearance(){
  const root=document.documentElement;
  const theme=currentTheme();
  const accent=ACCENTS[appearance.accent]||ACCENTS.mint;

  root.dataset.theme=theme;
  root.dataset.accent=appearance.accent;
  root.style.setProperty("--mint",accent.color);
  root.style.setProperty("--mint-rgb",accent.rgb);

  const themeColor=$("#theme-color");
  if(themeColor){
    themeColor.setAttribute("content",theme==="dark"?"#050605":"#f4f6f8");
  }

  const themeSelect=$("#theme-select");
  if(themeSelect)themeSelect.value=appearance.theme;

  const themeStatus=$("#theme-status");
  if(themeStatus){
    themeStatus.textContent=appearance.theme==="auto"
      ?`Automatic (${theme==="dark"?"Dark":"Light"})`
      :theme==="dark"?"Dark mode":"Light mode";
  }

  $$(".color-option").forEach(button=>{
    const selected=button.dataset.accent===appearance.accent;
    button.classList.toggle("selected",selected);
    button.setAttribute("aria-pressed",String(selected));
  });
}

function saveAppearance(){
  try{
    localStorage.setItem(SETTINGS_KEY,JSON.stringify(appearance));
  }catch(error){
    console.warn("Could not save appearance settings",error);
  }
  applyAppearance();
}

const colorSchemeQuery=window.matchMedia
  ?window.matchMedia("(prefers-color-scheme: dark)")
  :null;

if(colorSchemeQuery){
  const onSystemThemeChange=()=>{
    if(appearance.theme==="auto")applyAppearance();
  };
  if(colorSchemeQuery.addEventListener){
    colorSchemeQuery.addEventListener("change",onSystemThemeChange);
  }else if(colorSchemeQuery.addListener){
    colorSchemeQuery.addListener(onSystemThemeChange);
  }
}

const $unused=null;

function dateKey(d){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function todayKey(){return dateKey(new Date());}
function parseDate(k){
  const [y,m,d]=k.split("-").map(Number);
  return new Date(y,m-1,d);
}
function escapeHTML(s){
  return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8);}
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}

function loadState(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");
    if(raw&&typeof raw==="object"){
      const cats=Array.isArray(raw.categories)&&raw.categories.length?raw.categories:DEFAULT_CATEGORIES;
      return {
        version:2,
        tasks:Array.isArray(raw.tasks)?raw.tasks:[],
        categories:cats.map(c=>({
          id:String(c.id||uid()),
          name:String(c.name||"Category"),
          xp:clamp(Number(c.xp)||10,1,1000)
        })),
        dailyPlans:raw.dailyPlans&&typeof raw.dailyPlans==="object"?raw.dailyPlans:{},
        bonusCompleted:Number(raw.bonusCompleted)||0,
        focusSessions:Number(raw.focusSessions)||0,
        unlocked:Array.isArray(raw.unlocked)?raw.unlocked:[]
      };
    }
  }catch(e){console.warn("Could not read saved data",e);}
  return {
    version:2,tasks:[],
    categories:DEFAULT_CATEGORIES.map(c=>({...c})),
    dailyPlans:{},bonusCompleted:0,focusSessions:0,unlocked:[]
  };
}

let state=loadState();
let currentFilter="all";
let calendarCursor=new Date();
let selectedDate=dateKey(new Date());
let activeQuest=null;
let timerSeconds=25*60;
let timerInterval=null;
let timerRunning=false;

function save(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
  catch(e){toast("Could not save data in this browser.");}
}
function toast(msg){
  const el=$("#toast");
  el.textContent=msg;
  el.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer=setTimeout(()=>el.classList.remove("show"),2400);
}
function category(id){
  return state.categories.find(c=>c.id===id)||state.categories[0]||DEFAULT_CATEGORIES[0];
}
function taskXP(t){
  return Number.isFinite(Number(t.xpReward))?Number(t.xpReward):category(t.category).xp;
}
function completed(s=state){return s.tasks.filter(t=>t.done);}
function totalXP(s=state){return completed(s).reduce((sum,t)=>sum+taskXP(t),0);}
function levelInfo(xp){
  const level=Math.floor(Math.max(0,xp)/100)+1;
  return {level,inside:Math.max(0,xp)%100,needed:100};
}

function getPlan(day=todayKey()){
  if(!state.dailyPlans[day]){
    const pool=[...TASK_POOL];
    const count=4+Math.floor(Math.random()*2);
    const chosen=[];
    while(chosen.length<count&&pool.length){
      chosen.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
    }
    state.dailyPlans[day]={
      goal:DAILY_GOALS[Math.floor(Math.random()*DAILY_GOALS.length)],
      taskTexts:chosen
    };
    save();
  }
  return state.dailyPlans[day];
}

function ensureDailyTasks(day=todayKey()){
  const plan=getPlan(day);
  for(const text of plan.taskTexts){
    if(!state.tasks.some(t=>t.kind==="daily-plan"&&t.day===day&&t.text===text)){
      state.tasks.push({
        id:uid(),text,created:day,done:false,completedAt:null,
        category:"daily",kind:"daily-plan",day,xpReward:10
      });
    }
  }
  save();
}

function tasksForDay(day){
  return state.tasks.filter(t=>t.created===day||t.completedAt===day);
}
function dailyEarned(day=todayKey()){
  return state.tasks.filter(t=>t.done&&t.completedAt===day).reduce((n,t)=>n+taskXP(t),0);
}

function streakInfo(s=state){
  const days=new Set(s.tasks.filter(t=>t.done&&t.completedAt).map(t=>t.completedAt));
  let current=0;
  let d=new Date();
  let key=dateKey(d);
  if(!days.has(key)){d.setDate(d.getDate()-1);key=dateKey(d);}
  while(days.has(key)){current++;d.setDate(d.getDate()-1);key=dateKey(d);}
  const sorted=[...days].sort();
  let best=0,run=0,prev=null;
  for(const k of sorted){
    const dt=parseDate(k);
    if(prev){
      const diff=Math.round((dt-prev)/86400000);
      run=diff===1?run+1:1;
    }else run=1;
    best=Math.max(best,run);
    prev=dt;
  }
  return {current,best};
}

function weekKeys(){
  const now=new Date(),monday=new Date(now);
  const offset=(now.getDay()+6)%7;
  monday.setDate(now.getDate()-offset);
  monday.setHours(0,0,0,0);
  return Array.from({length:7},(_,i)=>{
    const d=new Date(monday);
    d.setDate(monday.getDate()+i);
    return dateKey(d);
  });
}

function weeklyStats(){
  const keys=weekKeys();
  const done=state.tasks.filter(t=>t.done&&keys.includes(t.completedAt));
  return {
    done:done.length,
    xp:done.reduce((n,t)=>n+taskXP(t),0),
    days:new Set(done.map(t=>t.completedAt)).size,
    goalDays:keys.filter(k=>dailyEarned(k)>=(state.dailyPlans[k]?.goal||Infinity)).length,
    keys
  };
}

function checkAchievements(){
  const newOnes=[];
  for(const a of ACHIEVEMENTS){
    if(!state.unlocked.includes(a.id)&&a.test(state)){
      state.unlocked.push(a.id);
      newOnes.push(a);
    }
  }
  if(newOnes.length){
    save();
    newOnes.forEach((a,i)=>setTimeout(()=>toast(`Badge unlocked: ${a.name} ${a.icon}`),i*900));
  }
}

function createTask(text,catId,extra={}){
  const cat=category(catId);
  state.tasks.unshift({
    id:uid(),text:text.trim(),created:todayKey(),done:false,
    completedAt:null,category:cat.id,kind:"custom",xpReward:cat.xp,...extra
  });
  save();
  renderAll();
}

function toggleTask(id){
  const t=state.tasks.find(x=>x.id===id);
  if(!t)return;
  t.done=!t.done;
  t.completedAt=t.done?todayKey():null;
  save();
  checkAchievements();
  renderAll();
  toast(t.done?`Task complete · +${taskXP(t)} XP`:"Task marked active");
}

function deleteTask(id){
  const t=state.tasks.find(x=>x.id===id);
  if(!t)return;
  if(!confirm(`Delete "${t.text}"?`))return;
  state.tasks=state.tasks.filter(x=>x.id!==id);
  save();
  renderAll();
  toast("Task deleted");
}

function taskHTML(t,showDelete=true){
  const cat=category(t.category);
  return `<div class="task-item ${t.done?"done":""}">
    <button class="task-check" data-toggle="${escapeHTML(t.id)}" aria-label="${t.done?"Mark active":"Complete task"}">${t.done?"✓":""}</button>
    <div class="task-main">
      <div class="task-title">${escapeHTML(t.text)}</div>
      <div class="task-meta">${escapeHTML(cat.name)} · ${t.completedAt===todayKey()&&t.done?"Completed today":t.created===todayKey()?"Added today":escapeHTML(t.created||"")}</div>
    </div>
    <span class="xp-pill">+${taskXP(t)} XP</span>
    ${showDelete?`<button class="delete-task" data-delete="${escapeHTML(t.id)}" aria-label="Delete task">×</button>`:""}
  </div>`;
}

function renderTaskLists(){
  const home=state.tasks.filter(t=>t.created===todayKey()||t.kind==="daily-plan"&&t.day===todayKey()).slice(0,5);
  $("#home-tasks").innerHTML=home.length?home.map(t=>taskHTML(t,false)).join(""):'<div class="empty-state">No tasks yet. Add one and get started.</div>';

  const list=state.tasks.filter(t=>currentFilter==="all"?true:currentFilter==="open"?!t.done:t.done);
  $("#task-list").innerHTML=list.length?list.map(t=>taskHTML(t)).join(""):'<div class="empty-state">Nothing here yet. Add a task above.</div>';

  const ct=state.tasks.filter(t=>t.created===selectedDate||t.completedAt===selectedDate);
  $("#calendar-tasks").innerHTML=ct.length?ct.map(t=>taskHTML(t,false)).join(""):'<div class="empty-state">No tasks recorded for this day.</div>';

  $("#selected-date-heading").textContent=parseDate(selectedDate).toLocaleDateString("en-GB",{
    weekday:"short",day:"numeric",month:"long"
  });
}

function renderHome(){
  const today=state.tasks.filter(t=>t.created===todayKey()||t.kind==="daily-plan"&&t.day===todayKey());
  const done=today.filter(t=>t.done).length;
  const xp=totalXP();
  const plan=getPlan();
  const earned=dailyEarned();
  const pct=plan.goal?Math.min(100,Math.round(earned/plan.goal*100)):0;

  $("#today-date").textContent=new Date().toLocaleDateString("en-GB",{
    weekday:"long",day:"numeric",month:"long"
  });

  const hour=new Date().getHours();
  $("#greeting").textContent=hour<12?"Make today count.":hour<18?"Keep your momentum.":"Finish strong, then rest.";

  $("#home-completed").textContent=`${done}/${today.length}`;
  $("#home-xp").textContent=`${xp} XP`;
  $("#home-percent").textContent=`${today.length?Math.round(done/today.length*100):0}%`;
  $("#home-bar").style.width=`${today.length?done/today.length*100:0}%`;

  $("#daily-goal-label").textContent=`${earned} XP / ${plan.goal} XP`;
  $("#daily-goal-bar").style.width=`${pct}%`;
  $("#daily-challenge-text").textContent=earned>=plan.goal
    ?"Daily XP goal reached — great work!"
    :`Earn ${Math.max(0,plan.goal-earned)} more XP today to reach your randomly chosen goal.`;

  const st=streakInfo();
  $("#current-streak").textContent=st.current;
  $("#best-streak").textContent=st.best;
  $("#weekly-complete").textContent=weeklyStats().done;

  const w=weeklyStats();
  $("#home-weekly-report").innerHTML=`<div class="report-grid">
    <div class="report-metric"><strong>${w.done}</strong><span>Tasks done</span></div>
    <div class="report-metric"><strong>${w.xp}</strong><span>XP earned</span></div>
    <div class="report-metric"><strong>${w.days}/7</strong><span>Active days</span></div>
  </div>`;
}

function renderProgress(){
  const xp=totalXP(),lv=levelInfo(xp),done=completed().length,total=state.tasks.length;

  $("#header-level").textContent=lv.level;
  $("#progress-level").textContent=lv.level;
  $("#level-title").textContent=lv.level<3?"Getting started":lv.level<6?"Building momentum":lv.level<10?"Consistency builder":"Discipline legend";
  $("#level-description").textContent=lv.level<3?"Every journey begins with one step.":"Keep showing up, one task at a time.";
  $("#level-bar").style.width=`${lv.inside}%`;
  $("#level-xp").textContent=`${lv.inside} / 100 XP to next level`;

  $("#stat-completed").textContent=done;
  $("#stat-total").textContent=total;
  $("#stat-rate").textContent=`${total?Math.round(done/total*100):0}%`;
  $("#stat-xp").textContent=xp;

  $("#badge-count").textContent=`${state.unlocked.length} / ${ACHIEVEMENTS.length} unlocked`;
  $("#achievements-list").innerHTML=ACHIEVEMENTS.map(a=>{
    const unlocked=state.unlocked.includes(a.id);
    return `<div class="achievement ${unlocked?"":"locked"}">
      <div class="ach-icon">${a.icon}</div>
      <div class="ach-info"><strong>${a.name}</strong><small>${a.desc}</small></div>
      <span class="badge-count">${unlocked?"UNLOCKED":"LOCKED"}</span>
    </div>`;
  }).join("");

  const w=weeklyStats();
  $("#weekly-report").innerHTML=`<div class="report-grid">
    <div class="report-metric"><strong>${w.done}</strong><span>Tasks completed</span></div>
    <div class="report-metric"><strong>${w.xp}</strong><span>XP gained</span></div>
    <div class="report-metric"><strong>${w.days}/7</strong><span>Active days</span></div>
  </div>
  <div class="report-row"><span>Daily goals reached</span><strong class="badge-count">${w.goalDays}/7</strong></div>
  <div class="report-row"><span>Current streak</span><strong class="badge-count">${streakInfo().current} days</strong></div>
  <div class="report-row"><span>Best streak</span><strong class="badge-count">${streakInfo().best} days</strong></div>`;

  const activity=state.tasks.filter(t=>t.done).sort((a,b)=>(b.completedAt||"").localeCompare(a.completedAt||"")).slice(0,6);
  $("#activity-list").innerHTML=activity.length?activity.map(t=>taskHTML(t,false)).join(""):'<div class="empty-state">Complete a task to see your activity here.</div>';
}

function renderCalendar(){
  const y=calendarCursor.getFullYear(),m=calendarCursor.getMonth();
  $("#calendar-month").textContent=calendarCursor.toLocaleDateString("en-GB",{month:"long",year:"numeric"});

  const first=new Date(y,m,1);
  const offset=(first.getDay()+6)%7;
  const days=new Date(y,m+1,0).getDate();
  let out="";

  for(let i=0;i<offset;i++)out+="<span></span>";

  for(let day=1;day<=days;day++){
    const d=new Date(y,m,day),key=dateKey(d);
    const has=state.tasks.some(t=>t.created===key||t.completedAt===key);
    out+=`<button class="day-button ${key===todayKey()?"today":""} ${key===selectedDate?"selected":""} ${has?"has-tasks":""}" data-date="${key}" aria-label="${key}">${day}</button>`;
  }
  $("#calendar-days").innerHTML=out;
}

function renderCategories(){
  $("#task-category").innerHTML=state.categories.map(c=>
    `<option value="${escapeHTML(c.id)}">${escapeHTML(c.name)} · ${c.xp} XP</option>`
  ).join("");

  $("#category-list").innerHTML=state.categories.map(c=>
    `<div class="category-row">
      <div class="cat-name"><strong>${escapeHTML(c.name)}</strong><small>${c.xp} XP per task</small></div>
      <button class="mini-button" data-edit-cat="${escapeHTML(c.id)}">Edit XP</button>
      ${DEFAULT_CATEGORIES.some(d=>d.id===c.id)?"":`<button class="mini-button" data-delete-cat="${escapeHTML(c.id)}" aria-label="Delete category">×</button>`}
    </div>`
  ).join("");
}

function renderAll(){
  ensureDailyTasks();
  renderHome();
  renderTaskLists();
  renderCalendar();
  renderProgress();
  renderCategories();
}

function go(view){
  $$(".view").forEach(v=>v.classList.toggle("active",v.id===`view-${view}`));
  $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  window.scrollTo({top:0,behavior:"smooth"});
}

function generateQuest(){
  const text=BONUS_POOL[Math.floor(Math.random()*BONUS_POOL.length)];
  activeQuest={text,done:false};
  renderQuest();
  toast("Bonus quest generated!");
}

function renderQuest(){
  const box=$("#bonus-quest");
  if(!activeQuest){
    box.innerHTML='<span class="quest-icon">🎯</span><div class="quest-info"><strong>No bonus quest yet</strong><small>Generate one when you are ready.</small></div>';
    $("#complete-quest").disabled=true;
    return;
  }

  box.innerHTML=`<span class="quest-icon">🎯</span><div class="quest-info"><strong>${escapeHTML(activeQuest.text)}</strong><small>${activeQuest.done?"Completed — bonus XP awarded":"Complete it in real life, then claim your reward."}</small></div>`;
  $("#complete-quest").disabled=activeQuest.done;
}

function exportData(){
  const payload={app:"DailyApp",version:2,exportedAt:new Date().toISOString(),data:state};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download=`dailyapp-backup-${todayKey()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast("Backup exported.");
}

function validateBackup(obj){
  const d=obj?.data||obj;
  if(!d||typeof d!=="object"||!Array.isArray(d.tasks)||!Array.isArray(d.categories)){
    throw new Error("This file does not look like a DailyApp backup.");
  }

  const cats=d.categories.map(c=>({
    id:String(c.id||uid()),
    name:String(c.name||"Category").slice(0,30),
    xp:clamp(Number(c.xp)||10,1,1000)
  }));

  const validIds=new Set(cats.map(c=>c.id));
  const tasks=d.tasks.map(t=>({
    id:String(t.id||uid()),
    text:String(t.text||"Task").slice(0,100),
    created:/^\d{4}-\d{2}-\d{2}$/.test(t.created)?t.created:todayKey(),
    done:!!t.done,
    completedAt:/^\d{4}-\d{2}-\d{2}$/.test(t.completedAt)?t.completedAt:null,
    category:validIds.has(String(t.category))?String(t.category):cats[0]?.id||"daily",
    kind:String(t.kind||"custom"),
    day:/^\d{4}-\d{2}-\d{2}$/.test(t.day)?t.day:undefined,
    xpReward:clamp(Number(t.xpReward)||10,1,1000)
  }));

  return {
    version:2,
    tasks,
    categories:cats.length?cats:DEFAULT_CATEGORIES.map(c=>({...c})),
    dailyPlans:d.dailyPlans&&typeof d.dailyPlans==="object"?d.dailyPlans:{},
    bonusCompleted:Math.max(0,Number(d.bonusCompleted)||0),
    focusSessions:Math.max(0,Number(d.focusSessions)||0),
    unlocked:Array.isArray(d.unlocked)?d.unlocked.filter(id=>ACHIEVEMENTS.some(a=>a.id===id)):[]
  };
}

function updateTimerDisplay(){
  const mm=String(Math.floor(timerSeconds/60)).padStart(2,"0");
  const ss=String(timerSeconds%60).padStart(2,"0");
  $("#timer-display").textContent=`${mm}:${ss}`;
}

function stopTimer(){
  if(timerInterval)clearInterval(timerInterval);
  timerInterval=null;
  timerRunning=false;
}

function startTimer(){
  if(timerRunning)return;
  timerRunning=true;
  $("#timer-status").textContent="Focus session in progress…";

  timerInterval=setInterval(()=>{
    timerSeconds--;
    updateTimerDisplay();

    if(timerSeconds<=0){
      stopTimer();
      timerSeconds=0;
      updateTimerDisplay();
      state.focusSessions=(state.focusSessions||0)+1;
      save();
      checkAchievements();
      renderProgress();
      $("#timer-status").textContent="Session complete. Take a break if you need one.";
      toast("Focus session complete!");
    }
  },1000);
}

function pauseTimer(){
  stopTimer();
  $("#timer-status").textContent="Paused. Continue when ready.";
}

function resetTimer(){
  stopTimer();
  timerSeconds=Number($("#timer-duration").value)*60;
  updateTimerDisplay();
  $("#timer-status").textContent="Ready when you are.";
}

/* Appearance settings */
$("#theme-select").addEventListener("change",e=>{
  appearance.theme=e.target.value;
  saveAppearance();
  toast("Theme updated.");
});

$("#color-options").addEventListener("click",e=>{
  const button=e.target.closest("[data-accent]");
  if(!button)return;
  appearance.accent=button.dataset.accent;
  saveAppearance();
  toast("Accent color updated.");
});

/* App navigation and task actions */
document.addEventListener("click",e=>{
  const nav=e.target.closest("[data-view]");
  if(nav)go(nav.dataset.view);

  const goBtn=e.target.closest("[data-go]");
  if(goBtn)go(goBtn.dataset.go);

  const filter=e.target.closest("[data-filter]");
  if(filter){
    currentFilter=filter.dataset.filter;
    $$(".filter").forEach(b=>b.classList.toggle("active",b===filter));
    renderTaskLists();
  }

  const toggle=e.target.closest("[data-toggle]");
  if(toggle)toggleTask(toggle.dataset.toggle);

  const del=e.target.closest("[data-delete]");
  if(del)deleteTask(del.dataset.delete);

  const day=e.target.closest("[data-date]");
  if(day){
    selectedDate=day.dataset.date;
    renderCalendar();
    renderTaskLists();
  }

  const edit=e.target.closest("[data-edit-cat]");
  if(edit){
    const c=category(edit.dataset.editCat);
    const value=prompt(`New XP reward for ${c.name} (1–1000):`,String(c.xp));
    if(value===null)return;
    const xp=Number(value);
    if(!Number.isInteger(xp)||xp<1||xp>1000){
      toast("Enter a whole number from 1 to 1000.");
      return;
    }
    c.xp=xp;
    state.tasks.filter(t=>t.category===c.id&&!Number.isFinite(Number(t.xpReward))).forEach(t=>t.xpReward=xp);
    save();
    renderAll();
    toast("Category XP updated.");
  }

  const delCat=e.target.closest("[data-delete-cat]");
  if(delCat){
    const c=category(delCat.dataset.deleteCat);
    if(!confirm(`Delete category "${c.name}"? Tasks in it will move to Daily.`))return;
    state.tasks.forEach(t=>{if(t.category===c.id)t.category="daily";});
    state.categories=state.categories.filter(x=>x.id!==c.id);
    save();
    renderAll();
    toast("Category deleted.");
  }
});

$("#task-form").addEventListener("submit",e=>{
  e.preventDefault();
  const input=$("#task-input");
  const text=input.value.trim();
  if(!text)return;
  createTask(text,$("#task-category").value);
  input.value="";
  toast("Task added.");
});

$("#category-form").addEventListener("submit",e=>{
  e.preventDefault();
  const name=$("#category-name").value.trim();
  const xp=Number($("#category-xp").value);
  if(!name||!Number.isInteger(xp)||xp<1||xp>1000)return;

  if(state.categories.some(c=>c.name.toLowerCase()===name.toLowerCase())){
    toast("That category already exists.");
    return;
  }

  state.categories.push({id:uid(),name,xp});
  save();
  $("#category-name").value="";
  renderAll();
  checkAchievements();
  toast("Category created.");
});

$("#prev-month").addEventListener("click",()=>{
  calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()-1,1);
  renderCalendar();
});
$("#next-month").addEventListener("click",()=>{
  calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+1,1);
  renderCalendar();
});

$("#new-quest").addEventListener("click",generateQuest);
$("#complete-quest").addEventListener("click",()=>{
  if(!activeQuest||activeQuest.done)return;
  activeQuest.done=true;

  state.tasks.unshift({
    id:uid(),
    text:`Bonus quest: ${activeQuest.text}`,
    created:todayKey(),
    done:true,
    completedAt:todayKey(),
    category:"challenge",
    kind:"bonus",
    xpReward:25
  });

  state.bonusCompleted=(state.bonusCompleted||0)+1;
  save();
  checkAchievements();
  renderAll();
  renderQuest();
  toast("Bonus quest complete · +25 XP");
});

$("#export-data").addEventListener("click",exportData);
$("#import-data").addEventListener("click",()=>$("#import-file").click());

$("#import-file").addEventListener("change",async e=>{
  const file=e.target.files?.[0];
  if(!file)return;

  try{
    const obj=JSON.parse(await file.text());
    const next=validateBackup(obj);
    if(!confirm("Import this backup? Your current DailyApp data will be replaced."))return;
    state=next;
    save();
    activeQuest=null;
    renderQuest();
    renderAll();
    toast("Backup imported successfully.");
  }catch(err){
    alert(err.message||"Could not import this file.");
  }finally{
    e.target.value="";
  }
});

$("#reset-data").addEventListener("click",()=>{
  if(!confirm("Reset all DailyApp data? This cannot be undone unless you have a backup."))return;
  state={
    version:2,
    tasks:[],
    categories:DEFAULT_CATEGORIES.map(c=>({...c})),
    dailyPlans:{},
    bonusCompleted:0,
    focusSessions:0,
    unlocked:[]
  };
  activeQuest=null;
  save();
  ensureDailyTasks();
  renderQuest();
  renderAll();
  toast("All data has been reset.");
});

$("#timer-start").addEventListener("click",startTimer);
$("#timer-pause").addEventListener("click",pauseTimer);
$("#timer-reset").addEventListener("click",resetTimer);
$("#timer-duration").addEventListener("change",resetTimer);

/* Initialize the app */
applyAppearance();
ensureDailyTasks();
checkAchievements();
renderQuest();
renderAll();
updateTimerDisplay();
