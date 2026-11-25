/* ================= MACHHAR MAARO — AdMob IDs =================
   Asli IDs sirf Play Store wale Android app mein chalengi.
   Testing/demo mein hamesha Google ke TEST ads (neeche TEST_IDS) chalte hain,
   taaki apne ads pe galti se click na ho aur account safe rahe.
================================================================ */
const ADMOB = {
  appId: 'ca-app-pub-1099130688378957~4697989916',
  units: {
    banner_map:   'ca-app-pub-1099130688378957/1914867722', // MM_Map_Banner   (Banner)
    rewarded_2x:  'ca-app-pub-1099130688378957/4349459372', // MM_2X_Coins     (Rewarded)
    rewarded_rev: 'ca-app-pub-1099130688378957/5359288716', // MM_Revive       (Rewarded)
    rewarded_tkt: 'ca-app-pub-1099130688378957/5064821425', // MM_Lucky_Ticket (Rewarded)
    inter_level:  'ca-app-pub-1099130688378957/2332660963'  // MM_Level_Break  (Interstitial)
  },
  // Google ke official test IDs (Android)
  TEST_IDS: {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
    interstitial: 'ca-app-pub-3940256099942544/1033173712'
  },
  testMode: true,           // launch build mein false hoga
  interEvery: 3             // har 3 level ke baad interstitial
};
