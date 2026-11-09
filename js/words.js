let currentWord = '';
let currentReal = false;
let correct = 0;
let incorrect = 0;
let streak = 0;
let language = 'es';
let listOpen = false;

const dictionaries = {
  es: 'https://dle.rae.es/',
  en: 'https://en.wiktionary.org/wiki/',
  de: 'https://de.wiktionary.org/wiki/',
  it: 'https://it.wiktionary.org/wiki/'
};

const translations = {
  es: { languageName: 'español', picker: 'Idioma', howTo: 'Cómo funciona', info: 'Más información', heading: '¿Es esto español?', intro: 'Hablas español, pero ¿cómo de bien lo conoces?', warning: 'Recuerda: no valen <strong>formas verbales</strong> ni <strong>plurales</strong>, y ojo con las <strong>tildes</strong>.', yes: 'Es una palabra real', no: 'Te la has inventado', newWord: 'Nueva palabra', score: '¿Cómo lo estás haciendo?', correct: 'bien', incorrect: 'mal', streak: 'racha', showList: 'Ver palabras', hideList: 'Ocultar palabras', restart: 'Empezar de nuevo', loading: 'Cargando…', loadError: 'No se pudo cargar una palabra. Inténtalo de nuevo.', good: '¡Bien!', sorry: '¡Lo siento!', realRight: 'Tienes razón. <b>{word}</b> es una palabra real.', fakeRight: 'Me has pillado. <b>{word}</b> no es una palabra real.', realWrong: 'Aunque no lo parezca, <b>{word}</b> es una palabra real.', fakeWrong: 'Lo siento. <b>{word}</b> no es una palabra real.', keyboard: '<strong>Atajos:</strong> <kbd>Enter</kbd> sí, <kbd>Retroceso</kbd> no, <kbd>l</kbd> lista, <kbd>r</kbd> reiniciar.' },
  en: { languageName: 'English', picker: 'Language', howTo: 'How it works', info: 'More information', heading: 'Is this English?', intro: 'You speak English, but how well do you know it?', warning: 'Remember: <strong>verb forms</strong> and <strong>plurals</strong> do not count.', yes: 'It is a real word', no: 'You made it up', newWord: 'New word', score: 'How are you doing?', correct: 'right', incorrect: 'wrong', streak: 'streak', showList: 'Show words', hideList: 'Hide words', restart: 'Start over', loading: 'Loading…', loadError: 'A word could not be loaded. Please try again.', good: 'Correct!', sorry: 'Sorry!', realRight: 'You are right. <b>{word}</b> is a real word.', fakeRight: 'You caught it. <b>{word}</b> is not a real word.', realWrong: 'Actually, <b>{word}</b> is a real word.', fakeWrong: 'Sorry. <b>{word}</b> is not a real word.', keyboard: '<strong>Shortcuts:</strong> <kbd>Enter</kbd> yes, <kbd>Backspace</kbd> no, <kbd>l</kbd> list, <kbd>r</kbd> restart.' },
  it: { languageName: 'italiano', picker: 'Lingua', howTo: 'Come funziona', info: 'Maggiori informazioni', heading: 'È italiano?', intro: 'Parli italiano, ma quanto lo conosci?', warning: 'Ricorda: le <strong>forme verbali</strong> e i <strong>plurali</strong> non valgono.', yes: 'È una parola vera', no: 'Te la sei inventata', newWord: 'Nuova parola', score: 'Come sta andando?', correct: 'giuste', incorrect: 'sbagliate', streak: 'serie', showList: 'Mostra parole', hideList: 'Nascondi parole', restart: 'Ricomincia', loading: 'Caricamento…', loadError: 'Non è stato possibile caricare una parola. Riprova.', good: 'Bene!', sorry: 'Mi dispiace!', realRight: 'Hai ragione. <b>{word}</b> è una parola vera.', fakeRight: 'L’hai scoperta. <b>{word}</b> non è una parola vera.', realWrong: 'In realtà, <b>{word}</b> è una parola vera.', fakeWrong: 'Mi dispiace. <b>{word}</b> non è una parola vera.', keyboard: '<strong>Scorciatoie:</strong> <kbd>Invio</kbd> sì, <kbd>Backspace</kbd> no, <kbd>l</kbd> elenco, <kbd>r</kbd> ricomincia.' },
  de: { languageName: 'Deutsch', picker: 'Sprache', howTo: 'So funktioniert es', info: 'Mehr Informationen', heading: 'Ist das Deutsch?', intro: 'Du sprichst Deutsch, aber wie gut kennst du es?', warning: 'Denk daran: <strong>Verbformen</strong> und <strong>Pluralformen</strong> zählen nicht.', yes: 'Das ist ein echtes Wort', no: 'Das hast du erfunden', newWord: 'Neues Wort', score: 'Wie läuft es?', correct: 'richtig', incorrect: 'falsch', streak: 'Serie', showList: 'Wörter zeigen', hideList: 'Wörter ausblenden', restart: 'Neu starten', loading: 'Wird geladen…', loadError: 'Ein Wort konnte nicht geladen werden. Bitte versuche es erneut.', good: 'Richtig!', sorry: 'Schade!', realRight: 'Du hast recht. <b>{word}</b> ist ein echtes Wort.', fakeRight: 'Gut erkannt. <b>{word}</b> ist kein echtes Wort.', realWrong: 'Tatsächlich ist <b>{word}</b> ein echtes Wort.', fakeWrong: 'Schade. <b>{word}</b> ist kein echtes Wort.', keyboard: '<strong>Tastenkürzel:</strong> <kbd>Enter</kbd> ja, <kbd>Rücktaste</kbd> nein, <kbd>l</kbd> Liste, <kbd>r</kbd> neu starten.' }
};

const byId = (id) => document.getElementById(id);
const copy = () => translations[language];

document.addEventListener('DOMContentLoaded', () => {
  const requested = new URLSearchParams(window.location.search).get('lang');
  language = translations[requested] ? requested : 'es';
  restoreScore();
  translatePage();
  updateScore();
  loadWord();

  byId('yes').addEventListener('click', () => checkAnswer(true));
  byId('no').addEventListener('click', () => checkAnswer(false));
  byId('new').addEventListener('click', loadWord);
  byId('restart').addEventListener('click', restart);
  byId('toggleList').addEventListener('click', toggleList);
  byId('languagePicker').addEventListener('change', (event) => switchLanguage(event.target.value));
  document.addEventListener('keyup', onKeyUp);
  window.addEventListener('resize', fitWord);
});

function translatePage() {
  const text = copy();
  document.documentElement.lang = language;
  document.title = `NaiveWord · ${text.languageName}`;
  byId('languagePickerLabel').textContent = text.picker;
  byId('languagePicker').value = language;
  byId('howToLink').textContent = text.howTo;
  byId('infoLink').textContent = text.info;
  byId('heading').textContent = text.heading;
  byId('intro').textContent = text.intro;
  byId('warn').innerHTML = text.warning;
  byId('yesLabel').textContent = text.yes;
  byId('noLabel').textContent = text.no;
  byId('newLabel').textContent = text.newWord;
  byId('scoreTitle').textContent = text.score;
  byId('correctLabel').textContent = text.correct;
  byId('incorrectLabel').textContent = text.incorrect;
  byId('streakLabel').textContent = text.streak;
  byId('restart').textContent = text.restart;
  byId('keyboardHelp').innerHTML = text.keyboard;
  byId('toggleList').textContent = listOpen ? text.hideList : text.showList;
}

function switchLanguage(nextLanguage) {
  const url = new URL(window.location.href);
  url.searchParams.set('lang', nextLanguage);
  window.location.assign(`${url.pathname}${url.search}`);
}

function scoreKey() { return `naiveword:score:${language}`; }

function restoreScore() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(scoreKey()));
    if (!saved) return;
    correct = Number.isSafeInteger(saved.correct) && saved.correct >= 0 ? saved.correct : 0;
    incorrect = Number.isSafeInteger(saved.incorrect) && saved.incorrect >= 0 ? saved.incorrect : 0;
    streak = Number.isSafeInteger(saved.streak) && saved.streak >= 0 ? saved.streak : 0;
  } catch (_) { correct = 0; incorrect = 0; streak = 0; }
}

function saveScore() {
  try { window.localStorage.setItem(scoreKey(), JSON.stringify({ correct, incorrect, streak })); } catch (_) { /* Storage is optional. */ }
}

function updateScore() {
  byId('bien').textContent = correct;
  byId('mal').textContent = incorrect;
  byId('streak').textContent = streak;
}

async function loadWord() {
  const text = copy();
  byId('word').textContent = text.loading;
  byId('buttons').hidden = true;
  byId('result').hidden = true;
  try {
    const response = await fetch(`api/word?lang=${encodeURIComponent(language)}`);
    if (!response.ok) throw new Error(text.loadError);
    const data = await response.json();
    currentWord = data.word;
    currentReal = data.real;
    byId('word').textContent = currentWord;
    requestAnimationFrame(fitWord);
    byId('buttons').hidden = false;
  } catch (_) { byId('word').textContent = text.loadError; }
}

function fitWord() {
  const word = byId('word');
  if (!word || !currentWord) return;

  const minimumSize = 14;
  let fontSize = Math.min(86, Math.max(minimumSize, word.clientWidth / 3));
  word.style.fontSize = `${fontSize}px`;
  word.style.letterSpacing = 'normal';

  while (word.scrollWidth > word.clientWidth && fontSize > minimumSize) {
    fontSize -= 1;
    word.style.fontSize = `${fontSize}px`;
  }

  if (word.scrollWidth > word.clientWidth) word.style.letterSpacing = '-0.05em';
}

function checkAnswer(answer) {
  if (byId('buttons').hidden) return;
  const text = copy();
  const right = answer === currentReal;
  byId('buttons').hidden = true;
  byId('exclama').textContent = right ? text.good : text.sorry;
  byId('mensaje').innerHTML = (right ? (currentReal ? text.realRight : text.fakeRight) : (currentReal ? text.realWrong : text.fakeWrong)).replace('{word}', currentWord);
  if (right) { correct += 1; streak += 1; } else { incorrect += 1; streak = 0; }
  appendWord(right);
  saveScore();
  updateScore();
  byId('result').hidden = false;
}

function appendWord(right) {
  const item = document.createElement('li');
  const word = currentReal ? document.createElement('a') : document.createElement('s');
  word.textContent = currentWord;
  if (currentReal) {
    word.href = `${dictionaries[language]}${encodeURIComponent(currentWord)}`;
    word.target = '_blank';
    word.rel = 'noopener';
  }
  item.append(word);
  const outcome = document.createElement('span');
  outcome.textContent = right ? '✓' : '✕';
  outcome.setAttribute('aria-label', right ? copy().correct : copy().incorrect);
  item.append(outcome);
  if (language !== 'es' && currentReal) {
    const translation = document.createElement('a');
    translation.href = `https://translate.google.com/?sl=${language}&tl=es&text=${encodeURIComponent(currentWord)}`;
    translation.target = '_blank';
    translation.rel = 'noopener';
    translation.textContent = 'ES';
    item.append(translation);
  }
  byId('word_list').prepend(item);
}

function toggleList() {
  listOpen = !listOpen;
  byId('word_list').hidden = !listOpen;
  byId('toggleList').setAttribute('aria-expanded', String(listOpen));
  byId('toggleList').textContent = listOpen ? copy().hideList : copy().showList;
}

function restart() {
  correct = 0;
  incorrect = 0;
  streak = 0;
  byId('word_list').replaceChildren();
  if (listOpen) toggleList();
  saveScore();
  updateScore();
  loadWord();
}

function onKeyUp(event) {
  if (event.target.matches('select, input, textarea')) return;
  if (event.key === 'Enter') {
    event.preventDefault();
    byId('result').hidden ? checkAnswer(true) : loadWord();
  }
  if (event.key === 'Backspace') checkAnswer(false);
  if (event.key.toLowerCase() === 'l') toggleList();
  if (event.key.toLowerCase() === 'r') restart();
}
