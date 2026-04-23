import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Public values — the anon key is designed to be exposed; RLS protects data.
const SUPABASE_URL = 'https://tfirlczcgihrqiffsabr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmaXJsY3pjZ2locnFpZmZzYWJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NDY3NjcsImV4cCI6MjA5MDAyMjc2N30._q8AbK6Ql7cZoTTB9ryqEdHLuM42ThSgOTH_vr4tNCE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { flowType: 'pkce', persistSession: false, detectSessionInUrl: false },
});

const i18n = {
  fr: {
    title_loading: 'Vérification du lien…',
    title_invalid: 'Lien invalide',
    hint_invalid: "Ce lien a expiré ou n'est pas valide. Demandez un nouveau lien depuis l'application.",
    title_form: 'Nouveau mot de passe',
    hint_form: 'Choisissez votre nouveau mot de passe.',
    title_success: 'Mot de passe modifié !',
    hint_success: "Vous pouvez maintenant utiliser votre nouveau mot de passe dans l'application.",
    placeholder_password: 'Nouveau mot de passe',
    placeholder_confirm: 'Confirmer le nouveau mot de passe',
    rule_min: '8 caractères minimum',
    rule_upper: 'Une majuscule requise',
    rule_number: 'Un chiffre requis',
    rule_special: 'Un caractère spécial requis (!@#$%^&*)',
    show: 'Afficher',
    hide: 'Masquer',
    save: 'Enregistrer',
    saving: 'Enregistrement…',
    error_fields_required: 'Veuillez remplir les deux champs.',
    error_rules: 'Le mot de passe ne respecte pas les règles.',
    error_mismatch: 'Les mots de passe ne correspondent pas.',
    error_save: 'Impossible de modifier le mot de passe. Réessayez.',
  },
  en: {
    title_loading: 'Verifying the link…',
    title_invalid: 'Invalid link',
    hint_invalid: 'This link has expired or is invalid. Please request a new one from the app.',
    title_form: 'New password',
    hint_form: 'Choose your new password.',
    title_success: 'Password updated!',
    hint_success: 'You can now sign in with your new password in the app.',
    placeholder_password: 'New password',
    placeholder_confirm: 'Confirm new password',
    rule_min: 'Minimum 8 characters',
    rule_upper: 'One uppercase letter required',
    rule_number: 'One number required',
    rule_special: 'One special character required (!@#$%^&*)',
    show: 'Show',
    hide: 'Hide',
    save: 'Save',
    saving: 'Saving…',
    error_fields_required: 'Please fill in both fields.',
    error_rules: 'The password does not meet the rules.',
    error_mismatch: 'The passwords do not match.',
    error_save: 'Could not update the password. Please try again.',
  },
};

const rules = {
  min: (p) => p.length >= 8,
  upper: (p) => /[A-Z]/.test(p),
  number: (p) => /[0-9]/.test(p),
  special: (p) => /[!@#$%^&*]/.test(p),
};

// --- language ---
let currentLang = pickInitialLanguage();

function pickInitialLanguage() {
  const stored = localStorage.getItem('lang');
  if (stored === 'fr' || stored === 'en') return stored;
  return (navigator.language || 'en').toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

function applyLanguage() {
  document.documentElement.lang = currentLang;
  const dict = i18n[currentLang];

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) el.setAttribute('placeholder', dict[key]);
  });

  document.getElementById('lang-fr').classList.toggle('active', currentLang === 'fr');
  document.getElementById('lang-en').classList.toggle('active', currentLang === 'en');
}

document.getElementById('lang-fr').addEventListener('click', () => {
  currentLang = 'fr';
  localStorage.setItem('lang', 'fr');
  applyLanguage();
});
document.getElementById('lang-en').addEventListener('click', () => {
  currentLang = 'en';
  localStorage.setItem('lang', 'en');
  applyLanguage();
});

applyLanguage();

// --- state machine ---
function showState(id) {
  ['state-loading', 'state-invalid', 'state-form', 'state-success'].forEach((s) => {
    document.getElementById(s).classList.toggle('hidden', s !== id);
  });
}

// --- verify code from URL ---
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (!code) {
  showState('state-invalid');
} else {
  supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
    showState(error ? 'state-invalid' : 'state-form');
  });
}

// --- dev state switcher (localhost only) ---
// On localhost we append buttons to cycle through UI states without needing
// a real Supabase session. Hidden on production hosts.
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  const bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#333;color:white;padding:8px;display:flex;gap:8px;justify-content:center;font:13px sans-serif;z-index:9999';
  ['loading', 'form', 'invalid', 'success'].forEach((s) => {
    const b = document.createElement('button');
    b.textContent = s;
    b.style.cssText = 'background:#555;color:white;border:0;padding:6px 12px;border-radius:4px;cursor:pointer';
    b.onclick = () => showState(`state-${s}`);
    bar.appendChild(b);
  });
  document.body.appendChild(bar);
}

// --- live password rule validation ---
const passwordInput = document.getElementById('password');
const ruleElements = document.querySelectorAll('#rules li');

passwordInput.addEventListener('input', () => {
  const value = passwordInput.value;
  ruleElements.forEach((li) => {
    const rule = li.getAttribute('data-rule');
    const ok = rules[rule](value);
    li.classList.toggle('ok', value.length > 0 && ok);
    li.classList.toggle('fail', value.length > 0 && !ok);
  });
});

// --- show/hide password toggle ---
document.querySelectorAll('.toggle-visibility').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.getAttribute('data-target'));
    const showing = target.type === 'text';
    target.type = showing ? 'password' : 'text';
    btn.textContent = i18n[currentLang][showing ? 'show' : 'hide'];
  });
});

// --- form submit ---
const form = document.getElementById('reset-form');
const errorBanner = document.getElementById('error-banner');
const submitBtn = document.getElementById('submit-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBanner.classList.add('hidden');
  const password = passwordInput.value;
  const confirm = document.getElementById('confirm').value;
  const dict = i18n[currentLang];

  if (!password || !confirm) {
    errorBanner.textContent = dict.error_fields_required;
    errorBanner.classList.remove('hidden');
    return;
  }
  const brokenRules = Object.keys(rules).filter((k) => !rules[k](password));
  if (brokenRules.length > 0) {
    errorBanner.textContent = dict.error_rules;
    errorBanner.classList.remove('hidden');
    return;
  }
  if (password !== confirm) {
    errorBanner.textContent = dict.error_mismatch;
    errorBanner.classList.remove('hidden');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = dict.saving;

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    errorBanner.textContent = dict.error_save;
    errorBanner.classList.remove('hidden');
    submitBtn.disabled = false;
    submitBtn.textContent = dict.save;
    return;
  }

  await supabase.auth.signOut();
  showState('state-success');
});
