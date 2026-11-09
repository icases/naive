var current_word;
var current_real;
var bien = 0;
var mal = 0;
var streak = 0;
var lang = 'es';
var translate = false;
var wordListOpen = false;

var dicts = {
    es: 'http://buscon.rae.es/drae/srv/search?val=',
    en: 'http://findwords.info/term/search?query=',
    de: 'http://de.thefreedictionary.com/',
    it: 'http://it.thefreedictionary.com/'
};

var translations = {
    es: {
        languageName: 'español', picker: 'Idioma', howTo: 'Cómo funciona', info: 'Más información',
        heading: '¿Es esto español?', intro: 'Hablas español, pero ¿cómo de bien lo conoces?',
        warning: 'Recuerda: no valen <strong>formas verbales</strong> ni <strong>plurales</strong>, y ojo con las <strong>tildes</strong>.',
        yes: 'Es una palabra real', no: 'Te la has inventado', newWord: 'Nueva palabra',
        score: '¿Cómo lo estás haciendo?', correct: 'bien', incorrect: 'mal', streak: 'racha', showList: 'Ver palabras', hideList: 'Ocultar palabras', restart: 'Empezar de nuevo',
        loading: 'Cargando', loadError: 'No se pudo cargar una palabra. Inténtalo de nuevo.',
        good: '¡Bien!', sorry: '¡Lo siento!', realRight: 'Tienes razón. <b>{word}</b> es una palabra real.', fakeRight: 'Me has pillado. <b>{word}</b> no es una palabra real.', realWrong: 'Aunque no lo parezca, <b>{word}</b> es una palabra real.', fakeWrong: 'Lo siento. <b>{word}</b> no es una palabra real.',
        keyboard: '<b>Atajos:</b> <kbd>Enter</kbd> sí, <kbd>Retroceso</kbd> no, <kbd>l</kbd> lista, <kbd>r</kbd> reiniciar.'
    },
    en: {
        languageName: 'English', picker: 'Language', howTo: 'How it works', info: 'More information',
        heading: 'Is this English?', intro: 'You speak English, but how well do you know it?',
        warning: 'Remember: <strong>verb forms</strong> and <strong>plurals</strong> do not count.',
        yes: 'It is a real word', no: 'You made it up', newWord: 'New word',
        score: 'How are you doing?', correct: 'right', incorrect: 'wrong', streak: 'streak', showList: 'Show words', hideList: 'Hide words', restart: 'Start over',
        loading: 'Loading', loadError: 'A word could not be loaded. Please try again.',
        good: 'Correct!', sorry: 'Sorry!', realRight: 'You are right. <b>{word}</b> is a real word.', fakeRight: 'You caught it. <b>{word}</b> is not a real word.', realWrong: 'Actually, <b>{word}</b> is a real word.', fakeWrong: 'Sorry. <b>{word}</b> is not a real word.',
        keyboard: '<b>Shortcuts:</b> <kbd>Enter</kbd> yes, <kbd>Backspace</kbd> no, <kbd>l</kbd> list, <kbd>r</kbd> restart.'
    },
    it: {
        languageName: 'italiano', picker: 'Lingua', howTo: 'Come funziona', info: 'Maggiori informazioni',
        heading: 'È italiano?', intro: 'Parli italiano, ma quanto lo conosci?',
        warning: 'Ricorda: le <strong>forme verbali</strong> e i <strong>plurali</strong> non valgono.',
        yes: 'È una parola vera', no: 'Te la sei inventata', newWord: 'Nuova parola',
        score: 'Come sta andando?', correct: 'giuste', incorrect: 'sbagliate', streak: 'serie', showList: 'Mostra parole', hideList: 'Nascondi parole', restart: 'Ricomincia',
        loading: 'Caricamento', loadError: 'Non è stato possibile caricare una parola. Riprova.',
        good: 'Bene!', sorry: 'Mi dispiace!', realRight: 'Hai ragione. <b>{word}</b> è una parola vera.', fakeRight: 'L’hai scoperta. <b>{word}</b> non è una parola vera.', realWrong: 'In realtà, <b>{word}</b> è una parola vera.', fakeWrong: 'Mi dispiace. <b>{word}</b> non è una parola vera.',
        keyboard: '<b>Scorciatoie:</b> <kbd>Invio</kbd> sì, <kbd>Backspace</kbd> no, <kbd>l</kbd> elenco, <kbd>r</kbd> ricomincia.'
    },
    de: {
        languageName: 'Deutsch', picker: 'Sprache', howTo: 'So funktioniert es', info: 'Mehr Informationen',
        heading: 'Ist das Deutsch?', intro: 'Du sprichst Deutsch, aber wie gut kennst du es?',
        warning: 'Denk daran: <strong>Verbformen</strong> und <strong>Pluralformen</strong> zählen nicht.',
        yes: 'Das ist ein echtes Wort', no: 'Das hast du erfunden', newWord: 'Neues Wort',
        score: 'Wie läuft es?', correct: 'richtig', incorrect: 'falsch', streak: 'Serie', showList: 'Wörter zeigen', hideList: 'Wörter ausblenden', restart: 'Neu starten',
        loading: 'Wird geladen', loadError: 'Ein Wort konnte nicht geladen werden. Bitte versuche es erneut.',
        good: 'Richtig!', sorry: 'Schade!', realRight: 'Du hast recht. <b>{word}</b> ist ein echtes Wort.', fakeRight: 'Gut erkannt. <b>{word}</b> ist kein echtes Wort.', realWrong: 'Tatsächlich ist <b>{word}</b> ein echtes Wort.', fakeWrong: 'Schade. <b>{word}</b> ist kein echtes Wort.',
        keyboard: '<b>Tastenkürzel:</b> <kbd>Enter</kbd> ja, <kbd>Rücktaste</kbd> nein, <kbd>l</kbd> Liste, <kbd>r</kbd> neu starten.'
    }
};

$(function() {
    getLang();
    restoreScore();
    applyTranslations();
    load_word();

    $('#result').hide();
    updateScore();

    $('#yes').click(function() { check_reply(true); });
    $('#no').click(function() { check_reply(false); });
    $('#new').click(function() { new_word(); });
    $('#toggleList').click(function() {
        wordListOpen = !wordListOpen;
        updateWordListButton();
    });
    $('#restart').click(restart);
    $('#languagePicker').change(function() { switchLanguage($(this).val()); });

    $(document).keyup(function(event) {
        if (event.which === 13) $('#new').is(':visible') ? new_word() : check_reply(true);
        if (event.which === 8 && $('#no').is(':visible')) check_reply(false);
        if (event.which === 68) $('a.last_def').click();
        if (event.which === 84) $('a.last_trans').click();
        if (event.which === 76) $('#toggleList').click();
        if (event.which === 82) restart();
    });
});

function getLang() {
    var requested = new URLSearchParams(window.location.search).get('lang');
    lang = translations[requested] ? requested : 'es';
    translate = lang !== 'es';
}

function applyTranslations() {
    var copy = translations[lang];
    document.documentElement.lang = lang;
    document.title = 'NaiveWord · ' + copy.languageName;
    $('#languagePickerLabel').text(copy.picker);
    $('#languagePicker').val(lang);
    $('#howToLink').text(copy.howTo);
    $('#infoLink').text(copy.info);
    $('#heading').text(copy.heading);
    $('#intro').text(copy.intro);
    $('#warn').html(copy.warning);
    $('#yesLabel').text(copy.yes);
    $('#noLabel').text(copy.no);
    $('#newLabel').text(copy.newWord);
    $('#scoreTitle').text(copy.score);
    $('#correctLabel').text(copy.correct);
    $('#incorrectLabel').text(copy.incorrect);
    $('#streakLabel').text(copy.streak);
    $('#restart').text(copy.restart);
    $('#keyboardHelp').html(copy.keyboard);
    updateWordListButton();
}

function updateWordListButton() {
    var copy = translations[lang];
    $('#toggleList').text(wordListOpen ? copy.hideList : copy.showList);
}

function switchLanguage(language) {
    var url = new URL(window.location.href);
    url.searchParams.set('lang', language);
    window.location.assign(url.pathname + url.search);
}

function restart() {
    $('#word_list').collapse('hide');
    wordListOpen = false;
    bien = 0;
    mal = 0;
    streak = 0;
    saveScore();
    updateScore();
    updateWordListButton();
    new_word();
}

function scoreKey() {
    return 'naiveword:score:' + lang;
}

function restoreScore() {
    try {
        var saved = JSON.parse(window.localStorage.getItem(scoreKey()));
        if (!saved) return;
        bien = Number.isSafeInteger(saved.correct) && saved.correct >= 0 ? saved.correct : 0;
        mal = Number.isSafeInteger(saved.incorrect) && saved.incorrect >= 0 ? saved.incorrect : 0;
        streak = Number.isSafeInteger(saved.streak) && saved.streak >= 0 ? saved.streak : 0;
    } catch (_) {
        bien = 0;
        mal = 0;
        streak = 0;
    }
}

function saveScore() {
    try {
        window.localStorage.setItem(scoreKey(), JSON.stringify({ correct: bien, incorrect: mal, streak: streak }));
    } catch (_) {
        // The game remains usable when browser storage is unavailable.
    }
}

function updateScore() {
    $('#bien').text(bien);
    $('#mal').text(mal);
    $('#streak').text(streak);
}

function load_word() {
    var copy = translations[lang];
    $('#word').html(copy.loading + " <img src='img/spinner3-bluey.gif' alt='Spinner'>");
    fetch('api/word?lang=' + encodeURIComponent(lang))
        .then(function(response) {
            if (!response.ok) throw new Error(copy.loadError);
            return response.json();
        })
        .then(function(data) {
            current_word = data.word;
            current_real = data.real;
            $('#word').text(current_word);
            $('#word').quickfit({max: 80});
            $('#buttons').show();
        })
        .catch(function() {
            $('#word').text(copy.loadError);
        });
}

function add_to_list(result) {
    var string = '<li class="list-group-item"><span>';
    if (current_real) {
        $('ul#word_list li a').removeClass('last_def last_trans');
        string += "<a class='last_def' href='" + encodeURI(dicts[lang] + current_word) + "' target='_blank'>";
    } else {
        string += '<s>';
    }
    string += current_word;
    string += current_real ? '</a>' : '</s>';
    string += '</span>';
    if (result === 'correct') string += '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>';
    if (result === 'incorrect') string += '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>';
    if (translate && current_real) {
        string += "<a class='pull-right last_trans' target='_blank' href='https://translate.google.com/?sl=" + lang + '&tl=es&text=' + encodeURIComponent(current_word) + "'><img src=" + '"img/es.png" alt="Español"></a>';
    }
    string += '</li>';
    $(string).prependTo('#word_list');
}

function message(template) {
    return template.replace('{word}', current_word);
}

function check_reply(answer) {
    var copy = translations[lang];
    $('#buttons').hide();
    if (answer === current_real) {
        $('#exclama').text(copy.good);
        $('#mensaje').html(message(current_real ? copy.realRight : copy.fakeRight));
        bien++;
        streak++;
        add_to_list('correct');
    } else {
        $('#exclama').text(copy.sorry);
        $('#mensaje').html(message(current_real ? copy.realWrong : copy.fakeWrong));
        mal++;
        streak = 0;
        add_to_list('incorrect');
    }
    saveScore();
    updateScore();
    $('#result').show();
}

function new_word() {
    $('#result').hide();
    load_word();
}
